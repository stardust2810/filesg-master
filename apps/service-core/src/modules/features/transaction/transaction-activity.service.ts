import { EntityNotFoundException, InputValidationException, LogMethod } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  CompletedActivitiesRequestDto,
  COMPONENT_ERROR_CODE,
  FEATURE_TOGGLE,
  NOTIFICATION_TEMPLATE_TYPE,
  UpdateRecipientInfoRequest,
  ValidateActivityNonSingpassRetrievableResponse,
  VIEWABLE_ACTIVITY_TYPES,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import {
  ActivityAcknowledgementNotRequiredException,
  ActivityHadAlreadyBeenAcknowledgedException,
} from '../../../common/filters/custom-exceptions.filter';
import { EmailInBlackListException } from '../../../common/filters/custom-exceptions.filter';
import { transformActivitiesResponse, transformActivityDetailsResponse } from '../../../common/transformers/activity.transformer';
import { Activity } from '../../../entities/activity';
import { ProgrammaticUser } from '../../../entities/user';
import { ActivityRecipientInfo } from '../../../typings/common';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { EmailBlackListService } from '../email/email-black-list.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class TransactionActivityService {
  private readonly logger = new Logger(TransactionActivityService.name);

  constructor(
    private readonly activityEntityService: ActivityEntityService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly userEntityService: UserEntityService,
    private readonly notificationService: NotificationService,
    private readonly emailBlackListService: EmailBlackListService,
  ) {}

  @LogMethod()
  public async retrieveActivities(userId: number, query: CompletedActivitiesRequestDto) {
    const { activities, count, next } = await this.activityEntityService.retrieveCompletedActivitiesByUserId(userId, query);

    return transformActivitiesResponse(activities, count, next);
  }

  @LogMethod()
  public async retrieveActivityDetails(activityUuid: string, userId: number) {
    const activity = await this.activityEntityService.retrieveActivityByUuidAndStatusAndTypes(
      activityUuid,
      ACTIVITY_STATUS.COMPLETED,
      VIEWABLE_ACTIVITY_TYPES,
      userId,
    );

    return transformActivityDetailsResponse(activity);
  }

  @LogMethod()
  public async validateActivityNonSingpassRetrievable(uuid: string): Promise<ValidateActivityNonSingpassRetrievableResponse> {
    const activity = await this.activityEntityService.retrieveActivityByUuidAndStatusAndTypes(
      uuid,
      ACTIVITY_STATUS.COMPLETED,
      VIEWABLE_ACTIVITY_TYPES,
    );

    const { recipientInfo, isBannedFromNonSingpassVerification } = activity;

    const isNonSingpassRetrievable = !!(recipientInfo!.mobile && recipientInfo!.dob);
    return { isNonSingpassRetrievable, isBannedFromNonSingpassVerification };
  }

  public async acknowledgeActivity(activityUuid: string, userId: number): Promise<void> {
    const activityAcknowledgementDetails = await this.activityEntityService.retrieveActivityAcknowledgementDetailsByUuidAndStatusAndTypes(
      activityUuid,
      ACTIVITY_STATUS.COMPLETED,
      VIEWABLE_ACTIVITY_TYPES,
      userId,
    );

    const { isAcknowledgementRequired, acknowledgedAt } = activityAcknowledgementDetails;

    if (!isAcknowledgementRequired) {
      throw new ActivityAcknowledgementNotRequiredException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, activityUuid);
    }

    if (acknowledgedAt) {
      if (this.fileSGConfigService.systemConfig.toggleActivityAcknowledgementReset === FEATURE_TOGGLE.OFF) {
        throw new ActivityHadAlreadyBeenAcknowledgedException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, activityUuid);
      }

      /**
       * Do the reset here instead of at the end to cater for bp7 in perf test, whereby there is a need to
       * download the files after acknowledgement. Hence, cannot just update acknowledgedAt back to null after
       * setting it to a new date as it could cause the activity files unavailable for download.
       */
      await this.activityEntityService.updateActivity(activityUuid, { acknowledgedAt: null });
    }

    await this.activityEntityService.updateActivity(activityUuid, { acknowledgedAt: new Date() });
  }

  @LogMethod()
  public async updateRecipientInfo(userId: number, activityUuid: string, updatedInfo: UpdateRecipientInfoRequest) {
    const issuer = (await this.userEntityService.retrieveUserWithEserviceAndAgencyById(userId)) as ProgrammaticUser;
    const existingActivity = await this.retrieveActivityForUpdateInfo(activityUuid, issuer);
    const logMsg = `Updating Activity (${activityUuid}) recipientInfo from ${JSON.stringify(
      existingActivity.recipientInfo,
    )} to ${JSON.stringify(updatedInfo)}`;

    this.logger.log(logMsg);

    if (updatedInfo.email && (await this.emailBlackListService.isEmailBlackListed(updatedInfo.email))) {
      throw new EmailInBlackListException(COMPONENT_ERROR_CODE.TRANSACTION_ACTIVITY_SERVICE, [updatedInfo.email]);
    }

    const existingRecipientInfo = existingActivity.recipientInfo!;
    const { isNewEmail } = this.updateActivityRecipientInfo(existingRecipientInfo, updatedInfo);

    await this.activityEntityService.updateActivity(activityUuid, {
      recipientInfo: existingRecipientInfo,
    });

    this.logger.log(`[SUCCEED] ${logMsg}`);

    // Since existingActivity.recipientInfo is directly mutated, we can use it for sending email
    if (isNewEmail && existingRecipientInfo.email) {
      await this.notificationService.processNotifications([existingActivity.id], { templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE });
    }
  }

  protected async retrieveActivityForUpdateInfo(activityUuid: string, issuer: ProgrammaticUser): Promise<Activity> {
    const issuerEserviceIds = issuer.eservices?.map(({ id }) => id) ?? [];

    // using retrieveActivitiesDetailsRequiredForEmail so that no need to fetch again when sending email
    const activity = (
      await this.activityEntityService.retrieveActivitiesDetailsRequiredForEmail([activityUuid], ACTIVITY_TYPE.RECEIVE_TRANSFER)
    )[0];

    if (
      !activity ||
      activity.status !== ACTIVITY_STATUS.COMPLETED ||
      !issuerEserviceIds.includes(activity.transaction!.application!.eservice!.id)
    ) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.TRANSACTION_ACTIVITY_SERVICE,
        Activity.name,
        'uuid, eserviceIds, type, status',
        `${activityUuid}, ${issuerEserviceIds.join(',')}, ${ACTIVITY_TYPE.RECEIVE_TRANSFER}, ${ACTIVITY_STATUS.COMPLETED}`,
      );
    }

    return activity;
  }

  /**
   * This is a mutable function that updates directly into existingRecipientInfo
   *
   */
  protected updateActivityRecipientInfo(
    existingRecipientInfo: ActivityRecipientInfo,
    updatedInfo: UpdateRecipientInfoRequest,
  ): { isNewEmail: boolean; isNewContact: boolean; isNewDob: boolean } {
    // No email/contact in existingRecipientInfo is undefined while in updatedInfo is null, hence need more thorough checking
    const isNewEmail =
      updatedInfo.email === null ? existingRecipientInfo.email !== undefined : existingRecipientInfo.email !== updatedInfo.email;
    const isNewContact =
      updatedInfo.contact === null ? existingRecipientInfo.mobile !== undefined : existingRecipientInfo.mobile !== updatedInfo.contact;
    const isNewDob = updatedInfo.dob === null ? existingRecipientInfo.dob !== undefined : existingRecipientInfo.dob !== updatedInfo.dob;

    if (!isNewEmail && !isNewContact && !isNewDob) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_ACTIVITY_SERVICE,
        'All email, contact and dob are same as existing',
      );
    }

    if (updatedInfo.email === null) {
      // Deleting the key instead of just overwriting it with undefined
      delete existingRecipientInfo.email;
    } else {
      existingRecipientInfo.email = updatedInfo.email.trim();
    }

    if (updatedInfo.contact === null) {
      // Deleting the key instead of just overwriting it with undefined
      delete existingRecipientInfo.mobile;
    } else {
      existingRecipientInfo.mobile = updatedInfo.contact.trim();
    }

    if (updatedInfo.dob === null) {
      // Deleting the key instead of just overwriting it with undefined
      delete existingRecipientInfo.dob;
    } else {
      existingRecipientInfo.dob = updatedInfo.dob;
    }

    return {
      isNewEmail,
      isNewContact,
      isNewDob,
    };
  }
}
