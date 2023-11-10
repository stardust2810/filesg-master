import { LogMethod } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  NOTIFICATION_TEMPLATE_TYPE,
  ResendNotificationRequest,
  VIEWABLE_ACTIVITY_TYPES,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { ActivityNotBannedException, RecalledActivityException } from '../../../common/filters/custom-exceptions.filter';
import { ActivityRecipientInfo } from '../../../typings/common';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { EmailBlackListEntityService } from '../../entities/email-black-list/email-black-list.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  constructor(
    private readonly activityEntityService: ActivityEntityService,
    private readonly notificationService: NotificationService,
    private readonly emailBlackListEntityService: EmailBlackListEntityService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  /*
  Pre-requisites for this method:
  1. Email to be sent to same email address (soft-bounce only)
  2. Transaction exists
  3. already done manual investigation and manually removed from aws suppression list if required
  */
  @LogMethod()
  public async resendNotification({ activityUuid }: ResendNotificationRequest) {
    //Fetching activity based on the uuid. If not found immediately throw error.
    const [activity] = await this.activityEntityService.retrieveActivitiesDetailsRequiredForEmail(
      [activityUuid],
      ACTIVITY_TYPE.RECEIVE_TRANSFER,
      {
        toThrow: true,
      },
    );

    if (activity.status === ACTIVITY_STATUS.RECALLED) {
      throw new RecalledActivityException(COMPONENT_ERROR_CODE.SYSTEM, activityUuid);
    }

    const emailAddress = activity.recipientInfo?.email;
    if (emailAddress) {
      await this.emailBlackListEntityService.deleteBlackListedEmail(emailAddress);
    }
    await this.notificationService.processNotifications([activityUuid], { templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE });
  }

  @LogMethod()
  public async lift1FaBan(activityUuid: string) {
    const { max1FaVerificationAttemptCount } = this.fileSGConfigService.nonSingpassAuthConfig;

    // throws 404 if not found
    const activity = await this.activityEntityService.retrieveActivityByUuidAndStatusAndTypes(
      activityUuid,
      ACTIVITY_STATUS.COMPLETED,
      VIEWABLE_ACTIVITY_TYPES,
    );

    // throws 400 if activity is not banned for 1fa
    // not banned || banned but
    if (!activity.isBannedFromNonSingpassVerification) {
      this.logger.warn(`${activityUuid} is not banned from 1Fa verification`);
      throw new ActivityNotBannedException(COMPONENT_ERROR_CODE.SYSTEM, activityUuid, '1fa');
    }
    if (
      typeof activity.recipientInfo?.failedAttempts === 'number' &&
      activity.recipientInfo?.failedAttempts < max1FaVerificationAttemptCount
    ) {
      this.logger.warn(`${activityUuid} is not banned from 1Fa verification; failed attempts has not reached maximum`);
      throw new ActivityNotBannedException(
        COMPONENT_ERROR_CODE.SYSTEM,
        activityUuid,
        '1fa',
        `Failed attempts count has not reached the maximum.`,
      );
    }

    const { recipientInfo } = activity;

    const updatedRecipientInfo: ActivityRecipientInfo = { ...recipientInfo!, failedAttempts: 0 };

    await this.activityEntityService.updateActivity(activityUuid, {
      recipientInfo: updatedRecipientInfo,
      isBannedFromNonSingpassVerification: false,
    });
  }

  @LogMethod()
  public async lift2FaBan(activityUuid: string) {
    const { max1FaVerificationAttemptCount } = this.fileSGConfigService.nonSingpassAuthConfig;

    // throws 404 if not found
    const activity = await this.activityEntityService.retrieveActivityByUuidAndStatusAndTypes(
      activityUuid,
      ACTIVITY_STATUS.COMPLETED,
      VIEWABLE_ACTIVITY_TYPES,
    );

    // throws 400 if activity is not banned
    // throws 400 if activity is banned for 1fa
    if (!activity.isBannedFromNonSingpassVerification) {
      this.logger.warn(`${activityUuid} is not banned from 2Fa verification`);
      throw new ActivityNotBannedException(COMPONENT_ERROR_CODE.SYSTEM, activityUuid, '2fa');
    }
    if (
      typeof activity.recipientInfo?.failedAttempts === 'number' &&
      activity.recipientInfo?.failedAttempts >= max1FaVerificationAttemptCount
    ) {
      this.logger.warn(`${activityUuid} is not banned from 2Fa verification, failedAttempts exceed maximum`);
      throw new ActivityNotBannedException(COMPONENT_ERROR_CODE.SYSTEM, activityUuid, '2fa', `Failed attempts exceeded maximum.`);
    }

    await this.activityEntityService.updateActivity(activityUuid, {
      isBannedFromNonSingpassVerification: false,
    });
  }
}
