import { EmailAttachment } from '@filesg/aws';
import {
  EVENT_LOGGING_EVENTS,
  EventLoggingRequest,
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgIssuanceBatchProcessFailureMessagePayload,
  FormSgIssuanceBatchTransactionFailureMessagePayload,
  FormSgIssuanceFailureMessage,
  FormSgIssuanceFailureMessagePayload,
  FormSgIssuanceSingleSuccessMessagePayload,
  FormSgIssuanceSuccessMessage,
  FormSgIssuanceSuccessMessagePayload,
  FormSgIssuanceSuccessPayloadTransaction,
  FormSgRecipientNotificationDeliveryFailureEvent,
  isSuccessFormSgIssuance,
  maskUin,
} from '@filesg/backend-common';
import {
  ACTIVITY_TYPE,
  FEATURE_TOGGLE,
  FORMSG_FAIL_CATEGORY,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  TRANSACTION_CREATION_METHOD,
  transformFirstLetterUppercase,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { format } from 'date-fns';
import { json2csv } from 'json-2-csv';

import { EmailDeliveryFailureTemplateArgs } from '../../../common/email-template/email-delivery-faliure.class';
import { EmailFactory } from '../../../common/email-template/email-factory.class';
import {
  FORMSG_TRANSACTION_EMAIL_TYPE,
  FormSgTransactionEmailToAgencyTemplateArgs,
} from '../../../common/email-template/formsg-transaction-email-to-agency.class';
import { GeneralInfoSection } from '../../../common/email-template/formsg-transaction-email-to-agency.email-template';
import {
  RECALL_TRANSACTION_EMAIL_TYPE,
  RecallEmailToAgencyTemplateArgs,
} from '../../../common/email-template/recall-transaction-email-to-agency.class';
import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../consts';
import { Activity } from '../../../entities/activity';
import { NotificationMessageInput } from '../../../entities/notification-message-input';
import { EmailNotificationOptions } from '../../../typings/common';
import { EMAIL_TYPES } from '../../../utils/email-template';
import { generateOutputFromTemplate } from '../../../utils/helpers';
import { NotificationHistoryEntityService } from '../../entities/notification-history/notification-history.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { SesService } from '../aws/ses.service';
import { EmailBlackListService } from '../email/email-black-list.service';
import { RecallTransactionCSVReport } from '../transaction/recall-transaction.service';
import { BaseNotificationService } from './notification.class';

interface TransactionalEmailDetails {
  title: string;
  content: string;
  agencyCode: string;
}

@Injectable()
export class EmailService implements BaseNotificationService {
  protected logger = new Logger(EmailService.name);
  private emailToggleSend: FEATURE_TOGGLE;

  constructor(
    private readonly fileSgConfigService: FileSGConfigService,
    private readonly sesService: SesService,
    private readonly redisService: RedisService,
    private readonly emailBlackListService: EmailBlackListService,
    private readonly notificationHistoryEntityService: NotificationHistoryEntityService,
    @Inject(EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER) private readonly eventLogsServiceApiClient: AxiosInstance,
  ) {
    this.emailToggleSend = this.fileSgConfigService.notificationConfig.emailToggleSend;
  }

  // gd TODO: unit test
  public async sendNotification(
    activity: Activity,
    notificationMessageInput: NotificationMessageInput | null, //TODO: nullable for legacy email sending
    emailNotificationOptions: EmailNotificationOptions,
  ): Promise<void> {
    this.logger.debug(`Sending email is toggled ${this.emailToggleSend}`);

    if (this.emailToggleSend === FEATURE_TOGGLE.OFF) {
      return;
    }

    const { email, emails } = activity.recipientInfo!;
    const { templateType } = emailNotificationOptions; //TODO: template type given for legacy email sending, else get from notificationMessageTemplate.type

    if (!email && !emails) {
      this.logger.warn(
        `${transformFirstLetterUppercase(templateType)} email(s) failed to sent as email address(s) was undefined/null for activity: ${
          activity.uuid
        }`,
      );
      return;
    }

    if (email) {
      await this.transactionalEmailHandler(email, activity, notificationMessageInput, emailNotificationOptions);
    } else if (emails) {
      const promises = emails.map((email) =>
        this.transactionalEmailHandler(email, activity, notificationMessageInput, emailNotificationOptions),
      );
      await Promise.allSettled(promises);
    }
  }

  // gd TODO: unit test
  protected constructTransactionalEmail(
    notificationMessageInput: NotificationMessageInput | null,
    emailNotificationOptions: EmailNotificationOptions,
    activity: Activity,
  ): TransactionalEmailDetails {
    let customMessage: string[] | undefined = undefined;

    const { templateType, encryptionDetailsList } = emailNotificationOptions; //TODO: template type given for legacy email sending, else get from notificationMessageTemplate.type
    const agencyCode = activity.transaction!.application!.eservice!.agency!.code;

    if (notificationMessageInput) {
      const { notificationMessageTemplate, templateInput } = notificationMessageInput;
      customMessage = generateOutputFromTemplate<string[]>(notificationMessageTemplate!.template, templateInput).filter((value) => !!value);
    } else {
      customMessage = activity.transaction!.customAgencyMessage!.email!;
    }

    const { title, content } = EmailFactory.build(EMAIL_TYPES[templateType], {
      activity,
      customMessage,
      fileSGConfigService: this.fileSgConfigService,
      encryptionDetails: encryptionDetailsList?.find(({ activityUuid }) => activityUuid === activity.uuid),
    });

    return { title, content, agencyCode };
  }

  // gd TODO: unit test
  protected async transactionalEmailHandler(
    email: string,
    activity: Activity,
    notificationMessageInput: NotificationMessageInput | null,
    emailNotificationOptions: EmailNotificationOptions,
  ) {
    let messageId: string | null = null;
    let errorMessage: string | null = null;

    const { templateType } = emailNotificationOptions;

    const taskMessage = `Sending ${transformFirstLetterUppercase(templateType)} email to recipient: ${email}`;
    this.logger.log(taskMessage);

    try {
      const { title, content, agencyCode } = this.constructTransactionalEmail(notificationMessageInput, emailNotificationOptions, activity);

      const response = await this.sendEmail([email], title, content, agencyCode);
      messageId = response ? response.MessageId! : null;
    } catch (error) {
      errorMessage = (error as Error).message;
      this.logger.warn(`[Failed] ${taskMessage}, error: ${errorMessage}`);

      const transactionUuid = activity.transaction!.uuid;
      const maskedUin = maskUin(activity.user!.uin!);

      // gd TODO: update unit test
      if (activity.transaction?.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG && activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER) {
        await this.saveEventLogs(transactionUuid, activity.uuid, maskedUin, email!, FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR, errorMessage);
      }
    }

    if (messageId || errorMessage) {
      // Save notificaiton history
      try {
        await this.notificationHistoryEntityService.insertNotificationHistories([
          {
            notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
            activity,
            status: errorMessage ? NOTIFICATION_STATUS.FAILED : NOTIFICATION_STATUS.INIT,
            statusDetails: errorMessage ?? `AWS send command success. Pending update from transactional email handler`,
            messageId,
          },
        ]);
      } catch (error) {
        const errorMessage = (error as Error).message;
        this.logger.warn(`Error saving notification history: ${errorMessage}`);
      }
    }
  }

  public async sendAgencyDeliveryFailureEmail(
    agencyEmailAddress: string[],
    deliveryFailureData: EmailDeliveryFailureTemplateArgs,
    attachments?: EmailAttachment[],
  ) {
    this.logger.debug(`Sending email is toggled ${this.emailToggleSend}`);

    if (this.emailToggleSend === FEATURE_TOGGLE.OFF) {
      return;
    }

    const { title, content } = EmailFactory.build(EMAIL_TYPES.EMAIL_DELIVERY_FAILED, deliveryFailureData);
    await this.sendEmail(agencyEmailAddress, title, content, undefined, attachments);
    this.logger.log(`Delivery failure emailed to agency`);
  }

  public async sendFormSgIssuanceReportToRequestor(
    message: FormSgIssuanceSuccessMessage | FormSgIssuanceFailureMessage,
    attachments?: EmailAttachment[],
  ) {
    this.logger.debug(`Sending email is toggled ${this.emailToggleSend}`);

    if (this.emailToggleSend === FEATURE_TOGGLE.OFF) {
      return;
    }

    let messageId: string | null = null;
    const { issuanceId: formSgSubmissionId, requestorEmail, queueEventTimestamp } = message.payload;

    const taskMessage = `Sending FormSg issuance report email to requestor: ${requestorEmail}`;
    this.logger.log(taskMessage);

    const emailType = this.getFormSgTxnEmailType(message);
    const general = this.constructFormSgTxnEmailGeneralInfoSectionArgs(emailType, message.payload);

    const args: FormSgTransactionEmailToAgencyTemplateArgs = {
      fileSGConfigService: this.fileSgConfigService,
      general,
      issuance: {
        dateTimeOfIssuanceRequest: format(new Date(queueEventTimestamp), 'dd MMM yyyy hh:mm aa'),
        formSgSubmissionId,
        requestorEmail,
      },
    };

    const transaction = (message.payload as FormSgIssuanceSingleSuccessMessagePayload).transaction;

    if (transaction) {
      const { applicationType, name: transactionName, fileNames, recipientNames } = transaction;

      args['transaction'] = {
        applicationType,
        transactionName,
        transactionUuid: (transaction as FormSgIssuanceSuccessPayloadTransaction).uuid,
        fileNames,
        recipientNames,
      };
    }

    const { title, content } = EmailFactory.build(EMAIL_TYPES.FORMSG, args);
    const response = await this.sendEmail([requestorEmail], title, content, undefined, attachments);

    if (response) {
      messageId = response.MessageId!;

      // putting a try-catch here so that it logs the error but wont throw to prevent message being retried (prevent duplicate email send)
      try {
        await this.redisService.set(FILESG_REDIS_CLIENT.SES_NOTIFICATION_DELIVERY, messageId, messageId, undefined, 24 * 60 * 60);
      } catch (error) {
        this.logger.error(
          `Failed to insert messageId ${messageId} into redis. SES notification handler wont be handling the notification delivery.`,
        );
      }
    }

    this.logger.log(`[Success] ${taskMessage}`);
  }

  // TODO: add unit test
  public async sendRecallSucessEmailToAgency(sendRecallActivity: Activity) {
    if (this.emailToggleSend === FEATURE_TOGGLE.OFF) {
      return;
    }

    this.logger.log(`[RECALL-TXN-EMAIL][INIT] -  Preparing to send email for recall transaction`);
    const { transaction } = sendRecallActivity;
    const { application, eserviceWhitelistedUser, parent: parentTransaction } = transaction!;
    const { emails: eserviceEmails, agency } = application!.eservice!;

    const recallSuccessEmailToAgencyTemplateArgs: RecallEmailToAgencyTemplateArgs = {
      fileSGConfigService: this.fileSgConfigService,
      transactionUuid: parentTransaction!.uuid,
      timeOfRecallRequest: format(transaction!.createdAt, 'dd MMM yyyy hh:mm aa'),
      agencyName: agency!.name,
      agencyCode: agency!.code,
      requestorEmail: eserviceWhitelistedUser ? eserviceWhitelistedUser.email : undefined,
      recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE.SUCCESS,
      formSgRecallIssuanceErrorScenariosDocUrl: this.fileSgConfigService.formSgConfig.formSgRecallIssuanceErrorScenariosDocUrl,
    };

    const emailAddressesToSendEmailTo = [...eserviceEmails];
    if (eserviceWhitelistedUser) {
      emailAddressesToSendEmailTo.push(eserviceWhitelistedUser.email);
    }

    const recallReport: RecallTransactionCSVReport[] = [];

    parentTransaction!
      .activities!.filter((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER)
      .forEach((activity) => {
        const { fileAssets } = activity;
        fileAssets!.forEach((fileAsset) => {
          recallReport.push({
            'Application Type': parentTransaction!.application!.applicationType!.code,
            'Agency Reference Id': parentTransaction!.application!.externalRefId ?? '',
            'Transaction Uuid': parentTransaction!.uuid,
            'Recipient Activity Uuid': activity.uuid,
            'Recipient Masked Uin': maskUin(activity.user!.uin!),
            'Recipient Name': maskUin(activity.user!.uin!),
            'Recipient Email': activity.recipientInfo!.email ?? '',
            'Recipient Contact': activity.recipientInfo!.mobile ?? '',
            'Agency File Asset Name': fileAsset.name,
            'Recall Status': 'Success',
          });
        });
      });

    const emailAttachment: EmailAttachment = {
      filename: `recall-transaction-success-report.csv`,
      contentType: 'text/csv',
      base64Data: Buffer.from(await json2csv(recallReport)).toString('base64'),
    };

    const { title, content } = EmailFactory.build(EMAIL_TYPES.RECALL, recallSuccessEmailToAgencyTemplateArgs);
    await this.sendEmail(emailAddressesToSendEmailTo, title, content, undefined, [emailAttachment]);
    this.logger.log(
      `[RECALL-TXN-EMAIL][SUCCESS] For transaction uuid:${
        parentTransaction!.name
      } amd email sent to the following ${emailAddressesToSendEmailTo.toString()}`,
    );
  }

  public async sendRecallFailureEmailToAgency(transactionUuid: string, errorMessage: string, requestorEmail: string) {
    if (this.emailToggleSend === FEATURE_TOGGLE.OFF) {
      return;
    }

    const { title, content } = EmailFactory.build(EMAIL_TYPES.RECALL, {
      fileSGConfigService: this.fileSgConfigService,
      transactionUuid: transactionUuid,
      agencyCode: '',
      agencyName: '',
      timeOfRecallRequest: format(new Date(), 'dd MMM yyyy hh:mm aa'),
      requestorEmail,
      recallTransactionEmailType: RECALL_TRANSACTION_EMAIL_TYPE.FAILURE,
      formSgRecallIssuanceErrorScenariosDocUrl: this.fileSgConfigService.formSgConfig.formSgRecallIssuanceErrorScenariosDocUrl,
    });

    const emailAttachmentData = [
      {
        'Transaction Uuid': transactionUuid,
        'Failure Reason': errorMessage,
      },
    ];

    const emailAttachment: EmailAttachment = {
      filename: `recall-transaction-failure-report.csv`,
      contentType: 'text/csv',
      base64Data: Buffer.from(await json2csv(emailAttachmentData)).toString('base64'),
    };

    await this.sendEmail([requestorEmail], title, content, undefined, [emailAttachment]);
  }

  public async sendEmail(
    receivers: string[],
    emailTitle: string,
    emailContent: string,
    agencyCode?: string,
    attachments?: EmailAttachment[],
  ) {
    const blackListedEmails: string[] = [];
    const unknownStatusEmails: string[] = [];
    const promises = receivers.map((receiver) => this.emailBlackListService.isEmailBlackListed(receiver));
    const results = await Promise.allSettled(promises);

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const isBlacklisted = result.value;

        if (isBlacklisted) {
          blackListedEmails.push(receivers[index]);
          return;
        }
      } else {
        const unknownStatusEmail = receivers[index];
        unknownStatusEmails.push(unknownStatusEmail);
      }
    });

    // send email to only receivers not in blacklist or of unknown status
    receivers = receivers.filter((receiver) => !blackListedEmails.includes(receiver) && !unknownStatusEmails.includes(receiver));

    let message = '';

    if (receivers.length > 0) {
      message += `Sending email to: ${receivers.join(', ')}.`;
    }

    if (blackListedEmails.length > 0) {
      message += ` Email blacklisted: ${blackListedEmails.join(', ')}.`;
    }

    if (unknownStatusEmails.length > 0) {
      message += ` Email with unknown status: ${unknownStatusEmails.join(', ')}.`;
    }

    if (blackListedEmails.length > 0 || unknownStatusEmails.length > 0) {
      this.logger.warn(message.trim());
    } else {
      this.logger.log(message);
    }

    if (receivers.length > 0) {
      return await this.sesService.sendEmailFromFileSG(receivers, emailTitle, emailContent, agencyCode, attachments);
    }
  }

  protected async saveEventLogs(
    transactionUuid: string,
    recipientActivityUuid: string,
    maskedUin: string,
    email: string,
    failSubType: string,
    failedReason: string,
  ) {
    try {
      const event: FormSgRecipientNotificationDeliveryFailureEvent = {
        type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
        channel: NOTIFICATION_CHANNEL.EMAIL,
        transactionUuid,
        recipientActivityUuid,
        maskedUin,
        email,
        failSubType,
        failedReason,
      };

      await this.eventLogsServiceApiClient.post<void, AxiosResponse<void>, EventLoggingRequest>('v1/events', { event });
    } catch (error) {
      const errorMessage = `[EventLogs][EmailService] Saving to event logs failed, transactionUuid: ${transactionUuid}, error: ${
        (error as AxiosError).message
      }`;

      this.logger.error(errorMessage);
    }
  }

  protected getFormSgTxnEmailType(messageBody: FormSgIssuanceSuccessMessage | FormSgIssuanceFailureMessage): FORMSG_TRANSACTION_EMAIL_TYPE {
    if (isSuccessFormSgIssuance(messageBody)) {
      if (!messageBody.payload.hasNotificationToRecipientFailure) {
        return FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS;
      }
      return FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION;
    }

    if ((messageBody.payload as FormSgIssuanceBatchProcessFailureMessagePayload).failType === FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION) {
      return FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE;
    }

    if ((messageBody.payload as FormSgIssuanceBatchTransactionFailureMessagePayload).batchSize) {
      return FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE;
    }

    return FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE;
  }

  protected constructFormSgTxnEmailGeneralInfoSectionArgs(
    emailType: FORMSG_TRANSACTION_EMAIL_TYPE,
    payload: FormSgIssuanceSuccessMessagePayload | FormSgIssuanceFailureMessagePayload,
  ): GeneralInfoSection {
    const {
      systemConfig: { fileSGBaseURL },
      formSgConfig: { formSgRecallIssuanceFormUrl, formSgIssuanceErrorScenariosDocUrl },
    } = this.fileSgConfigService;

    switch (emailType) {
      case FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS:
        return {
          emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS,
          fileSgBaseUrl: fileSGBaseURL,
          formSgRecallIssuanceFormUrl,
        };

      case FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION:
        return {
          emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION,
          fileSgBaseUrl: fileSGBaseURL,
          formSgRecallIssuanceFormUrl,
          formSgIssuanceErrorScenariosDocUrl,
        };

      case FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE:
        return {
          emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE,
          formSgIssuanceErrorScenariosDocUrl,
        };

      case FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE:
        return {
          emailType: FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE,
          failSubType: (payload as FormSgIssuanceBatchProcessFailureMessagePayload).failSubType,
          formSgIssuanceErrorScenariosDocUrl,
        };

      case FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE: {
        const { batchSize, failedTransactionCount, hasNotificationToRecipientFailure } =
          payload as FormSgIssuanceBatchTransactionFailureMessagePayload;

        return {
          emailType: FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE,
          fileSgBaseUrl: fileSGBaseURL,
          formSgIssuanceErrorScenariosDocUrl,
          totalTransactionCount: batchSize,
          failedTransactionCount,
          hasNotificationToRecipientFailure,
        };
      }
    }
  }
}
