import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { In, InsertResult } from 'typeorm';

import { Eservice } from '../../../../entities/eservice';
import { mockEserviceEntityRepository } from '../__mocks__/eservice.entity.repository.mock';
import { mockEservice, mockEserviceModels, mockEserviceUuid, mockEserviceUuid2 } from '../__mocks__/eservice.entity.service.mock';
import { createMockEservice } from '../__mocks__/eservice.mock';
import { EserviceEntityRepository } from '../eservice.entity.repository';
import { EserviceEntityService } from '../eservice.entity.service';

const helpers = require('../../../../utils/helpers');

describe('EserviceEntityService', () => {
  let service: EserviceEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EserviceEntityService, { provide: EserviceEntityRepository, useValue: mockEserviceEntityRepository }],
    }).compile();

    service = module.get<EserviceEntityService>(EserviceEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildEservice', () => {
    it(`should call getRepository's create function with right params`, () => {
      const eserviceModel = mockEserviceModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid);

      service.buildEservice(eserviceModel);

      expect(mockEserviceEntityRepository.getRepository().create).toBeCalledWith({ uuid: mockEserviceUuid, ...eserviceModel });
    });
  });

  describe('insertEservices', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedEservices = mockEserviceModels.map((model, index) =>
        createMockEservice({ uuid: `mockEservice-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid2);
      const buildEserviceSpy = jest.spyOn(service, 'buildEservice');

      await service.insertEservices(mockEserviceModels);

      mockEserviceModels.forEach((model) => expect(buildEserviceSpy).toBeCalledWith(model));
      expect(mockEserviceEntityRepository.getRepository().insert).toBeCalledWith(expectedEservices);
    });

    it('should return eservice entities if returnEntity is set to true', async () => {
      const mockIdentifiers = [{ identifier: { id: 1 } }, { identifier: { id: 2 } }];

      const insertResult: InsertResult = {
        identifiers: mockIdentifiers,
        generatedMaps: [],
        raw: {},
      };

      const expectedEservices = mockEserviceModels.map((model, index) =>
        createMockEservice({ uuid: `mockEservice-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid2);
      const buildEserviceSpy = jest.spyOn(service, 'buildEservice');
      mockEserviceEntityRepository.getRepository().insert.mockResolvedValueOnce(insertResult);
      mockEserviceEntityRepository.getRepository().find.mockResolvedValueOnce(expectedEservices);

      expect(await service.insertEservices(mockEserviceModels, true)).toEqual(expectedEservices);

      mockEserviceModels.forEach((model) => expect(buildEserviceSpy).toBeCalledWith(model));
      expect(mockEserviceEntityRepository.getRepository().insert).toBeCalledWith(expectedEservices);
      expect(mockEserviceEntityRepository.getRepository().find).toBeCalledWith({
        where: {
          id: In(insertResult.identifiers.map((identifier) => identifier.id)),
        },
        order: {
          id: 'ASC',
        },
      });
    });
  });

  describe('saveEservices', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedEservices = mockEserviceModels.map((model, index) =>
        createMockEservice({ uuid: `mockEservice-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockEserviceUuid2);
      const buildEserviceSpy = jest.spyOn(service, 'buildEservice');

      await service.saveEservices(mockEserviceModels);

      mockEserviceModels.forEach((model) => expect(buildEserviceSpy).toBeCalledWith(model));
      expect(mockEserviceEntityRepository.getRepository().save).toBeCalledWith(expectedEservices);
    });
  });

  describe('saveEservice', () => {
    it(`should call saveEservices function with a model in array`, async () => {
      const eserviceModel = mockEserviceModels[0];

      const saveEservicesSpy = jest.spyOn(service, 'saveEservices');

      await service.saveEservice(eserviceModel);

      expect(saveEservicesSpy).toBeCalledWith([eserviceModel], undefined);
    });
  });

  describe('associateProgrammaticUserToEservice', () => {
    it(`should call getRepository's execute function together with right values`, async () => {
      const models = [{ eserviceId: 1, userId: 1 }];

      await service.associateUsersToEservice(models);

      expect(mockEserviceEntityRepository.getRepository().execute).toBeCalledTimes(1);
      expect(mockEserviceEntityRepository.getRepository().values).toBeCalledWith(models);
      expect(mockEserviceEntityRepository.getRepository().into).toBeCalledWith('eservice_user');

      mockEserviceEntityRepository.getRepository().execute.mockReset();
    });
  });

  describe('associateApplicationTypeToEservice', () => {
    it(`should call getRepository's execute function together with right values`, async () => {
      const models = [{ eserviceId: 1, applicationTypeId: 1 }];

      await service.associateApplicationTypeToEservice(models);

      expect(mockEserviceEntityRepository.getRepository().execute).toBeCalledTimes(1);
      expect(mockEserviceEntityRepository.getRepository().values).toBeCalledWith(models);
      expect(mockEserviceEntityRepository.getRepository().into).toBeCalledWith('eservice_application_type');

      mockEserviceEntityRepository.getRepository().execute.mockReset();
    });
  });

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  describe('retrieveEserviceByUserId', () => {
    const userId = 1;

    it('should return eservice when found', async () => {
      mockEserviceEntityRepository.findEserviceByUserId.mockResolvedValueOnce(mockEservice);

      expect(await service.retrieveEserviceByUserId(userId)).toEqual(mockEservice);
      expect(mockEserviceEntityRepository.findEserviceByUserId).toBeCalledWith(userId);
    });

    it('should throw EntityNotFoundException when toThrow set to true and eservice is not found', async () => {
      mockEserviceEntityRepository.findEserviceByUserId.mockResolvedValueOnce(null);

      await expect(service.retrieveEserviceByUserId(userId, { toThrow: true })).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.ESERVICE_SERVICE, Eservice.name, 'userId', `${userId}`),
      );
      expect(mockEserviceEntityRepository.findEserviceByUserId).toBeCalledWith(userId);
    });

    it('should return null when toThrow set to false and eservice is not found', async () => {
      mockEserviceEntityRepository.findEserviceByUserId.mockResolvedValueOnce(null);

      expect(await service.retrieveEserviceByUserId(userId, { toThrow: false })).toEqual(null);
      expect(mockEserviceEntityRepository.findEserviceByUserId).toBeCalledWith(userId);
    });
  });

  // ===========================================================================
  // Delete
  // ===========================================================================
});
