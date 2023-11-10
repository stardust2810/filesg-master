import {
  EVENT_LOGGING_EVENTS,
  FormSgRecipientNotificationDeliveryFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  maskUin,
} from '@filesg/backend-common';
import { FORMSG_FAIL_CATEGORY, NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { mockEmailBlackListEntityService } from '../../../entities/email-black-list/__mocks__/email-black-list.entity.service.mock';
import { EmailBlackListEntityService } from '../../../entities/email-black-list/email-black-list.entity.service';
import { mockNotificationHistoryEntityService } from '../../../entities/notification-history/__mocks__/notification-history.entity.service.mock';
import { NotificationHistoryEntityService } from '../../../entities/notification-history/notification-history.entity.service';
import { mockEventLogsServiceClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import {
  mockActivity1,
  mockActivityUuid1,
  mockBouncedRecipients,
  mockBounceEmail,
  mockComplaintEmail,
  mockDeliveryEmail,
  mockFailedReason,
  mockFailSubType,
  mockIssuanceEmailNotificationMessageBounce,
  mockIssuanceEmailNotificationMessageComplaint,
  mockIssuanceEmailNotificationMessageDelivery,
  mockMaskedUin,
  mockNotificationHistory1,
  mockNotificationHistory2,
  mockTransactionUuid1,
  TestTransactionalEmailHandlerService,
} from '../__mocks__/transactional-email-handler.service.mock';

describe('TransactionalEmailHandlerService', () => {
  let service: TestTransactionalEmailHandlerService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestTransactionalEmailHandlerService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: EmailBlackListEntityService, useValue: mockEmailBlackListEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: NotificationHistoryEntityService, useValue: mockNotificationHistoryEntityService },
        { provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceClientProvider },
      ],
    }).compile();

    service = module.get<TestTransactionalEmailHandlerService>(TestTransactionalEmailHandlerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('processMessage', () => {
    it('should be defined', () => {
      expect(service.processMessage).toBeDefined();
    });

    describe('when handling notification delivery for notification stored in notification history', () => {
      beforeEach(() => {
        mockNotificationHistoryEntityService.retrieveNotificationHistoryWithTransactionByMessageId.mockResolvedValueOnce(
          mockNotificationHistory1,
        );
      });

      it('should call the methods with right params when notification delivery is of type Delivery', async () => {
        const { messageId } = mockIssuanceEmailNotificationMessageBounce.mail;

        const bouncedEmailsHandlerSpy = jest.spyOn(service, 'bouncedEmailsHandler');

        await service.processMessage(mockIssuanceEmailNotificationMessageDelivery);

        expect(mockNotificationHistoryEntityService.retrieveNotificationHistoryWithTransactionByMessageId).toBeCalledWith(messageId);
        expect(mockNotificationHistoryEntityService.updateNotificationHistoryByMessageId).toBeCalledWith(
          mockIssuanceEmailNotificationMessageDelivery.mail.messageId,
          { status: NOTIFICATION_STATUS.SUCCESS, statusDetails: `[${mockDeliveryEmail}] Delivery successful` },
        );
        expect(bouncedEmailsHandlerSpy).toBeCalledTimes(0);
      });

      it('should call the methods with right params when notification delivery is of type Bounce', async () => {
        const { messageId } = mockIssuanceEmailNotificationMessageBounce.mail;
        const { bounceType, bounceSubType, bouncedRecipients } = mockIssuanceEmailNotificationMessageBounce.bounce!;

        const bouncedEmailsHandlerSpy = jest.spyOn(service, 'bouncedEmailsHandler');

        await service.processMessage(mockIssuanceEmailNotificationMessageBounce);

        expect(mockNotificationHistoryEntityService.retrieveNotificationHistoryWithTransactionByMessageId).toBeCalledWith(messageId);
        expect(mockNotificationHistoryEntityService.updateNotificationHistoryByMessageId).toBeCalledWith(messageId, {
          status: NOTIFICATION_STATUS.FAILED,
          statusDetails: `[${mockBounceEmail}] Bounce Type: ${bounceType}, Bounce SubType: ${bounceSubType}`,
        });
        expect(bouncedEmailsHandlerSpy).toBeCalledWith(bouncedRecipients);
      });

      it('should call the methods with right params when notification delivery is of type Complaint', async () => {
        const { messageId } = mockIssuanceEmailNotificationMessageComplaint.mail;
        const { complaintFeedbackType, complaintSubType } = mockIssuanceEmailNotificationMessageComplaint.complaint!;

        const bouncedEmailsHandlerSpy = jest.spyOn(service, 'bouncedEmailsHandler');

        await service.processMessage(mockIssuanceEmailNotificationMessageComplaint);

        expect(mockNotificationHistoryEntityService.updateNotificationHistoryByMessageId).toBeCalledWith(messageId, {
          status: NOTIFICATION_STATUS.FAILED,
          statusDetails: `[${mockComplaintEmail}] Complaint Feedback Type: ${complaintFeedbackType}, Compliant SubType: ${complaintSubType}`,
        });
        expect(bouncedEmailsHandlerSpy).toBeCalledTimes(0);
      });

      describe("when notification transaction' creationMethod is formsg and activity is recieve transfer", () => {
        it('should call saveEventLogs with right params when notification status is success', async () => {
          const { uuid, transaction, user } = mockActivity1;

          const saveEventLogsSpy = jest.spyOn(service, 'saveEventLogs');

          await service.processMessage(mockIssuanceEmailNotificationMessageDelivery);

          expect(saveEventLogsSpy).toBeCalledWith(
            EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
            transaction!.uuid,
            uuid,
            maskUin(user!.uin!),
            mockDeliveryEmail,
          );
        });

        it('should call saveEventLogs with right params when notification status is failure', async () => {
          const { uuid, transaction, user } = mockActivity1;
          const { bounceType, bounceSubType } = mockIssuanceEmailNotificationMessageBounce.bounce!;

          const saveEventLogsSpy = jest.spyOn(service, 'saveEventLogs');

          await service.processMessage(mockIssuanceEmailNotificationMessageBounce);

          expect(saveEventLogsSpy).toBeCalledWith(
            EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
            transaction!.uuid,
            uuid,
            maskUin(user!.uin!),
            mockBounceEmail,
            FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BOUNCED,
            `Bounce Type: ${bounceType}, Bounce SubType: ${bounceSubType}`,
          );
        });

        // gd TODO: add unit test for complaint email
      });

      describe("when notification transaction' creationMethod is not formsg", () => {
        it('should not call saveEventLogs', async () => {
          mockNotificationHistoryEntityService.retrieveNotificationHistoryWithTransactionByMessageId.mockReset();
          mockNotificationHistoryEntityService.retrieveNotificationHistoryWithTransactionByMessageId.mockResolvedValueOnce(
            mockNotificationHistory2,
          );

          const saveEventLogsSpy = jest.spyOn(service, 'saveEventLogs');

          await service.processMessage(mockIssuanceEmailNotificationMessageBounce);

          expect(saveEventLogsSpy).toBeCalledTimes(0);
        });
      });
    });

    describe('when handling notification delivery for notification stored in redis', () => {
      let loggerErrorSpy: jest.SpyInstance;

      beforeAll(() => {
        loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      });

      it('should log error when notification type is of complaint', async () => {
        const { complaint } = mockIssuanceEmailNotificationMessageComplaint;
        const statusDetails = `Complaint Feedback Type: ${complaint!.complaintFeedbackType}, Compliant SubType: ${
          complaint!.complaintSubType || ''
        }`;

        await service.processMessage(mockIssuanceEmailNotificationMessageComplaint, true);

        expect(loggerErrorSpy).toBeCalledWith(
          `Delivery to email(s) ${complaint?.complainedRecipients
            .map((recipient) => recipient.emailAddress)
            .join(', ')} failed with ${statusDetails}`,
        );
      });

      it('should log error when notification type is of bounce', async () => {
        const { bounce } = mockIssuanceEmailNotificationMessageBounce;
        const statusDetails = `Bounce Type: ${bounce!.bounceType}, Bounce SubType: ${bounce!.bounceSubType}`;

        const bouncedEmailsHandlerSpy = jest.spyOn(service, 'bouncedEmailsHandler');

        await service.processMessage(mockIssuanceEmailNotificationMessageBounce, true);

        expect(loggerErrorSpy).toBeCalledWith(
          `Delivery to email(s) ${bounce?.bouncedRecipients
            .map((recipient) => recipient.emailAddress)
            .join(', ')} failed with ${statusDetails}`,
        );
        expect(bouncedEmailsHandlerSpy).toBeCalledWith(bounce!.bouncedRecipients);
      });
    });
  });

  describe('bouncedEmailsHandler', () => {
    it('should call methods with the right params', async () => {
      await service.bouncedEmailsHandler(mockBouncedRecipients);

      for (const recipient of mockBouncedRecipients) {
        expect(mockEmailBlackListEntityService.upsertByEmail).toBeCalledWith(recipient.emailAddress);
      }
    });

    it('should log error when any emails failed to be blacklisted', async () => {
      const loggerErrorSpy = jest.spyOn(service['logger'], 'error');
      mockEmailBlackListEntityService.upsertByEmail.mockRejectedValueOnce('some error');

      await service.bouncedEmailsHandler(mockBouncedRecipients);

      expect(loggerErrorSpy).toBeCalledWith(
        `[TransactionalEmailHandler] Bounced email(s) ${mockBounceEmail} failed to be added to the blacklist`,
      );
    });
  });

  describe('saveEventLogs', () => {
    it('should call method with the right param when event is of type success', async () => {
      const event: FormSgRecipientNotificationDeliverySuccessEvent = {
        type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
        channel: NOTIFICATION_CHANNEL.EMAIL,
        transactionUuid: mockTransactionUuid1,
        recipientActivityUuid: mockActivityUuid1,
        maskedUin: mockMaskedUin,
        email: mockDeliveryEmail,
      };

      await service.saveEventLogs(
        EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
        mockTransactionUuid1,
        mockActivityUuid1,
        mockMaskedUin,
        mockDeliveryEmail,
      );

      expect(mockEventLogsServiceClientProvider.post).toBeCalledWith('v1/events', { event });
    });

    it('should call method with the right param when event is of type failure', async () => {
      const event: FormSgRecipientNotificationDeliveryFailureEvent = {
        type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
        channel: NOTIFICATION_CHANNEL.EMAIL,
        transactionUuid: mockTransactionUuid1,
        recipientActivityUuid: mockActivityUuid1,
        maskedUin: mockMaskedUin,
        email: mockDeliveryEmail,
        failSubType: mockFailSubType,
        failedReason: mockFailedReason,
      };

      await service.saveEventLogs(
        EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
        mockTransactionUuid1,
        mockActivityUuid1,
        mockMaskedUin,
        mockDeliveryEmail,
        mockFailSubType,
        mockFailedReason,
      );

      expect(mockEventLogsServiceClientProvider.post).toBeCalledWith('v1/events', { event });
    });
  });
});
