import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Application } from '../../../../entities/application';
import { mockApplicationEntityRepository } from '../__mocks__/application.entity.repository.mock';
import {
  mockApplication,
  mockApplicationModels,
  mockApplicationUuid,
  mockApplicationUuid2,
} from '../__mocks__/application.entity.service.mock';
import { createMockApplication } from '../__mocks__/application.mock';
import { ApplicationEntityRepository } from '../application.entity.repository';
import { ApplicationEntityService } from '../application.entity.service';

const helpers = require('../../../../utils/helpers');

describe('ApplicationEntityService', () => {
  let service: ApplicationEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationEntityService, { provide: ApplicationEntityRepository, useValue: mockApplicationEntityRepository }],
    }).compile();

    service = module.get<ApplicationEntityService>(ApplicationEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildApplication', () => {
    it(`should call getRepository's create function with right params`, () => {
      const applicationModel = mockApplicationModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationUuid);

      service.buildApplication(applicationModel);

      expect(mockApplicationEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockApplicationUuid,
        ...applicationModel,
      });
    });
  });

  describe('insertApplications', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedApplications = mockApplicationModels.map((model, index) =>
        createMockApplication({ uuid: `mockApplication-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationUuid2);
      const buildApplicationSpy = jest.spyOn(service, 'buildApplication');

      await service.insertApplications(mockApplicationModels);

      mockApplicationModels.forEach((model) => expect(buildApplicationSpy).toBeCalledWith(model));
      expect(mockApplicationEntityRepository.getRepository().insert).toBeCalledWith(expectedApplications);
    });
  });

  describe('saveApplications', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedApplications = mockApplicationModels.map((model, index) =>
        createMockApplication({ uuid: `mockApplication-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockApplicationUuid2);
      const buildApplicationSpy = jest.spyOn(service, 'buildApplication');

      await service.saveApplications(mockApplicationModels);

      mockApplicationModels.forEach((model) => expect(buildApplicationSpy).toBeCalledWith(model));
      expect(mockApplicationEntityRepository.getRepository().save).toBeCalledWith(expectedApplications);
    });
  });

  describe('saveApplication', () => {
    it(`should call saveApplications function with a model in array`, async () => {
      const agencyModel = mockApplicationModels[0];

      const saveApplicationsSpy = jest.spyOn(service, 'saveApplications');

      await service.saveApplication(agencyModel);

      expect(saveApplicationsSpy).toBeCalledWith([agencyModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId', () => {
    const externalRefId = 'test-ref-id-1';
    const eserviceId = 1;
    const applicationId = 1;

    it('should return application when found', async () => {
      mockApplicationEntityRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId.mockResolvedValueOnce(
        mockApplication,
      );

      expect(
        await service.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(externalRefId, eserviceId, applicationId),
      ).toEqual(mockApplication);
      expect(mockApplicationEntityRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId).toBeCalledWith(
        externalRefId,
        eserviceId,
        applicationId,
        undefined,
      );
    });

    it('should throw EntityNotFoundException when toThrow set to true and application is not found', async () => {
      mockApplicationEntityRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId.mockResolvedValueOnce(null);

      await expect(
        service.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(externalRefId, eserviceId, applicationId, {
          toThrow: true,
        }),
      ).rejects.toThrowError(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
          Application.name,
          'externalRefId and eserviceId',
          `${externalRefId} and ${eserviceId}`,
        ),
      );
      expect(mockApplicationEntityRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId).toBeCalledWith(
        externalRefId,
        eserviceId,
        applicationId,
        undefined,
      );
    });

    it('should return undefined when toThrow set to false and application is not found', async () => {
      mockApplicationEntityRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId.mockResolvedValueOnce(null);

      expect(
        await service.retrieveApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(externalRefId, eserviceId, applicationId, {
          toThrow: false,
        }),
      ).toEqual(null);
      expect(mockApplicationEntityRepository.findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId).toBeCalledWith(
        externalRefId,
        eserviceId,
        applicationId,
        undefined,
      );
    });
  });

  describe('retrieveApplicationByTransactionUuid', () => {
    const transactionUuid = 'mockTransaction-uuid-1';

    it('should return application when found', async () => {
      mockApplicationEntityRepository.findApplicationByTransactionUuid.mockResolvedValueOnce(mockApplication);

      expect(await service.retrieveApplicationByTransactionUuid(transactionUuid)).toEqual(mockApplication);
      expect(mockApplicationEntityRepository.findApplicationByTransactionUuid).toBeCalledWith(transactionUuid, undefined);
    });

    it('should throw EntityNotFoundException when application is not found', async () => {
      mockApplicationEntityRepository.findApplicationByTransactionUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveApplicationByTransactionUuid(transactionUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Application.name, 'transactionUuid', transactionUuid),
      );
      expect(mockApplicationEntityRepository.findApplicationByTransactionUuid).toBeCalledWith(transactionUuid, undefined);
    });
  });

  describe('retrieveApplicationWithTransactionsAndActivitiesDetailsByExternalRefId', () => {
    it('function should be defined', () => {
      expect(service.retrieveApplicationWithTransactionsAndActivitiesDetailsByExternalRefId).toBeDefined();
    });
  });

  describe('retrieveApplicationsWithTransactionsAndActivitiesDetailsByIds', () => {
    it('function should be defined', () => {
      expect(service.retrieveApplicationsWithTransactionsAndActivitiesDetailsByIds).toBeDefined();
    });
  });

  describe('retrieveApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes', () => {
    it('function should be defined', () => {
      expect(service.retrieveApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes).toBeDefined();
    });
  });

  describe('retrieveApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo', () => {
    it('function should be defined', () => {
      expect(service.retrieveApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo).toBeDefined();
    });
  });
});
