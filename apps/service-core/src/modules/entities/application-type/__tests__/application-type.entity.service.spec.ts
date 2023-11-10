import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { In } from 'typeorm';

import { ApplicationType } from '../../../../entities/application-type';
import { mockApplicationTypeEntityRepository } from '../__mocks__/application-type.entity.repository.mock';
import {
  mockApplicationType,
  mockApplicationTypeModels,
  mockApplicationTypeUuid,
  mockApplicationTypeUuid2,
} from '../__mocks__/application-type.entity.service.mock';
import { createMockApplicationType } from '../__mocks__/application-type.mock';
import { ApplicationTypeEntityRepository } from '../application-type.entity.repository';
import { ApplicationTypeEntityService } from '../application-type.entity.service';

const helpers = require('../../../../utils/helpers');

describe('ApplicationTypeEntityService', () => {
  let service: ApplicationTypeEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationTypeEntityService,
        { provide: ApplicationTypeEntityRepository, useValue: mockApplicationTypeEntityRepository },
      ],
    }).compile();

    service = module.get<ApplicationTypeEntityService>(ApplicationTypeEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildApplicationType', () => {
    it(`should call getRepository's create function with right params`, () => {
      const applicationModel = mockApplicationTypeModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationTypeUuid);

      service.buildApplicationType(applicationModel);

      expect(mockApplicationTypeEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockApplicationTypeUuid,
        ...applicationModel,
      });
    });
  });

  describe('insertApplicationTypes', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedApplicationTypes = mockApplicationTypeModels.map((model, index) =>
        createMockApplicationType({ uuid: `mockApplicationType-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationTypeUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationTypeUuid2);
      const buildApplicationTypeSpy = jest.spyOn(service, 'buildApplicationType');

      await service.insertApplicationTypes(mockApplicationTypeModels);

      mockApplicationTypeModels.forEach((model) => expect(buildApplicationTypeSpy).toBeCalledWith(model));
      expect(mockApplicationTypeEntityRepository.getRepository().insert).toBeCalledWith(expectedApplicationTypes);
    });
  });

  describe('saveApplicationTypes', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedApplicationTypes = mockApplicationTypeModels.map((model, index) =>
        createMockApplicationType({ uuid: `mockApplicationType-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationTypeUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationTypeUuid2);
      const buildApplicationTypeSpy = jest.spyOn(service, 'buildApplicationType');

      await service.saveApplicationTypes(mockApplicationTypeModels);

      mockApplicationTypeModels.forEach((model) => expect(buildApplicationTypeSpy).toBeCalledWith(model));
      expect(mockApplicationTypeEntityRepository.getRepository().save).toBeCalledWith(expectedApplicationTypes);
    });
  });

  describe('saveApplicationType', () => {
    it(`should call saveApplicationTypes function with a model in array`, async () => {
      const agencyModel = mockApplicationTypeModels[0];

      const saveApplicationTypesSpy = jest.spyOn(service, 'saveApplicationTypes');

      await service.saveApplicationType(agencyModel);

      expect(saveApplicationTypesSpy).toBeCalledWith([agencyModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveApplicationTypesByCodes', () => {
    it('should return applicationTypes when found', async () => {
      const codes = [mockApplicationType.code];
      mockApplicationTypeEntityRepository.getRepository().find.mockResolvedValueOnce([mockApplicationType]);

      expect(await service.retrieveApplicationTypesByCodes(codes)).toEqual([mockApplicationType]);
      expect(mockApplicationTypeEntityRepository.getRepository().find).toBeCalledWith({
        where: { code: In(codes) },
      });
    });
  });

  describe('retrieveApplicationTypeByCodeAndEserviceId', () => {
    const { code } = mockApplicationType;
    const eserviceId = 1;

    it('should return applicationType when found', async () => {
      mockApplicationTypeEntityRepository.findApplicationTypeByCodeAndEserviceId.mockResolvedValueOnce(mockApplicationType);

      expect(await service.retrieveApplicationTypeByCodeAndEserviceId(code, eserviceId)).toEqual(mockApplicationType);
      expect(mockApplicationTypeEntityRepository.findApplicationTypeByCodeAndEserviceId).toBeCalledWith(code, eserviceId, undefined);
    });

    it('should throw EntityNotFoundException when applicationType is not found', async () => {
      mockApplicationTypeEntityRepository.findApplicationTypeByCodeAndEserviceId.mockResolvedValueOnce(null);

      await expect(service.retrieveApplicationTypeByCodeAndEserviceId(code, eserviceId)).rejects.toThrow(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.APPLICATION_TYPE_SERVICE,
          ApplicationType.name,
          'code',
          `${code} for the eservice`,
        ),
      );
      expect(mockApplicationTypeEntityRepository.findApplicationTypeByCodeAndEserviceId).toBeCalledWith(code, eserviceId, undefined);
    });
  });
});
