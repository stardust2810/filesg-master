import { Message } from '@aws-sdk/client-sqs';
import { RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';

import { mockNotificationHistoryEntityService } from '../../../entities/notification-history/__mocks__/notification-history.entity.service.mock';
import { NotificationHistoryEntityService } from '../../../entities/notification-history/notification-history.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import {
  mockBounceEmailNotificationHistory,
  mockIssuanceEmailNotificationMessageBounce,
  mockSesMessageWithBounceInfo,
  TestSesNotificationQueueHandlerService,
} from '../__mocks__/ses-queue-handler.service.mock';
import { mockTransactionalEmailHandlerService } from '../__mocks__/transactional-email-handler.service.mock';
import { TransactionalEmailHandlerService } from '../events/email-type-handlers/transactional-email-handler.service';

const helpers = require('../../../../utils/helpers');

describe('SesQueueHandlerService', () => {
  let service: TestSesNotificationQueueHandlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSesNotificationQueueHandlerService,
        { provide: SqsService, useValue: mockSqsService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: TransactionalEmailHandlerService, useValue: mockTransactionalEmailHandlerService },
        { provide: NotificationHistoryEntityService, useValue: mockNotificationHistoryEntityService },
        { provide: RedisService, useValue: mockFileSGRedisService },
      ],
    }).compile();

    service = module.get<TestSesNotificationQueueHandlerService>(TestSesNotificationQueueHandlerService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pollHandler', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should sleep for 2 seconds when there is no message polled', async () => {
      mockSqsService.receiveMessageFromQueueCoreEvents.mockResolvedValueOnce([]);

      const sleepInSecsSpy = jest.spyOn(helpers, 'sleepInSecs');
      sleepInSecsSpy.mockReturnThis();

      const onMessageHandlerSpy = jest.spyOn(service, 'onMessageHandler');

      await service.pollHandler();

      expect(sleepInSecsSpy).toBeCalledWith(mockFileSGConfigService.systemConfig.pollingSleepTimeInSeconds);
      expect(onMessageHandlerSpy).toBeCalledTimes(0);
    });

    it('should process the messages when there are messages polled', async () => {
      const message: Message = {
        MessageId: 'message-1',
      };

      const message2: Message = {
        MessageId: 'message-2',
      };

      const mockMessages = [message, message2];
      mockSqsService.receiveMessageFromQueueSesEvent.mockResolvedValueOnce(mockMessages);

      const onMessageHandlerSpy = jest.spyOn(service, 'onMessageHandler');
      onMessageHandlerSpy.mockReturnThis();

      const sleepInSecsSpy = jest.spyOn(helpers, 'sleepInSecs');

      await service.pollHandler();

      expect(onMessageHandlerSpy).toBeCalledTimes(2);
      mockMessages.forEach((message) => expect(onMessageHandlerSpy).toBeCalledWith(message));
      expect(sleepInSecsSpy).toBeCalledTimes(0);
    });
  });

  describe('onMessageHandler', () => {
    it('should should call changeMessageVisiblityTimeoutInQueueSesEvents when error occurs like message body is empty', async () => {
      const message: Message = {
        MessageId: 'message-1',
        Attributes: { ApproximateReceiveCount: '1' },
      };

      await service.onMessageHandler(message);

      expect(mockSqsService.changeMessageVisiblityTimeoutInQueueSesEvents).toBeCalledWith(message, 0);
    });

    it('should call method with the right params when messageId can be found in redis', async () => {
      const mockMessageId = 'mock-message-id';

      mockFileSGRedisService.get.mockResolvedValueOnce(mockMessageId);

      await service.onMessageHandler(mockSesMessageWithBounceInfo);

      expect(mockTransactionalEmailHandlerService.processMessage).toBeCalledWith(mockIssuanceEmailNotificationMessageBounce, true);
      expect(mockSqsService.deleteMessageInQueueSesEvent).toBeCalledWith(mockSesMessageWithBounceInfo);
    });

    it("should call method with the right params when messageId can't be found in redis", async () => {
      mockFileSGRedisService.get.mockResolvedValueOnce(null);
      mockNotificationHistoryEntityService.retrieveNotificationHistoryByMessageId.mockResolvedValueOnce(mockBounceEmailNotificationHistory);

      await service.onMessageHandler(mockSesMessageWithBounceInfo);

      expect(mockTransactionalEmailHandlerService.processMessage).toBeCalledWith(mockIssuanceEmailNotificationMessageBounce);
      expect(mockSqsService.deleteMessageInQueueSesEvent).toBeCalledWith(mockSesMessageWithBounceInfo);
    });

    it('should call deleteMessageInQueueSesEvent when there is no notification history found', async () => {
      mockNotificationHistoryEntityService.retrieveNotificationHistoryByMessageId.mockResolvedValueOnce(null);

      await service.onMessageHandler(mockSesMessageWithBounceInfo);

      expect(mockNotificationHistoryEntityService.retrieveNotificationHistoryByMessageId).toBeCalledWith(
        mockIssuanceEmailNotificationMessageBounce.mail.messageId,
      );
      expect(mockSqsService.deleteMessageInQueueSesEvent).toBeCalledWith(mockSesMessageWithBounceInfo);
    });
  });
});
