import { InputValidationException } from '@filesg/backend-common';
import {
  COMPONENT_ERROR_CODE,
  CreateFormSgFileTransactionRequest,
  CreateFormSgFileTransactionResponse,
  CreateTransactionV2Request,
  CustomAgencyMessageMultipleNotification,
  EXCEPTION_ERROR_CODE,
  FORMSG_EXCEPTION_ERROR_CODE_TO_FAIL_CATEGORY,
  MessageTemplate,
  NOTIFICATION_CHANNEL,
  NotificationMessage,
  TemplateMessageInput,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { FORMSG_TEMPLATE_INPUT_PARAGRAPH_FIELD_PREFIX, FORMSG_TEMPLATE_MAX_PARAGRAPH_COUNT } from '../../../consts';
import { ApplicationTypeNotificationEntityService } from '../../entities/application-type-notification/application-type-notification.entity.service';
import { NotificationMessageTemplateEntityService } from '../../entities/notification-message-template/notification-message-template.entity.service';
import { TransactionCustomMessageTemplateEntityService } from '../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.service';
import { EmailService } from '../notification/email.service';
import { FileTransactionV2Service } from '../transaction/file-transaction.v2.service';
import { RecallTransactionService } from '../transaction/recall-transaction.service';
import { FormSgService } from './formsg.service';

@Injectable()
export class FormSgTransactionService {
  private readonly logger = new Logger(FormSgTransactionService.name);

  constructor(
    private readonly formSgService: FormSgService,
    private readonly fileTransactionV2Service: FileTransactionV2Service,
    private readonly applicationTypeNotificationEntityService: ApplicationTypeNotificationEntityService,
    private readonly notificationMessageTemplateEntityService: NotificationMessageTemplateEntityService,
    private readonly transactionCustomMessageTemplateEntityService: TransactionCustomMessageTemplateEntityService,
    private readonly recallTransactionService: RecallTransactionService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Handles authentication & input validation, then transform request into createFileTransactionV2 request
   * @param formsgTransactionRequest
   * @returns
   */
  public async createFormSgTransaction(
    formsgTransactionRequest: CreateFormSgFileTransactionRequest,
  ): Promise<CreateFormSgFileTransactionResponse> {
    const { application, transaction, files, requestorEmail } = formsgTransactionRequest;

    // find eservice user by email, throw error if user not found
    const eserviceUser = await this.formSgService.verifyRequestorEmail(requestorEmail);

    // validate both the requestor and recipient emails to ensure they are not blacklisted
    const { recipients } = transaction;
    const recipientEmails: string[] = [];
    recipients.forEach(({ email }) => email && recipientEmails.push(email));
    await this.fileTransactionV2Service.validateRecipientEmails([...recipientEmails, requestorEmail]);

    const eserviceWhitelistedUser = eserviceUser.whitelistedUsers![0];

    // Get transaction & notification templates for agency
    const transactionCustomMessageTemplate =
      await this.transactionCustomMessageTemplateEntityService.retrieveFormsgTransactionCustomMessageTemplatesByEserviceUserId(
        eserviceUser.id,
      );

    const { longCustomMessage, shortCustomMessage } = transaction;
    const transactionMessageTemplate: MessageTemplate = {
      templateId: transactionCustomMessageTemplate.uuid,
      templateInput: this.generateTemplateInput(longCustomMessage),
    };

    const { type: applicationTypeCodeFromRequest } = application;

    const applicationTypeNotifications =
      await this.applicationTypeNotificationEntityService.retrieveNotificationChannelsForApplicationTypeByCodeAndEserviceUserId(
        applicationTypeCodeFromRequest,
        eserviceUser.id,
      );

    if (applicationTypeNotifications.length <= 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        `Application Type ${applicationTypeCodeFromRequest} is invalid to the eservice user of ${requestorEmail}`,
        undefined,
        EXCEPTION_ERROR_CODE.APPLICATION_IS_INVALID,
      );
    }

    const applicationTypeNotificationChannels = applicationTypeNotifications.map((notification) => notification.notificationChannel);

    const notificationTemplates =
      await this.notificationMessageTemplateEntityService.retrieveFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels(
        eserviceUser.id,
        applicationTypeNotificationChannels,
      );

    const notificationMessages = notificationTemplates.map(({ uuid, notificationChannel }): NotificationMessage => {
      let templateInput: TemplateMessageInput;

      if (notificationChannel === NOTIFICATION_CHANNEL.SG_NOTIFY && shortCustomMessage) {
        templateInput = this.generateTemplateInput(shortCustomMessage);
      } else {
        templateInput = this.generateTemplateInput(longCustomMessage);
      }

      return {
        channel: notificationChannel,
        templateId: uuid,
        templateInput,
      };
    });

    const customAgencyMessage: CustomAgencyMessageMultipleNotification = {
      transaction: transactionMessageTemplate,
      notifications: notificationMessages,
    };

    const { name, isAcknowledgementRequired } = transaction;
    const createTransactionV2Request: CreateTransactionV2Request = {
      creationMethod: TRANSACTION_CREATION_METHOD.FORMSG,
      type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
      customAgencyMessage,
      name,
      recipients,
      isAcknowledgementRequired,
    };

    const createFileTransactionResponse = await this.fileTransactionV2Service.createFileTransaction(
      eserviceUser.id,
      {
        application,
        transaction: createTransactionV2Request,
        files,
      },
      eserviceWhitelistedUser,
    );

    return {
      notificationChannels: applicationTypeNotificationChannels,
      ...createFileTransactionResponse,
    };
  }

  public async recallTransaction(transactionUuid: string, requestorEmail: string) {
    try {
      const { id: eserviceUserId, whitelistedUsers } = await this.formSgService.verifyRequestorEmail(requestorEmail);
      return await this.recallTransactionService.recallTransaction(
        transactionUuid,
        eserviceUserId,
        {
          creationMethod: TRANSACTION_CREATION_METHOD.FORMSG,
        },
        whitelistedUsers![0],
      );
    } catch (error) {
      let errorCode: EXCEPTION_ERROR_CODE = EXCEPTION_ERROR_CODE.UNEXPECTED_ERROR;
      if (error instanceof InputValidationException) {
        const code = (error.getResponse() as any).errorCode.split('-')[1] as EXCEPTION_ERROR_CODE;
        if (code) {
          errorCode = code;
        }
      }
      const errorMessage = FORMSG_EXCEPTION_ERROR_CODE_TO_FAIL_CATEGORY[errorCode]!;
      await this.emailService.sendRecallFailureEmailToAgency(transactionUuid, errorMessage, requestorEmail);
      throw error;
    }
  }

  /**
   * Takes custom message string array, with each paragraph as an entry in the array, and returns a key-value pair template input
   *
   * e.g. ['a', 'b', 'c'] with paragraphCount of 5 will return:
   * {
   *   "paragraph1": "a",
   *   "paragraph2": "b",
   *   "paragraph3": "c",
   *   "paragraph4": "",
   *   "paragraph5": ""
   * }
   *
   * @param customMessage Array of string, ordered in paragraph order
   * @param paragraphCount Allowed number of paragraphs in a custom message. Default: 5
   */
  protected generateTemplateInput(customMessage: string[], paragraphCount = FORMSG_TEMPLATE_MAX_PARAGRAPH_COUNT): TemplateMessageInput {
    const templateInput: TemplateMessageInput = {};

    [...Array(paragraphCount).keys()].forEach((index) => {
      const key = FORMSG_TEMPLATE_INPUT_PARAGRAPH_FIELD_PREFIX + `${index + 1}`;
      templateInput[key] = customMessage[index] ?? '';
    });

    return templateInput;
  }
}
