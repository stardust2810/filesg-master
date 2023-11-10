import { StsService as BaseStsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseStsService } from '../__mocks__/aws-sts.service.mock';
import { StsService } from '../sts.service';

describe('StsService', () => {
  let service: StsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StsService,
        {
          provide: BaseStsService,
          useValue: mockBaseStsService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<StsService>(StsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assumeSftpProcessorRole', () => {
    it('baseStsService assumeRoleInSts should be called with correct args', async () => {
      const { awsConfig } = mockFileSGConfigService;
      await service.assumeSftpProcessorRole();

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(
        awsConfig.sftpRoleArn,
        'sftp-processor',
        awsConfig.assumeRoleSessionDuration,
      );
    });
  });
});
