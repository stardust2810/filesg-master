import { InputValidationException, LogMethod } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  IssuanceQueryRequest,
  IssuanceQueryResponse,
  NOTIFICATION_TEMPLATE_TYPE,
  ResendNotificationRequest,
  VIEWABLE_ACTIVITY_TYPES,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { endOfDay, startOfDay } from 'date-fns';

import { ActivityNotBannedException } from '../../../common/filters/custom-exceptions.filter';
import { transformIssuanceQueryResponse } from '../../../common/transformers/system.transformer';
import { Application } from '../../../entities/application';
import { ActivityRecipientInfo } from '../../../typings/common';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { ApplicationEntityService } from '../../entities/application/application.entity.service';
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
    private readonly applicationEntityService: ApplicationEntityService,
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

    const { status, recipientInfo } = activity;
    if (status !== ACTIVITY_STATUS.COMPLETED) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.SYSTEM, `Activity with invalid status provided, stauts: ${status}`);
    }

    const emailAddress = recipientInfo?.email;
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

  @LogMethod()
  public async issuanceQuery({
    externalRefId,
    activityUuid,
    recipientName,
    recipientEmail,
    agencyCode,
    startDateString,
    endDateString,
  }: IssuanceQueryRequest): Promise<IssuanceQueryResponse> {
    let searchValue;
    const result: Application[] = [];
    if (externalRefId) {
      const application = await this.applicationEntityService.retrieveApplicationWithTransactionsAndActivitiesDetailsByExternalRefId(
        externalRefId,
        VIEWABLE_ACTIVITY_TYPES,
      );

      if (application) {
        const result = await this.processApplicationsDataToIssuanceQueryResponse([application], 'externalRefId');
        if (result) {
          return result;
        }
      }
    }

    if (activityUuid) {
      const applications =
        await this.applicationEntityService.retrieveApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes(
          activityUuid,
          VIEWABLE_ACTIVITY_TYPES,
        );
      const result = await this.processApplicationsDataToIssuanceQueryResponse(applications, 'activityUuid');
      if (result) {
        return result;
      }
    }

    if (recipientName) {
      const applications = await this.applicationEntityService.retrieveApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo(
        recipientName,
        agencyCode,
        { startDate: startOfDay(new Date(startDateString)), endDate: endOfDay(new Date(endDateString)) },
        VIEWABLE_ACTIVITY_TYPES,
      );
      const result = await this.processApplicationsDataToIssuanceQueryResponse(
        applications,
        'recipientName',
        agencyCode,
        startDateString,
        endDateString,
      );
      if (result) {
        return result;
      }
    }

    if (recipientEmail) {
      const applications = await this.applicationEntityService.retrieveApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo(
        recipientEmail,
        agencyCode,
        { startDate: startOfDay(new Date(startDateString)), endDate: endOfDay(new Date(endDateString)) },
        VIEWABLE_ACTIVITY_TYPES,
      );
      const result = await this.processApplicationsDataToIssuanceQueryResponse(
        applications,
        'recipientEmail',
        agencyCode,
        startDateString,
        endDateString,
      );
      if (result) {
        return result;
      }
    }

    return transformIssuanceQueryResponse(result, searchValue);
  }

  private async processApplicationsDataToIssuanceQueryResponse(
    applications: Application[],
    searchValue: string,
    agencyCode?: string,
    startDateString?: string,
    endDateString?: string,
  ) {
    const applicationsIds = applications.map((e) => e.id);
    if (applicationsIds.length) {
      const result = await this.applicationEntityService.retrieveApplicationsWithTransactionsAndActivitiesDetailsByIds(
        applicationsIds,
        VIEWABLE_ACTIVITY_TYPES,
      );
      return transformIssuanceQueryResponse(result, searchValue, agencyCode, startDateString, endDateString);
    }
    return false;
  }
}
