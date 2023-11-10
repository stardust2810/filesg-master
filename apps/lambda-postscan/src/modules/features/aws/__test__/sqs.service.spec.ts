import { SqsService as BaseSqsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseSqsService, mockMessage } from '../__mocks__/sqs.service.mock';
import { SqsService } from '../sqs.service';

describe('SQSService', () => {
  let service: SqsService;

  beforeEach(async () => {
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

  it('should call baseSqsService sendMessageToSqs with correct args', async () => {
    const { sqsCoreEvents } = mockFileSGConfigService.awsConfig;

    await service.sendMessageToQueueCoreEvents(mockMessage);

    expect(mockBaseSqsService.sendMessageToSqs).toBeCalledWith(sqsCoreEvents, mockMessage);
  });
});
