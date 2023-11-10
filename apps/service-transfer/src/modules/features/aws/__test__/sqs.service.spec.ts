/* eslint-disable sonarjs/no-duplicate-string */
import { SqsService as BaseSqsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseSqsService, mockCoreEventsMessage, mockSqsMessage } from '../__mocks__/aws-sqs.service.mock';
import { SqsService } from '../sqs.service';

describe('SqsService', () => {
  let service: SqsService;

  const { transferEventsQueueUrl, coreEventsQueueUrl } = mockFileSGConfigService.awsConfig;

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

  describe('sendMessageToQueueCoreEvents', () => {
    it('should be defined', () => {
      expect(service.sendMessageToQueueCoreEvents).toBeDefined();
    });

    it('should call baseSqsService sendMessageToSqs with correct args', () => {
      service.sendMessageToQueueCoreEvents(mockCoreEventsMessage);

      expect(mockBaseSqsService.sendMessageToSqs).toBeCalledWith(coreEventsQueueUrl, JSON.stringify(mockCoreEventsMessage));
    });
  });

  describe('receiveMessageFromQueueTransferEvents', () => {
    it('should be defined', () => {
      expect(service.receiveMessageFromQueueTransferEvents).toBeDefined();
    });

    it('should call baseSqsService receiveMessageFromSqs with correct args', () => {
      service.receiveMessageFromQueueTransferEvents();

      expect(mockBaseSqsService.receiveMessageFromSqs).toBeCalledWith(transferEventsQueueUrl);
    });
  });

  describe('deleteMessageInQueueTransferEvents', () => {
    it('should be defined', () => {
      expect(service.deleteMessageInQueueTransferEvents).toBeDefined();
    });

    it('should call baseSqsService deleteMessageInSqs with correct args', () => {
      service.deleteMessageInQueueTransferEvents(mockSqsMessage);

      expect(mockBaseSqsService.deleteMessageInSqs).toBeCalledWith(transferEventsQueueUrl, mockSqsMessage);
    });
  });
});
