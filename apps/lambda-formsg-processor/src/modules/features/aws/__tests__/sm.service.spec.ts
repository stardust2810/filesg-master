import { AwsSmGetSecretException, SmService as BaseSmService } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseSmService, mockKey } from '../__mocks__/sm.service.mock';
import { mockStsService } from '../__mocks__/sts.service.mock';
import { SmService } from '../sm.service';
import { StsService } from '../sts.service';

describe('SmService', () => {
  let service: SmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmService,
        {
          provide: BaseSmService,
          useValue: mockBaseSmService,
        },
        {
          provide: StsService,
          useValue: mockStsService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<SmService>(SmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSecretValue', () => {
    it('baseSmService getSecretValue should be called with correct args', async () => {
      mockBaseSmService.getSecretValue.mockResolvedValueOnce({ SecretString: 'mockValue' });

      await service.getSecretValue(mockKey);

      expect(mockBaseSmService.getSecretValue).toBeCalledWith(mockKey);
    });

    it('SMGetSecretException should be thrown if key cannot be found', async () => {
      mockBaseSmService.getSecretValue.mockResolvedValueOnce({ SecretString: undefined });

      await expect(service.getSecretValue(mockKey)).rejects.toThrowError(AwsSmGetSecretException);
    });
  });
});
