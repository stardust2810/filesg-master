import { BouncedRecipient, SES_NOTIFICATION_TYPE, SESEmailNotificationMessage } from '@filesg/aws';
import {
  EVENT_LOGGING_EVENTS,
  EventLoggingRequest,
  FormSgRecipientNotificationDeliveryFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  maskUin,
} from '@filesg/backend-common';
import {
  ACTIVITY_TYPE,
  FORMSG_FAIL_CATEGORY,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  TRANSACTION_CREATION_METHOD,
} from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../../consts';
import { EmailBlackListEntityService } from '../../../../entities/email-black-list/email-black-list.entity.service';
import { NotificationHistoryEntityService } from '../../../../entities/notification-history/notification-history.entity.service';

@Injectable()
export class TransactionalEmailHandlerService {
  protected logger = new Logger(TransactionalEmailHandlerService.name);

  constructor(
    private readonly notificationHistoryEntityService: NotificationHistoryEntityService,
    private readonly emailBlackListService: EmailBlackListEntityService,
    @Inject(EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER) private readonly eventLogsServiceApiClient: AxiosInstance,
  ) {}

  public async processMessage(message: SESEmailNotificationMessage, isUsingRedis?: boolean) {
    const { notificationType, mail, bounce, complaint } = message;
    const { messageId, destination } = mail;

    const emails = destination.join(' | ');

    this.logger.log(
      `[TransactionalEmailHandler] Processing message, SES MessageId: ${messageId}, Email: ${emails}, Delivery Status: ${notificationType}`,
    );

    let status: NOTIFICATION_STATUS = NOTIFICATION_STATUS.SUCCESS;
    let statusDetails = '';

    switch (notificationType) {
      case SES_NOTIFICATION_TYPE.BOUNCE: {
        status = NOTIFICATION_STATUS.FAILED;
        statusDetails = `Bounce Type: ${bounce!.bounceType}, Bounce SubType: ${bounce!.bounceSubType}`;
        break;
      }

      case SES_NOTIFICATION_TYPE.COMPLAINT: {
        status = NOTIFICATION_STATUS.FAILED;
        statusDetails = `Complaint Feedback Type: ${complaint!.complaintFeedbackType}, Compliant SubType: ${
          complaint!.complaintSubType || ''
        }`;
        break;
      }

      case SES_NOTIFICATION_TYPE.DELIVERY: {
        statusDetails = `Delivery successful`;
        break;
      }
    }

    if (isUsingRedis) {
      if (notificationType === SES_NOTIFICATION_TYPE.COMPLAINT) {
        this.logger.error(
          `Delivery to email(s) ${complaint?.complainedRecipients
            .map((recipient) => recipient.emailAddress)
            .join(', ')} failed with ${statusDetails}`,
        );
      } else if (notificationType === SES_NOTIFICATION_TYPE.BOUNCE) {
        this.logger.error(
          `Delivery to email(s) ${bounce?.bouncedRecipients
            .map((recipient) => recipient.emailAddress)
            .join(', ')} failed with ${statusDetails}`,
        );
      }
    } else {
      const notificationHistory = await this.notificationHistoryEntityService.retrieveNotificationHistoryWithTransactionByMessageId(
        messageId,
      );
      const { uuid, transaction, user, type } = notificationHistory!.activity!;

      if (transaction?.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG && type === ACTIVITY_TYPE.RECEIVE_TRANSFER) {
        const maskedUin = maskUin(user!.uin!);

        if (status === NOTIFICATION_STATUS.SUCCESS) {
          await this.saveEventLogs(
            EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
            transaction!.uuid,
            uuid,
            maskedUin,
            emails,
          );
        } else {
          await this.saveEventLogs(
            EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
            transaction!.uuid,
            uuid,
            maskedUin,
            emails,
            notificationType === SES_NOTIFICATION_TYPE.BOUNCE
              ? FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BOUNCED
              : FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_COMPLAINED,
            statusDetails,
          );
        }
      }

      await this.notificationHistoryEntityService.updateNotificationHistoryByMessageId(messageId, {
        status,
        statusDetails: `[${emails}] ${statusDetails}`,
      });
      this.logger.log(
        `[TransactionalEmailHandler] Updated notification history | SES MessageId: ${messageId} | emails: ${emails} | status ${status} | statusDetails ${statusDetails}`,
      );
    }

    if (notificationType === SES_NOTIFICATION_TYPE.BOUNCE) {
      await this.bouncedEmailsHandler(bounce!.bouncedRecipients);
    }

    this.logger.log(`[TransactionalEmailHandler] Processing complete, SES MessageId: ${messageId}`);
  }

  protected async bouncedEmailsHandler(bouncedRecipients: BouncedRecipient[]) {
    const promises = bouncedRecipients.map(({ emailAddress }) => this.emailBlackListService.upsertByEmail(emailAddress));
    const results = await Promise.allSettled(promises);

    const emailsAddedToBlacklist: string[] = [];
    const emailsFailedToBlacklist: string[] = [];

    results.forEach((result, index) => {
      const bouncedEmail = bouncedRecipients[index].emailAddress;

      if (result.status === 'fulfilled') {
        emailsAddedToBlacklist.push(bouncedEmail);
      } else {
        emailsFailedToBlacklist.push(bouncedEmail);
      }
    });

    if (emailsAddedToBlacklist.length > 0) {
      this.logger.log(`[TransactionalEmailHandler] Bounced email(s) ${emailsAddedToBlacklist.join(', ')} successfully added to blacklist`);
    }

    if (emailsFailedToBlacklist.length > 0) {
      this.logger.error(
        `[TransactionalEmailHandler] Bounced email(s) ${emailsFailedToBlacklist.join(', ')} failed to be added to the blacklist`,
      );
    }
  }

  protected async saveEventLogs(eventType: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS, transactionUuid: string, recipientActivityUuid: string, maskedUin: string, email: string): Promise<void> // prettier-ignore
  protected async saveEventLogs(eventType: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE, transactionUuid: string, recipientActivityUuid: string, maskedUin: string, email: string, failSubType: string, failedReason: string): Promise<void> // prettier-ignore
  protected async saveEventLogs(
    eventType:
      | EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS
      | EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
    transactionUuid: string,
    recipientActivityUuid: string,
    maskedUin: string,
    email: string,
    failSubType?: string,
    failedReason?: string,
  ) {
    const event: FormSgRecipientNotificationDeliverySuccessEvent | FormSgRecipientNotificationDeliveryFailureEvent =
      eventType === EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS
        ? {
            type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
            channel: NOTIFICATION_CHANNEL.EMAIL,
            transactionUuid,
            recipientActivityUuid,
            maskedUin,
            email,
          }
        : {
            type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
            channel: NOTIFICATION_CHANNEL.EMAIL,
            transactionUuid,
            recipientActivityUuid,
            maskedUin,
            email,
            failSubType: failSubType!,
            failedReason: failedReason!,
          };

    try {
      await this.eventLogsServiceApiClient.post<void, AxiosResponse<void>, EventLoggingRequest>('v1/events', { event });
    } catch (error) {
      const errorMessage = `[EventLogs][TransactionalEmailHandlerService] Saving to event logs failed, transactionUuid: ${transactionUuid}, error: ${
        (error as AxiosError).message
      }`;

      this.logger.error(errorMessage);
    }
  }
}
