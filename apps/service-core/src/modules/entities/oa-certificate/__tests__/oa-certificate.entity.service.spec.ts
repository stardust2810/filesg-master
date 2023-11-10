import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, OA_CERTIFICATE_STATUS, REVOCATION_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { OACertificate, OaCertificateUpdateModel } from '../../../../entities/oa-certificate';
import { mockOaCertificateEntityRepository } from '../__mocks__/oa-certificate.entity.repository.mock';
import {
  mockOaCertificate,
  mockOaCertificateModels,
  mockOaCertificateUuid,
  mockOaCertificateUuid2,
} from '../__mocks__/oa-certificate.entity.service.mock';
import { createMockOaCertificate } from '../__mocks__/oa-certificate.mock';
import { OaCertificateEntityRepository } from '../oa-certificate.entity.repository';
import { OaCertificateEntityService } from '../oa-certificate.entity.service';

const helpers = require('../../../../utils/helpers');

describe('OaCertificateEntityService', () => {
  let service: OaCertificateEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OaCertificateEntityService, { provide: OaCertificateEntityRepository, useValue: mockOaCertificateEntityRepository }],
    }).compile();

    service = module.get<OaCertificateEntityService>(OaCertificateEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildOaCertificate', () => {
    it(`should call getRepository's create function with right params`, () => {
      const oaCertificateModel = mockOaCertificateModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockOaCertificateUuid);

      service.buildOaCertificate(oaCertificateModel);

      expect(mockOaCertificateEntityRepository.getRepository().create).toBeCalledWith(oaCertificateModel);
    });
  });

  describe('saveOaCertificates', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedOaCertificates = mockOaCertificateModels.map((model, index) =>
        createMockOaCertificate({ uuid: `mockOaCertificate-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockOaCertificateUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockOaCertificateUuid2);
      const buildOaCertificateSpy = jest.spyOn(service, 'buildOaCertificate');

      await service.saveOaCertificates(mockOaCertificateModels);

      mockOaCertificateModels.forEach((model) => expect(buildOaCertificateSpy).toBeCalledWith(model));
      expect(mockOaCertificateEntityRepository.getRepository().save).toBeCalledWith(expectedOaCertificates);
    });
  });

  describe('saveOaCertificate', () => {
    it(`should call saveOaCertificates function with a model in array`, async () => {
      const oaCertificateModel = mockOaCertificateModels[0];

      const saveOaCertificatesSpy = jest.spyOn(service, 'saveOaCertificates');

      await service.saveOaCertificate(oaCertificateModel);

      expect(saveOaCertificatesSpy).toBeCalledWith([oaCertificateModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveOaCertificateWithFileAssetExpiry', () => {
    it('should return oaCertificate when found', async () => {
      mockOaCertificateEntityRepository.findOaCertificateWithFileAssetExpiry.mockResolvedValueOnce(mockOaCertificate);

      expect(await service.retrieveOaCertificateWithFileAssetExpiry(mockOaCertificateUuid)).toEqual(mockOaCertificate);
      expect(mockOaCertificateEntityRepository.findOaCertificateWithFileAssetExpiry).toBeCalledWith(mockOaCertificateUuid);
    });

    it('should throw EntityNotFoundException when oaCertificate is not found', async () => {
      mockOaCertificateEntityRepository.findOaCertificateWithFileAssetExpiry.mockResolvedValueOnce(null);

      await expect(service.retrieveOaCertificateWithFileAssetExpiry(mockOaCertificateUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.OPEN_ATTESTATION_SERVICE, OACertificate.name, 'id', mockOaCertificateUuid),
      );
      expect(mockOaCertificateEntityRepository.findOaCertificateWithFileAssetExpiry).toBeCalledWith(mockOaCertificateUuid);
    });
  });

  // =============================================================================
  // Update
  // =============================================================================
  describe('updateOaCertificates', () => {
    it(`should call oaCertificate repository's updateOaCertificates function with right params`, async () => {
      const oaCertificateIds = ['fileAsset-id-1', 'fileAsset-id-2'];
      const dataToBeUpdated: OaCertificateUpdateModel = {
        status: OA_CERTIFICATE_STATUS.REVOKED,
        revocationType: REVOCATION_TYPE.EXPIRED,
      };

      await service.updateOaCertificates(oaCertificateIds, dataToBeUpdated);

      expect(mockOaCertificateEntityRepository.updateOaCertificates).toBeCalledWith(oaCertificateIds, dataToBeUpdated, undefined);
    });
  });
});
