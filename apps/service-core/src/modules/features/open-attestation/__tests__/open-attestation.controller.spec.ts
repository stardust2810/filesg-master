import { Test, TestingModule } from '@nestjs/testing';

import { mockOaCertificateEntityService } from '../../../entities/oa-certificate/__mocks__/oa-certificate.entity.service.mock';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { OpenAttestationController } from '../open-attestation.controller';
import { OpenAttestationService } from '../open-attestation.service';

describe('OpenAttestationController', () => {
  let controller: OpenAttestationController;
  const mockOpenAttestationService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpenAttestationController],
      providers: [
        { provide: OpenAttestationService, useValue: mockOpenAttestationService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
      ],
    }).compile();

    controller = module.get<OpenAttestationController>(OpenAttestationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
