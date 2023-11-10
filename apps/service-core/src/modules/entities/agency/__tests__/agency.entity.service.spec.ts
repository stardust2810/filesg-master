import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, STATUS, TEMPLATE_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Agency } from '../../../../entities/agency';
import { mockAgencyEntityRepository } from '../__mocks__/agency.entity.repository.mock';
import { mockAgency, mockAgencyModels, mockAgencyUuid, mockAgencyUuid2 } from '../__mocks__/agency.entity.service.mock';
import { createMockAgency } from '../__mocks__/agency.mock';
import { AgencyEntityRepository } from '../agency.entity.repository';
import { AgencyEntityService } from '../agency.entity.service';

const helpers = require('../../../../utils/helpers');

describe('AgencyEntityService', () => {
  let service: AgencyEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgencyEntityService, { provide: AgencyEntityRepository, useValue: mockAgencyEntityRepository }],
    }).compile();

    service = module.get<AgencyEntityService>(AgencyEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildAgency', () => {
    it(`should call getRepository's create function with right params`, () => {
      const agencyModel = mockAgencyModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAgencyUuid);

      service.buildAgency(agencyModel);

      expect(mockAgencyEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockAgencyUuid,
        status: STATUS.ACTIVE,
        ...agencyModel,
      });
    });
  });

  describe('saveAgencies', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedAgencies = mockAgencyModels.map((model, index) => createMockAgency({ uuid: `mockAgency-uuid-${index + 1}`, ...model }));

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAgencyUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockAgencyUuid2);
      const buildAgencySpy = jest.spyOn(service, 'buildAgency');

      await service.saveAgencies(mockAgencyModels);

      mockAgencyModels.forEach((model) => expect(buildAgencySpy).toBeCalledWith(model));
      expect(mockAgencyEntityRepository.getRepository().save).toBeCalledWith(expectedAgencies);
    });
  });

  describe('saveAgency', () => {
    it(`should call saveAgencies function with a model in array`, async () => {
      const agencyModel = mockAgencyModels[0];

      const saveAgenciesSpy = jest.spyOn(service, 'saveAgencies');

      await service.saveAgency(agencyModel);

      expect(saveAgenciesSpy).toBeCalledWith([agencyModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('isAgencyExistsByCode', () => {
    it(`should return true when agency is found by code`, async () => {
      const { code: agencyCode } = mockAgency;
      mockAgencyEntityRepository.findByCode.mockResolvedValueOnce(mockAgency);

      expect(await service.isAgencyExistsByCode(agencyCode)).toEqual(true);
      expect(mockAgencyEntityRepository.findByCode).toBeCalledWith(agencyCode, undefined, undefined);
    });

    it(`should return false when agency is not found by code`, async () => {
      const { code: agencyCode } = mockAgency;
      mockAgencyEntityRepository.findByCode.mockResolvedValueOnce(null);

      expect(await service.isAgencyExistsByCode(agencyCode)).toEqual(false);
      expect(mockAgencyEntityRepository.findByCode).toBeCalledWith(agencyCode, undefined, undefined);
    });
  });

  describe('isAgencyExistByIdentityProofLocation', () => {
    it(`should return true when agency is found by identityProofLocation`, async () => {
      const { identityProofLocation } = mockAgency;
      mockAgencyEntityRepository.findByIdentityProofLocation.mockResolvedValueOnce(mockAgency);

      expect(await service.isAgencyExistByIdentityProofLocation(identityProofLocation)).toEqual(true);
      expect(mockAgencyEntityRepository.findByIdentityProofLocation).toBeCalledWith(identityProofLocation, undefined, undefined);
    });

    it(`should return false when agency is not found by code`, async () => {
      const { identityProofLocation } = mockAgency;
      mockAgencyEntityRepository.findByIdentityProofLocation.mockResolvedValueOnce(null);

      expect(await service.isAgencyExistByIdentityProofLocation(identityProofLocation)).toEqual(false);
      expect(mockAgencyEntityRepository.findByIdentityProofLocation).toBeCalledWith(identityProofLocation, undefined, undefined);
    });
  });

  describe('retrieveAgencyWithEservicesByCode', () => {
    it('should return agency when found', async () => {
      const { code: agencyCode } = mockAgency;
      mockAgencyEntityRepository.findAgencyWithEservicesByCode.mockResolvedValueOnce(mockAgency);

      expect(await service.retrieveAgencyWithEservicesByCode(agencyCode)).toEqual(mockAgency);
      expect(mockAgencyEntityRepository.findAgencyWithEservicesByCode).toBeCalledWith(agencyCode, undefined);
    });

    it('should throw EntityNotFoundException when activity is not found', async () => {
      const { code: agencyCode } = mockAgency;

      await expect(service.retrieveAgencyWithEservicesByCode(agencyCode)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ACTIVITY_SERVICE, Agency.name, 'code', agencyCode),
      );
      expect(mockAgencyEntityRepository.findAgencyWithEservicesByCode).toBeCalledWith(agencyCode, undefined);
    });
  });

  describe('retrieveAgencyByCodeWithTemplatesByNames', () => {
    it('should return agency when found', async () => {
      const { code: agencyCode } = mockAgency;
      mockAgencyEntityRepository.findAgencyByCodeWithTemplatesByNames.mockResolvedValueOnce(mockAgency);

      expect(
        await service.retrieveAgencyByCodeWithTemplatesByNames(agencyCode, ['mock name 1'], TEMPLATE_TYPE.TRANSACTION_CUSTOM_MESSAGE),
      ).toEqual(
        expect.objectContaining({
          code: agencyCode,
        }),
      );
    });
  });
});
