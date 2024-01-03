import { SqsService as BaseSqsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseSqsService, mockCoreEventsMessage } from '../__mocks__/sqs.service.mock';
import { SqsService } from '../sqs.service';

describe('SqsService', () => {
  let service: SqsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SqsService,
        { provide: BaseSqsService, useValue: mockBaseSqsService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
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
      const { coreEventsQueueUrl } = mockFileSGConfigService.awsConfig;

      service.sendMessageToQueueCoreEvents(mockCoreEventsMessage);

      expect(mockBaseSqsService.sendMessageToSqs).toBeCalledWith(coreEventsQueueUrl, JSON.stringify(mockCoreEventsMessage));
    });
  });
});
