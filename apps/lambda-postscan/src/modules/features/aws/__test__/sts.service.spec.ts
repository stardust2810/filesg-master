import { StsService as BaseStsService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseStsService } from '../__mocks__/sts.service.mock';
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

  describe('assumeScanMoveRole', () => {
    it('should be defined', () => {
      expect(service.assumeScanMoveRole).toBeDefined();
    });

    it('should call baseStsService assumeRoleInSTS with correct args', async () => {
      const { scanMoveRoleArn, assumeRoleSessionDuration } = mockFileSGConfigService.awsConfig;

      await service.assumeScanMoveRole();

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(scanMoveRoleArn, 'scan-move', assumeRoleSessionDuration);
    });
  });
});
