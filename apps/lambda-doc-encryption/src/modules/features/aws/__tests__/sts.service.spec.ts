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
        { provide: BaseStsService, useValue: mockBaseStsService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<StsService>(StsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assumeDocumentEncryptionRole', () => {
    it('should call baseStsService assumeRoleInSts with the correct args', async () => {
      const mockReceiver = 'some-receiver';
      const { uploadMoveRoleArn, assumeRoleSessionDuration } = mockFileSGConfigService.awsConfig;

      await service.assumeDocumentEncryptionRole(mockReceiver);

      expect(mockBaseStsService.assumeRoleInSts).toBeCalledWith(uploadMoveRoleArn, 'doc-encryption', assumeRoleSessionDuration, [
        { Key: 'receiver', Value: mockReceiver },
      ]);
    });
  });
});
