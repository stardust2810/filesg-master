import { maskUin } from '@filesg/backend-common';
import {
  FORMSG_FAIL_CATEGORY,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  TRANSACTION_CREATION_METHOD,
  transformFirstLetterUppercase,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';
import { format } from 'date-fns';

import { EmailFactory } from '../../../../common/email-template/email-factory.class';
import {
  FORMSG_TRANSACTION_EMAIL_TYPE,
  FormSgTransactionEmailToAgencyTemplateArgs,
} from '../../../../common/email-template/formsg-transaction-email-to-agency.class';
import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { Activity } from '../../../../entities/activity';
import { EMAIL_TYPES } from '../../../../utils/email-template';
import * as helpers from '../../../../utils/helpers';
import { mockNotificationHistoryEntityService } from '../../../entities/notification-history/__mocks__/notification-history.entity.service.mock';
import { NotificationHistoryEntityService } from '../../../entities/notification-history/notification-history.entity.service';
import { mockEventLogsServiceClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSesService } from '../../aws/__mocks__/ses.service.mock';
import { SesService } from '../../aws/ses.service';
import { mockEmailBlackListService } from '../../email/__mocks__/email-black-list.service.mock';
import { EmailBlackListService } from '../../email/email-black-list.service';
import {
  mockActivity,
  mockActivityWithoutNotificationMessageInput,
  mockBatchFailureMessageBody,
  mockBatchFailurePayload,
  mockBatchSidecareFailureMessageBody,
  mockBatchSidecarErrorSubType,
  mockBatchSidecarFailurePayload,
  mockEmailAttachments,
  mockEmailContent,
  mockEmailDeliveryFailureTemplateArgs,
  mockEmailNotificationMessageInput,
  mockEmailNotificationOptions,
  mockEmails,
  mockEmailTitle,
  mockEservice,
  mockFailureMessageBody,
  mockFailurePayload,
  mockFormSgIssuanceSuccessPayloadTransaction,
  mockMessageId,
  mockQueueEventTimestamp,
  mockRecordId,
  mockRequestorEmail,
  mockSuccessMessageBody,
  mockSuccessPayload,
  mockSuccessWithFailedNotificationMessageBody,
  mockTransaction,
  mockTransactionWithoutNotificationMessageInput,
  TestEmailService,
} from '../__mocks__/email.service.mock';

describe('EmailService', () => {
  let service: TestEmailService;
  let emailBuildSpy: jest.SpyInstance;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestEmailService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: SesService, useValue: mockSesService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: EmailBlackListService, useValue: mockEmailBlackListService },
        { provide: NotificationHistoryEntityService, useValue: mockNotificationHistoryEntityService },
        { provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceClientProvider },
      ],
    }).compile();

    service = module.get<TestEmailService>(TestEmailService);

    emailBuildSpy = jest.spyOn(EmailFactory, 'build');

    emailBuildSpy.mockReturnValue({ title: mockEmailTitle, content: mockEmailContent });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendNotification', () => {
    let transactionalEmailHandlerSpy: jest.SpyInstance;

    beforeAll(() => {
      transactionalEmailHandlerSpy = jest.spyOn(service, 'transactionalEmailHandler');
    });

    it('should be defined', () => {
      expect(service.sendNotification).toBeDefined();
    });

    it('should call transactionalEmailHandler once when there is email in the activity recipientInfo', async () => {
      await service.sendNotification(mockActivity, mockEmailNotificationMessageInput, mockEmailNotificationOptions);

      expect(transactionalEmailHandlerSpy).toBeCalledWith(
        mockActivity.recipientInfo?.email,
        mockActivity,
        mockEmailNotificationMessageInput,
        mockEmailNotificationOptions,
      );
      expect(transactionalEmailHandlerSpy).toBeCalledTimes(1);
    });

    it('should call transactionalEmailHandler multiple times when there are emails in the activity recipientInfo', async () => {
      const mockEmails = ['test@gmail.com', 'test2@gmail.com'];
      const activity = { ...mockActivity, recipientInfo: { name: 'mockUserName', emails: mockEmails } };

      await service.sendNotification(activity, mockEmailNotificationMessageInput, mockEmailNotificationOptions);

      mockEmails.forEach((email) => {
        expect(transactionalEmailHandlerSpy).toBeCalledWith(
          email,
          activity,
          mockEmailNotificationMessageInput,
          mockEmailNotificationOptions,
        );
      });
      expect(transactionalEmailHandlerSpy).toBeCalledTimes(mockEmails.length);
    });

    it('should log warn when there is neither email or emails from activity recipientInfo', async () => {
      const activity = { ...mockActivity, recipientInfo: { name: 'mockName' } };

      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      await service.sendNotification(activity, mockEmailNotificationMessageInput, mockEmailNotificationOptions);

      expect(loggerWarnSpy).toBeCalledWith(
        `${transformFirstLetterUppercase(
          mockEmailNotificationOptions.templateType,
        )} email(s) failed to sent as email address(s) was undefined/null for activity: ${activity.uuid}`,
      );
      expect(transactionalEmailHandlerSpy).not.toBeCalled();
    });
  });

  describe('constructTransactionalEmail', () => {
    let generateOutputFromTemplateSpy: jest.SpyInstance;

    beforeAll(() => {
      generateOutputFromTemplateSpy = jest.spyOn(helpers, 'generateOutputFromTemplate');
    });

    it('should call methods with correct args', () => {
      service.constructTransactionalEmail(mockEmailNotificationMessageInput, mockEmailNotificationOptions, mockActivity);

      const { notificationMessageTemplate, templateInput } = mockEmailNotificationMessageInput;
      expect(generateOutputFromTemplateSpy).toBeCalledWith(notificationMessageTemplate?.template, templateInput);

      const customMessage = helpers
        .generateOutputFromTemplate<string[]>(notificationMessageTemplate!.template, templateInput)
        .filter((value) => !!value);

      expect(emailBuildSpy).toBeCalledWith(EMAIL_TYPES.ISSUANCE, {
        activity: mockActivity,
        customMessage: customMessage,
        fileSGConfigService: mockFileSGConfigService,
        encryptionDetails: mockEmailNotificationOptions.encryptionDetailsList![0],
      });
    });

    it('should create email with customAgencyMessage as custom message if no notificationMessageInput', async () => {
      service.constructTransactionalEmail(null, mockEmailNotificationOptions, mockActivityWithoutNotificationMessageInput);

      expect(generateOutputFromTemplateSpy).not.toBeCalled();
      expect(emailBuildSpy).toBeCalledWith(EMAIL_TYPES.ISSUANCE, {
        activity: mockActivityWithoutNotificationMessageInput,
        customMessage: mockTransactionWithoutNotificationMessageInput.customAgencyMessage?.email,
        fileSGConfigService: mockFileSGConfigService,
        encryptionDetails: mockEmailNotificationOptions.encryptionDetailsList![0],
      });
    });
  });

  describe('transactionalEmailHandler', () => {
    const { email } = mockActivity.recipientInfo!;

    let sendEmailSpy: jest.SpyInstance;

    beforeAll(() => {
      sendEmailSpy = jest.spyOn(service, 'sendEmail');
    });

    it('should call methods with correct args', async () => {
      const mockMessageId = 'mockMessageId';
      const agencyCode = mockActivity.transaction!.application!.eservice!.agency!.code;

      const constructTransactionalEmailSpy = jest.spyOn(service, 'constructTransactionalEmail');
      sendEmailSpy.mockResolvedValueOnce({ MessageId: mockMessageId });

      await service.transactionalEmailHandler(email!, mockActivity, mockEmailNotificationMessageInput, mockEmailNotificationOptions);

      expect(constructTransactionalEmailSpy).toBeCalledWith(mockEmailNotificationMessageInput, mockEmailNotificationOptions, mockActivity);
      expect(sendEmailSpy).toBeCalledWith([email], mockEmailTitle, mockEmailContent, agencyCode);
      expect(mockNotificationHistoryEntityService.insertNotificationHistories).toBeCalledWith([
        {
          notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
          activity: mockActivity,
          status: NOTIFICATION_STATUS.INIT,
          statusDetails: `AWS send command success. Pending update from transactional email handler`,
          messageId: mockMessageId,
        },
      ]);
    });

    it('should send error event logs when error occurs and activity is created with formsg and of type receive transfer', async () => {
      const transaction = { ...mockTransaction, creationMethod: TRANSACTION_CREATION_METHOD.FORMSG };
      const activity: Activity = { ...mockActivity, transaction };
      const errorMessage = 'some error';

      sendEmailSpy.mockRejectedValueOnce(new Error(errorMessage));
      const saveEventLogsSpy = jest.spyOn(service, 'saveEventLogs');

      await service.transactionalEmailHandler(email!, activity, mockEmailNotificationMessageInput, mockEmailNotificationOptions);

      const maskedUin = maskUin(activity.user!.uin!);
      expect(saveEventLogsSpy).toBeCalledWith(
        transaction.uuid,
        activity.uuid,
        maskedUin,
        email!,
        FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
        errorMessage,
      );
      expect(mockNotificationHistoryEntityService.insertNotificationHistories).toBeCalledWith([
        {
          notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
          activity,
          status: NOTIFICATION_STATUS.FAILED,
          statusDetails: errorMessage,
          messageId: null,
        },
      ]);
    });
  });

  describe('sendAgencyDeliveryFailureEmail', () => {
    it('should be defined', () => {
      expect(service.sendAgencyDeliveryFailureEmail).toBeDefined();
    });

    it('should call methods with correct args', async () => {
      const sendEmailSpy = jest.spyOn(service, 'sendEmail');

      await service.sendAgencyDeliveryFailureEmail(mockEservice.emails, mockEmailDeliveryFailureTemplateArgs);

      expect(emailBuildSpy).toBeCalledWith(EMAIL_TYPES.EMAIL_DELIVERY_FAILED, mockEmailDeliveryFailureTemplateArgs);
      expect(sendEmailSpy).toBeCalledWith(mockEservice.emails, mockEmailTitle, mockEmailContent, undefined, undefined);
    });
  });

  describe('sendFormSgIssuanceReportToRequestor', () => {
    let sendEmailSpy: jest.SpyInstance;
    let getFormSgTxnEmailTypeSpy: jest.SpyInstance;
    let constructFormSgTxnEmailGeneralInfoSectionArgsSpy: jest.SpyInstance;

    beforeAll(() => {
      sendEmailSpy = jest.spyOn(service, 'sendEmail');
      sendEmailSpy.mockResolvedValue({ MessageId: mockMessageId });

      getFormSgTxnEmailTypeSpy = jest.spyOn(service, 'getFormSgTxnEmailType');
      constructFormSgTxnEmailGeneralInfoSectionArgsSpy = jest.spyOn(service, 'constructFormSgTxnEmailGeneralInfoSectionArgs');
    });

    afterEach(() => {
      expect(sendEmailSpy).toBeCalledWith([mockRequestorEmail], mockEmailTitle, mockEmailContent, undefined, mockEmailAttachments);
      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.SES_NOTIFICATION_DELIVERY,
        mockMessageId,
        mockMessageId,
        undefined,
        24 * 60 * 60,
      );
    });

    afterAll(() => {
      sendEmailSpy.mockRestore();
    });

    it('should call methods with the right params when payload has transaction info', async () => {
      const {
        uuid: transactionUuid,
        applicationType,
        name: transactionName,
        fileNames,
        recipientNames,
      } = mockFormSgIssuanceSuccessPayloadTransaction;

      const args: FormSgTransactionEmailToAgencyTemplateArgs = {
        fileSGConfigService: mockFileSGConfigService as unknown as FileSGConfigService,
        general: service.constructFormSgTxnEmailGeneralInfoSectionArgs(FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS, mockSuccessPayload),
        issuance: {
          dateTimeOfIssuanceRequest: format(new Date(mockQueueEventTimestamp), 'dd MMM yyyy hh:mm aa'),
          formSgSubmissionId: mockRecordId,
          requestorEmail: mockRequestorEmail,
        },
        transaction: {
          applicationType,
          transactionName,
          transactionUuid,
          fileNames,
          recipientNames,
        },
      };

      await service.sendFormSgIssuanceReportToRequestor(mockSuccessMessageBody, mockEmailAttachments);

      expect(getFormSgTxnEmailTypeSpy).toBeCalledWith(mockSuccessMessageBody);
      expect(constructFormSgTxnEmailGeneralInfoSectionArgsSpy).toBeCalledWith(FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS, mockSuccessPayload);
      expect(emailBuildSpy).toBeCalledWith(EMAIL_TYPES.FORMSG, args);
    });

    it('should call methods with the right params when payload has no transaction info', async () => {
      const args: FormSgTransactionEmailToAgencyTemplateArgs = {
        fileSGConfigService: mockFileSGConfigService as unknown as FileSGConfigService,
        general: service.constructFormSgTxnEmailGeneralInfoSectionArgs(
          FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE,
          mockBatchFailurePayload,
        ),
        issuance: {
          dateTimeOfIssuanceRequest: format(new Date(mockQueueEventTimestamp), 'dd MMM yyyy hh:mm aa'),
          formSgSubmissionId: mockRecordId,
          requestorEmail: mockRequestorEmail,
        },
      };

      await service.sendFormSgIssuanceReportToRequestor(mockBatchFailureMessageBody, mockEmailAttachments);

      expect(getFormSgTxnEmailTypeSpy).toBeCalledWith(mockBatchFailureMessageBody);
      expect(constructFormSgTxnEmailGeneralInfoSectionArgsSpy).toBeCalledWith(
        FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE,
        mockBatchFailurePayload,
      );
      expect(emailBuildSpy).toBeCalledWith(EMAIL_TYPES.FORMSG, args);
    });

    it('should log error when fail to insert to redis', async () => {
      mockFileSGRedisService.set.mockRejectedValueOnce('some error');
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');

      await service.sendFormSgIssuanceReportToRequestor(mockSuccessMessageBody, mockEmailAttachments);

      expect(loggerErrorSpy).toBeCalledWith(
        `Failed to insert messageId ${mockMessageId} into redis. SES notification handler wont be handling the notification delivery.`,
      );
    });
  });

  describe('sendEmail', () => {
    it('should call method with the right params', async () => {
      const loggerLogSpy = jest.spyOn(service['logger'], 'log');

      await service.sendEmail(mockEmails, mockEmailTitle, mockEmailContent);

      mockEmails.forEach((email) => {
        expect(mockEmailBlackListService.isEmailBlackListed).toBeCalledWith(email);
      });
      expect(loggerLogSpy).toBeCalledWith(`Sending email to: ${mockEmails.join(', ')}.`);
      expect(mockSesService.sendEmailFromFileSG).toBeCalledWith(mockEmails, mockEmailTitle, mockEmailContent, undefined, undefined);
    });

    it('should log error when there is blacklisted email', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      mockEmailBlackListService.isEmailBlackListed.mockResolvedValueOnce(mockEmails[0]);

      await service.sendEmail(mockEmails, mockEmailTitle, mockEmailContent);

      expect(loggerWarnSpy).toBeCalledWith(`Sending email to: ${mockEmails[1]}. Email blacklisted: ${mockEmails[0]}.`);
    });

    it('should log error when there is email with unknown status', async () => {
      const loggerWarnSpy = jest.spyOn(service['logger'], 'warn');

      mockEmailBlackListService.isEmailBlackListed.mockRejectedValueOnce('some error');

      await service.sendEmail(mockEmails, mockEmailTitle, mockEmailContent);

      expect(loggerWarnSpy).toBeCalledWith(`Sending email to: ${mockEmails[1]}. Email with unknown status: ${mockEmails[0]}.`);
    });

    it('should not call sesService sendEmailFromFileSG function when receivers.length <= 0', async () => {
      mockEmailBlackListService.isEmailBlackListed.mockResolvedValueOnce(mockEmails[0]).mockResolvedValueOnce(mockEmails[1]);

      await service.sendEmail(mockEmails, mockEmailTitle, mockEmailContent);

      expect(mockSesService.sendEmailFromFileSG).not.toBeCalled();
    });
  });

  describe('getFormSgTxnEmailType', () => {
    it('should return success emailType when called with success message', () => {
      const emailType = service.getFormSgTxnEmailType(mockSuccessMessageBody);

      expect(emailType).toEqual(FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS);
    });

    it('should return success with failed notification emailType when called with success but failed notification message', () => {
      const emailType = service.getFormSgTxnEmailType(mockSuccessWithFailedNotificationMessageBody);

      expect(emailType).toEqual(FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION);
    });

    it('should return single failure emailType when called with single failure message', () => {
      const emailType = service.getFormSgTxnEmailType(mockFailureMessageBody);

      expect(emailType).toEqual(FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE);
    });

    it('should return batch failure emailType when called with batch failure message', () => {
      const emailType = service.getFormSgTxnEmailType(mockBatchFailureMessageBody);

      expect(emailType).toEqual(FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE);
    });

    it('should return batch sidecare failure emailType when called with batch failure message with sidecar validation error', () => {
      const emailType = service.getFormSgTxnEmailType(mockBatchSidecareFailureMessageBody);

      expect(emailType).toEqual(FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE);
    });
  });

  describe('constructFormSgTxnEmailGeneralInfoSectionArgs', () => {
    const {
      systemConfig: { fileSGBaseURL },
      formSgConfig: { formSgRecallIssuanceFormUrl, formSgIssuanceErrorScenariosDocUrl },
    } = mockFileSGConfigService;

    it('should construct proper args when email is of type success', () => {
      expect(service.constructFormSgTxnEmailGeneralInfoSectionArgs(FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS, mockSuccessPayload)).toEqual({
        emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SUCCESS,
        fileSgBaseUrl: fileSGBaseURL,
        formSgRecallIssuanceFormUrl,
      });
    });

    it('should construct proper args when email is of type success-with-fail-notification', () => {
      expect(
        service.constructFormSgTxnEmailGeneralInfoSectionArgs(
          FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION,
          mockSuccessPayload,
        ),
      ).toEqual({
        emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SUCESSS_WITH_FAIL_NOTIFICATION,
        fileSgBaseUrl: fileSGBaseURL,
        formSgRecallIssuanceFormUrl,
        formSgIssuanceErrorScenariosDocUrl,
      });
    });

    it('should construct proper args when email is of type single-failure', () => {
      expect(
        service.constructFormSgTxnEmailGeneralInfoSectionArgs(FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE, mockFailurePayload),
      ).toEqual({ emailType: FORMSG_TRANSACTION_EMAIL_TYPE.SINGLE_FAILURE, formSgIssuanceErrorScenariosDocUrl });
    });

    it('should construct proper args when email is of type batch-sidecar-failure', () => {
      expect(
        service.constructFormSgTxnEmailGeneralInfoSectionArgs(
          FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE,
          mockBatchSidecarFailurePayload,
        ),
      ).toEqual({
        emailType: FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_SIDECAR_FAILURE,
        formSgIssuanceErrorScenariosDocUrl,
        failSubType: mockBatchSidecarErrorSubType,
      });
    });

    it('should construct proper args when email is of type batch-failure', () => {
      const { batchSize, failedTransactionCount, hasNotificationToRecipientFailure } = mockBatchFailurePayload;

      expect(
        service.constructFormSgTxnEmailGeneralInfoSectionArgs(FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE, mockBatchFailurePayload),
      ).toEqual({
        emailType: FORMSG_TRANSACTION_EMAIL_TYPE.BATCH_FAILURE,
        fileSgBaseUrl: fileSGBaseURL,
        formSgIssuanceErrorScenariosDocUrl,
        totalTransactionCount: batchSize,
        failedTransactionCount,
        hasNotificationToRecipientFailure,
      });
    });
  });
});
