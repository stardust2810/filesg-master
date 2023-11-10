import { SqsService as BaseSqsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseSqsService, mockMessageId, mockMsgReceiptHandle } from '../__mocks__/aws-sqs.service.mock';
import { SqsService } from '../sqs.service';

describe('SqsService', () => {
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

  describe('deleteMessageInQueueSftpProcess', () => {
    it('baseSqsService deleteMessageInSqs should be called with correct args', async () => {
      const { awsConfig } = mockFileSGConfigService;
      await service.deleteMessageInQueueSftpProcessor(mockMessageId, mockMsgReceiptHandle);

      expect(mockBaseSqsService.deleteMessageInSqs).toBeCalledWith(awsConfig.sqsSftpProcessor, mockMessageId, mockMsgReceiptHandle);
    });
  });
});
