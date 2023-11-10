import {
  EVENT_LOGGING_EVENTS,
  EventLoggingRequest,
  FormSgRecipientNotificationDeliveryFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  maskUin,
} from '@filesg/backend-common';
import {
  ACTIVITY_TYPE,
  FEATURE_TOGGLE,
  FORMSG_FAIL_CATEGORY,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  TRANSACTION_CREATION_METHOD,
} from '@filesg/common';
import { NotificationRequestDetails, SgNotify } from '@filesg/sg-notify';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../consts';
import { Activity } from '../../../entities/activity';
import { NotificationMessageInput } from '../../../entities/notification-message-input';
import { CitizenUser } from '../../../entities/user';
import { SgNotifyIssuanceArgs } from '../../../typings/common';
import { NotificationHistoryEntityService } from '../../entities/notification-history/notification-history.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { BaseNotificationService } from './notification.class';
import { SG_NOTIFY_PROVIDER } from './sg-notify.provider';

@Injectable()
export class SgNotifyService implements BaseNotificationService {
  private readonly logger = new Logger(SgNotifyService.name);

  constructor(
    @Inject(SG_NOTIFY_PROVIDER) private readonly sgNotifyLib: SgNotify,
    private readonly fileSgConfigService: FileSGConfigService,
    private readonly notificationHistoryEntityService: NotificationHistoryEntityService,
    @Inject(EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER) private readonly eventLogsServiceApiClient: AxiosInstance,
  ) {}

  public async sendNotification(activity: Activity, notificationMessageInput: NotificationMessageInput): Promise<void> {
    const { sgNotifyToggleSend } = this.fileSgConfigService.notificationConfig;
    this.logger.debug(`Sending Sg-Notify Notification is toggled ${sgNotifyToggleSend}`);

    if (sgNotifyToggleSend === FEATURE_TOGGLE.OFF) {
      return;
    }

    let errorMessage: string | null = null;
    let messageId: string | null = null;

    const { uuid, user, transaction, recipientInfo, type } = activity;
    const { uin } = user as CitizenUser;
    const maskedUin = maskUin(uin);

    const taskMessage = `Sending Sg-Notify notification to recipient: ${maskedUin}`;
    this.logger.log(taskMessage);

    try {
      const { externalRefId } = transaction!.application!;
      const agencyCode = transaction!.application!.eservice!.agency!.code;
      const { templateInput, notificationMessageTemplate } = notificationMessageInput;

      const issuanceInput: SgNotifyIssuanceArgs = {
        recipientName: recipientInfo!.name,
        externalRefId: externalRefId ? externalRefId : '-',
        activityUuid: uuid,
      };

      const notificationRequestDetails: NotificationRequestDetails = {
        uin,
        channel_mode: 'SPM',
        delivery: 'IMMEDIATE',
        template_layout: [
          {
            template_id: notificationMessageTemplate!.externalTemplateId!,
            template_input: { ...issuanceInput, ...templateInput! },
          },
        ],
        title: transaction!.name,
        sender_name: agencyCode,
        sender_logo_small: `${
          this.fileSgConfigService.systemConfig.fileSGBaseURL
        }/assets/images/icons/agency/${agencyCode.toLowerCase()}/emblem.png`,
        category: 'MESSAGES',
        priority: 'HIGH',
        cta: [
          {
            action_name: 'Open in FileSG',
            action_url: this.fileSgConfigService.notificationConfig.sgNotifyRetrievalPageUrl,
            action_type: 'HYPERLINK',
          },
        ],
      };

      const response = await this.sgNotifyLib.sendNotification(notificationRequestDetails);

      if (transaction!.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG && type === ACTIVITY_TYPE.RECEIVE_TRANSFER) {
        await this.saveEventLogs(EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS, transaction!.uuid, uuid, maskedUin);
      }

      messageId = response.request_id;
      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error) {
      errorMessage = (error as Error).message;
      this.logger.warn(`[Failed] ${taskMessage}, error: ${errorMessage}`);

      if (transaction!.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG && type === ACTIVITY_TYPE.RECEIVE_TRANSFER) {
        await this.saveEventLogs(
          EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
          transaction!.uuid,
          uuid,
          maskedUin,
          FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
          errorMessage,
        );
      }
    }

    // Save notificaiton history
    // TODO: should log input? what if fail and wanna patch back
    try {
      await this.notificationHistoryEntityService.insertNotificationHistories([
        {
          notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
          activity,
          status: errorMessage ? NOTIFICATION_STATUS.FAILED : NOTIFICATION_STATUS.SUCCESS,
          statusDetails: errorMessage ?? `Sg-Notify send notification call successful`,
          messageId,
        },
      ]);
    } catch (error) {
      const errorMessage = (error as Error).message;
      this.logger.warn(`Error saving notification history: ${errorMessage}`);
    }
  }

  protected async saveEventLogs(eventType: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS, transactionUuid: string, recipientActivityUuid: string, maskedUin: string): Promise<void> // prettier-ignore
  protected async saveEventLogs(eventType: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE, transactionUuid: string, recipientActivityUuid: string, maskedUin: string, failSubType: string, failedReason: string): Promise<void> // prettier-ignore
  protected async saveEventLogs(
    eventType:
      | EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS
      | EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
    transactionUuid: string,
    recipientActivityUuid: string,
    maskedUin: string,
    failSubType?: string,
    failedReason?: string,
  ): Promise<void> {
    try {
      const event: FormSgRecipientNotificationDeliverySuccessEvent | FormSgRecipientNotificationDeliveryFailureEvent =
        eventType === EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS
          ? {
              type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
              channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
              transactionUuid,
              recipientActivityUuid,
              maskedUin,
            }
          : {
              type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
              channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
              transactionUuid,
              recipientActivityUuid,
              maskedUin,
              failSubType: failSubType!,
              failedReason: failedReason!,
            };

      await this.eventLogsServiceApiClient.post<void, AxiosResponse<void>, EventLoggingRequest>('v1/events', { event });
    } catch (error) {
      const errorMessage = `[EventLogs][SgNotifyService] Saving to event logs failed, transactionUuid: ${transactionUuid}, error: ${
        (error as AxiosError).message
      }`;

      this.logger.error(errorMessage);
    }
  }
}
