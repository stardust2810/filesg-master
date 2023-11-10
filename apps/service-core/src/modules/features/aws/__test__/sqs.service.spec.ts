/* eslint-disable sonarjs/no-duplicate-string */
import { SqsService as BaseSqsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseSqsService, mockSqsMessage, mockTransferEventsMessage } from '../__mocks__/sqs.service.mock';
import { SqsService } from '../sqs.service';

describe('SqsService', () => {
  let service: SqsService;

  const { transferEventsQueueUrl, coreEventsQueueUrl, sesEventQueueUrl } = mockFileSGConfigService.awsConfig;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsService,
        {
          provide: BaseSqsService,
          useValue: mockBaseSqsService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<SqsService>(SqsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMessageToQueueTransferEvents', () => {
    it('should be defined', () => {
      expect(service.sendMessageToQueueTransferEvents).toBeDefined();
    });

    it('should call baseSqsService sendMessageToSqs with correct args', () => {
      service.sendMessageToQueueTransferEvents(mockTransferEventsMessage);

      expect(mockBaseSqsService.sendMessageToSqs).toBeCalledWith(transferEventsQueueUrl, JSON.stringify(mockTransferEventsMessage));
    });
  });

  describe('receiveMessageFromQueueCoreEvents', () => {
    it('should be defined', () => {
      expect(service.receiveMessageFromQueueCoreEvents).toBeDefined();
    });

    it('should call baseSqsService receiveMessageFromSqs with correct args', () => {
      service.receiveMessageFromQueueCoreEvents();

      expect(mockBaseSqsService.receiveMessageFromSqs).toBeCalledWith(coreEventsQueueUrl);
    });
  });

  describe('receiveMessageFromQueueSesEvent', () => {
    it('should be defined', () => {
      expect(service.receiveMessageFromQueueSesEvent).toBeDefined();
    });

    it('should call baseSqsService receiveMessageFromSqs with correct args', () => {
      service.receiveMessageFromQueueSesEvent();

      expect(mockBaseSqsService.receiveMessageFromSqs).toBeCalledWith(sesEventQueueUrl);
    });
  });

  describe('deleteMessageInQueueCoreEvents', () => {
    it('should be defined', () => {
      expect(service.deleteMessageInQueueCoreEvents).toBeDefined();
    });

    it('should call baseSqsService deleteMessageInSqs with correct args', () => {
      service.deleteMessageInQueueCoreEvents(mockSqsMessage);

      expect(mockBaseSqsService.deleteMessageInSqs).toBeCalledWith(coreEventsQueueUrl, mockSqsMessage);
    });
  });

  describe('deleteMessageInQueueSesEvent', () => {
    it('should be defined', () => {
      expect(service.deleteMessageInQueueSesEvent).toBeDefined();
    });

    it('should call baseSqsService deleteMessageInSqs with correct args', () => {
      service.deleteMessageInQueueSesEvent(mockSqsMessage);

      expect(mockBaseSqsService.deleteMessageInSqs).toBeCalledWith(sesEventQueueUrl, mockSqsMessage);
    });
  });
});
