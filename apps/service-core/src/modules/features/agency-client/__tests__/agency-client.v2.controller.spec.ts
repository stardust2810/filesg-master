import { AgencyClientPhotoRequest } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { APEX_INT_CLIENT_PROVIDER } from '../../../../consts';
import { mockApexClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockOpenAttestationService } from '../../open-attestation/__mocks__/open-attestation.service.mock';
import { OpenAttestationService } from '../../open-attestation/open-attestation.service';
import { mockAgencyClientV2Service } from '../__mocks__/agency-client.v2.service.mock';
import { AgencyClientV2Controller } from '../agency-client.v2.controller';
import { AgencyClientV2Service } from '../agency-client.v2.service';

describe('AgencyClientV2Controller', () => {
  let controller: AgencyClientV2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgencyClientV2Controller],
      providers: [
        {
          provide: AgencyClientV2Service,
          useValue: mockAgencyClientV2Service,
        },
        {
          provide: OpenAttestationService,
          useValue: mockOpenAttestationService,
        },
        {
          provide: APEX_INT_CLIENT_PROVIDER,
          useValue: mockApexClientProvider,
        },
      ],
    }).compile();

    controller = module.get<AgencyClientV2Controller>(AgencyClientV2Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('retrievePhotoFromCiris', () => {
    it('should be defined', () => {
      expect(controller).toBeDefined();
    });
    it('should call retrieveOaImage with oaDocument', async () => {
      const mockReqBody = { oaDocument: 'test' } as unknown as AgencyClientPhotoRequest;

      await controller.retrievePhotoFromCiris(mockReqBody);
      expect(mockAgencyClientV2Service.retrieveOaImage).toBeCalledWith(mockReqBody.oaDocument);
    });
  });
});
