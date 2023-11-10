/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { ACTIVITY_TYPE, COMPONENT_ERROR_CODE, FILE_STATUS, FILE_TYPE, SORT_BY } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { startOfDay } from 'date-fns';
import { LessThan } from 'typeorm';

import { AllFileAssetsRequestDto, AllFileAssetUuidsRequestDto } from '../../../../dtos/file/request';
import { FileAsset, FileAssetUpdateModel } from '../../../../entities/file-asset';
import { mockFileAssetEntityRepository } from '../__mocks__/file-asset.entity.repository.mock';
import {
  mockCitizenUser,
  mockFileAsset,
  mockFileAssetModels,
  mockFileAssets,
  mockFileAssetUuid,
  mockFileAssetUuid2,
  mockFileAssetUuids,
} from '../__mocks__/file-asset.entity.service.mock';
import { createMockFileAsset } from '../__mocks__/file-asset.mock';
import { FileAssetEntityRepository } from '../file-asset.entity.repository';
import { FileAssetEntityService } from '../file-asset.entity.service';

const helpers = require('../../../../utils/helpers');

describe('FileAssetEntityService', () => {
  let service: FileAssetEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileAssetEntityService, { provide: FileAssetEntityRepository, useValue: mockFileAssetEntityRepository }],
    }).compile();

    service = module.get<FileAssetEntityService>(FileAssetEntityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildFileAsset', () => {
    it(`should call getRepository's create function with right params`, () => {
      const fileAssetModel = mockFileAssetModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetUuid);

      service.buildFileAsset(fileAssetModel);

      expect(mockFileAssetEntityRepository.getRepository().create).toBeCalledWith({ uuid: mockFileAssetUuid, ...fileAssetModel });
    });
  });

  describe('insertFileAssets', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedFileAssets = mockFileAssetModels.map((model, index) =>
        createMockFileAsset({ uuid: `mockFileAsset-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetUuid2);
      const buildFileAssetSpy = jest.spyOn(service, 'buildFileAsset');

      await service.insertFileAssets(mockFileAssetModels);

      mockFileAssetModels.forEach((model) => expect(buildFileAssetSpy).toBeCalledWith(model));
      expect(mockFileAssetEntityRepository.getRepository().insert).toBeCalledWith(expectedFileAssets);
    });
  });

  describe('saveFileAssets', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedFileAssets = mockFileAssetModels.map((model, index) =>
        createMockFileAsset({ uuid: `mockFileAsset-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetUuid2);
      const buildFileAssetSpy = jest.spyOn(service, 'buildFileAsset');

      await service.saveFileAssets(mockFileAssetModels);

      mockFileAssetModels.forEach((model) => expect(buildFileAssetSpy).toBeCalledWith(model));
      expect(mockFileAssetEntityRepository.getRepository().save).toBeCalledWith(expectedFileAssets);
    });
  });

  describe('saveFileAsset', () => {
    it(`should call saveFileAssets function with a model in array`, async () => {
      const fileAssetModel = mockFileAssetModels[0];

      const saveFileAssetsSpy = jest.spyOn(service, 'saveFileAssets');

      await service.saveFileAsset(fileAssetModel);

      expect(saveFileAssetsSpy).toBeCalledWith([fileAssetModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveFileAssetByUuid', () => {
    it('should return fileAsset when found', async () => {
      mockFileAssetEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockFileAsset);

      expect(await service.retrieveFileAssetByUuid(mockFileAssetUuid)).toEqual(mockFileAsset);
      expect(mockFileAssetEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockFileAssetUuid } });
    });

    it('should throw EntityNotFoundException when fileAsset is not found', async () => {
      mockFileAssetEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveFileAssetByUuid(mockFileAssetUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', mockFileAssetUuid),
      );
      expect(mockFileAssetEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockFileAssetUuid } });
    });
  });

  describe('retrieveFileAssetByUuidAndUserUuid', () => {
    const mockUserUuid = 'mockUser-uuid-1';

    it('should return fileAsset when found', async () => {
      mockFileAssetEntityRepository.findFileAssetByUuidAndUserUuid.mockResolvedValueOnce(mockFileAsset);

      expect(await service.retrieveFileAssetByUuidAndUserUuid(mockFileAssetUuid, mockUserUuid)).toEqual(mockFileAsset);
      expect(mockFileAssetEntityRepository.findFileAssetByUuidAndUserUuid).toBeCalledWith(mockFileAssetUuid, mockUserUuid, undefined);
    });

    it('should throw EntityNotFoundException when fileAsset is not found', async () => {
      mockFileAssetEntityRepository.findFileAssetByUuidAndUserUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveFileAssetByUuidAndUserUuid(mockFileAssetUuid, mockUserUuid)).rejects.toThrow(
        new EntityNotFoundException(
          COMPONENT_ERROR_CODE.FILE_SERVICE,
          FileAsset.name,
          'uuid and userUuid',
          `${mockFileAssetUuid} and ${mockUserUuid}`,
        ),
      );
      expect(mockFileAssetEntityRepository.findFileAssetByUuidAndUserUuid).toBeCalledWith(mockFileAssetUuid, mockUserUuid, undefined);
    });
  });

  describe('retrieveFileAssetByUuidAndUserId', () => {
    const mockUserId = 1;

    it('should return fileAsset when found', async () => {
      mockFileAssetEntityRepository.findFileAssetByUuidAndUserId.mockResolvedValueOnce(mockFileAsset);

      expect(await service.retrieveFileAssetByUuidAndUserId(mockFileAssetUuid, mockUserId)).toEqual(mockFileAsset);
      expect(mockFileAssetEntityRepository.findFileAssetByUuidAndUserId).toBeCalledWith(
        mockFileAssetUuid,
        mockUserId,
        undefined,
        undefined,
      );
    });

    it('should throw EntityNotFoundException when fileAsset is not found', async () => {
      mockFileAssetEntityRepository.findFileAssetByUuidAndUserId.mockResolvedValueOnce(null);

      await expect(service.retrieveFileAssetByUuidAndUserId(mockFileAssetUuid, mockUserId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', mockFileAssetUuid),
      );
      expect(mockFileAssetEntityRepository.findFileAssetByUuidAndUserId).toBeCalledWith(
        mockFileAssetUuid,
        mockUserId,
        undefined,
        undefined,
      );
    });
  });

  describe('retrieveActivatedFileAssetByUuidAndUserId', () => {
    const mockUserId = 1;

    it('should return fileAsset when found', async () => {
      mockFileAssetEntityRepository.findActivatedFileAssetByUuidAndUserId.mockResolvedValueOnce(mockFileAsset);

      expect(await service.retrieveActivatedFileAssetByUuidAndUserId(mockFileAssetUuid, mockUserId)).toEqual(mockFileAsset);
      expect(mockFileAssetEntityRepository.findActivatedFileAssetByUuidAndUserId).toBeCalledWith(mockFileAssetUuid, mockUserId, undefined);
    });

    it('should throw EntityNotFoundException when fileAsset is not found', async () => {
      mockFileAssetEntityRepository.findActivatedFileAssetByUuidAndUserId.mockResolvedValueOnce(null);

      await expect(service.retrieveActivatedFileAssetByUuidAndUserId(mockFileAssetUuid, mockUserId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', mockFileAssetUuid),
      );
      expect(mockFileAssetEntityRepository.findActivatedFileAssetByUuidAndUserId).toBeCalledWith(mockFileAssetUuid, mockUserId, undefined);
    });
  });

  describe('retrieveFileAssetsByUuids', () => {
    it('should return fileAssets when found', async () => {
      mockFileAssetEntityRepository.findFileAssetsByUuids.mockResolvedValueOnce(mockFileAssets);

      expect(await service.retrieveFileAssetsByUuids(mockFileAssetUuids)).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findFileAssetsByUuids).toBeCalledWith(mockFileAssetUuids, undefined);
    });
  });

  describe('retrieveFileAssetsByUuidsAndUserUuid', () => {
    it('should return fileAssets when found', async () => {
      const mockUserUuid = 'mockUser-uuid-1';
      mockFileAssetEntityRepository.findDownloadableFileAssetsByUuidsAndUserUuid.mockResolvedValueOnce(mockFileAssets);

      expect(await service.retrieveDownloadableFileAssetsByUuidsAndUserUuid(mockFileAssetUuids, mockUserUuid)).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findDownloadableFileAssetsByUuidsAndUserUuid).toBeCalledWith(
        mockFileAssetUuids,
        mockUserUuid,
        undefined,
        undefined,
      );
    });
  });

  describe('retrieveFileAssetsWithParentAndOaCertificateByUuids', () => {
    it('should return fileAssets when found', async () => {
      mockFileAssetEntityRepository.findFileAssetsWithParentAndOaCertificateByUuids.mockResolvedValueOnce(mockFileAssets);

      expect(await service.retrieveFileAssetsWithParentAndOaCertificateByUuids(mockFileAssetUuids)).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findFileAssetsWithParentAndOaCertificateByUuids).toBeCalledWith(mockFileAssetUuids, undefined);
    });
  });

  describe('retrieveAllChildrenUsingParentUuids', () => {
    it('should return fileAssets when found', async () => {
      mockFileAssetEntityRepository.findAllChildrenUsingParentUuids.mockResolvedValueOnce(mockFileAssets);

      expect(await service.retrieveAllChildrenUsingParentUuids(mockFileAssetUuids)).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findAllChildrenUsingParentUuids).toBeCalledWith(mockFileAssetUuids, undefined);
    });
  });

  describe('retrieveFileAssetsByStatusAndUserUuid', () => {
    it('should return fileAssets when found', async () => {
      const mockUserUuid = 'mockUser-Uuid-1';
      const mockQuery: AllFileAssetUuidsRequestDto = {
        statuses: [FILE_STATUS.ACTIVE, FILE_STATUS.EXPIRED],
        sortBy: SORT_BY.LAST_VIEWED_AT,
        asc: true,
      };

      mockFileAssetEntityRepository.findViewableFileAssetsByStatusAndUserUuid.mockResolvedValueOnce(mockFileAssets);

      expect(await service.retrieveFileAssetsByStatusAndUserUuid(mockUserUuid, mockQuery)).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findViewableFileAssetsByStatusAndUserUuid).toBeCalledWith(mockUserUuid, mockQuery, undefined);
    });
  });

  describe('retrieveAllFileAssets', () => {
    it('should call findAndCountFileAssets with page = 1 and limit = 20 when both are not given and return next with null when no additional items', async () => {
      const mockUserId = 1;
      const query: AllFileAssetsRequestDto = {
        sortBy: SORT_BY.LAST_VIEWED_AT,
        asc: true,
        statuses: [FILE_STATUS.ACTIVE],
      };
      mockFileAssetEntityRepository.findAndCountViewableFileAssets.mockResolvedValueOnce([mockFileAssets, 2]);

      expect(await service.retrieveAllFileAssets(mockUserId, query)).toEqual({
        fileAssets: mockFileAssets,
        count: 2,
        next: null,
      });
      expect(mockFileAssetEntityRepository.findAndCountViewableFileAssets).toBeCalledWith(
        mockUserId,
        {
          ...query,
          page: 1,
          limit: 20,
        },
        undefined,
        undefined,
      );
    });

    it('should return next page number when there is still remaining items', async () => {
      const mockUserId = 1;
      const query: AllFileAssetsRequestDto = {
        sortBy: SORT_BY.LAST_VIEWED_AT,
        asc: true,
        statuses: [FILE_STATUS.ACTIVE],
        page: 1,
        limit: 1,
      };
      mockFileAssetEntityRepository.findAndCountViewableFileAssets.mockResolvedValueOnce([mockFileAssets, 2]);

      expect(await service.retrieveAllFileAssets(mockUserId, query)).toEqual({
        fileAssets: mockFileAssets,
        count: 2,
        next: 2,
      });
      expect(mockFileAssetEntityRepository.findAndCountViewableFileAssets).toBeCalledWith(mockUserId, query, undefined, undefined);
    });
  });

  describe('retrieveFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid', () => {
    it('should return fileAssets when found', async () => {
      const status = FILE_STATUS.ACTIVE;
      const documentType = FILE_TYPE.OA;
      const activityType = ACTIVITY_TYPE.SEND_TRANSFER;
      const transactionUuid = 'mockTransaction-uuid-1';

      mockFileAssetEntityRepository.findFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid.mockResolvedValueOnce(
        mockFileAssets,
      );

      expect(
        await service.retrieveFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid(
          status,
          documentType,
          activityType,
          transactionUuid,
        ),
      ).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid).toBeCalledWith(
        status,
        documentType,
        activityType,
        transactionUuid,
        undefined,
      );
    });
  });

  describe('retrieveFileAssetsByStatusAndExpireAt', () => {
    it('should return fileAssets when found', async () => {
      const currentDate = startOfDay(new Date());
      const PROCESS_CHUNK_SIZE = 5;

      mockFileAssetEntityRepository.findFileAssetsByStatusAndExpireAt.mockResolvedValueOnce(mockFileAssets);

      expect(await service.retrieveFileAssetsByStatusAndExpireAt(PROCESS_CHUNK_SIZE)).toEqual(mockFileAssets);
      expect(mockFileAssetEntityRepository.findFileAssetsByStatusAndExpireAt).toBeCalledWith(
        FILE_STATUS.ACTIVE,
        currentDate,
        LessThan,
        PROCESS_CHUNK_SIZE,
        undefined,
      );
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateFileAsset', () => {
    it(`should call fileAsset repository's updateFileAsset function with right params`, async () => {
      const fileAssetUuid = 'fileAsset-uuid-1';
      const dataToBeUpdated: FileAssetUpdateModel = { status: FILE_STATUS.ACTIVE };

      await service.updateFileAsset(fileAssetUuid, dataToBeUpdated);

      expect(mockFileAssetEntityRepository.updateFileAsset).toBeCalledWith(fileAssetUuid, dataToBeUpdated, undefined);
    });
  });

  describe('updateFileAssets', () => {
    it(`should call fileAsset repository's updateFileAssets function with right params`, async () => {
      const fileAssetUuids = ['fileAsset-uuid-1', 'fileAsset-uuid-2'];
      const dataToBeUpdated: FileAssetUpdateModel = { status: FILE_STATUS.ACTIVE };

      await service.updateFileAssets(fileAssetUuids, dataToBeUpdated);

      expect(mockFileAssetEntityRepository.updateFileAssets).toBeCalledWith(fileAssetUuids, dataToBeUpdated, undefined);
    });
  });

  describe('updateFileAssetFamilyByParentId', () => {
    it(`should call fileAsset repository's updateFileAssetFamilyByParentId function with right params`, async () => {
      const parentFileAssetId = 1;
      const dataToBeUpdated: FileAssetUpdateModel = { status: FILE_STATUS.ACTIVE };

      await service.updateFileAssetFamilyByParentId(parentFileAssetId, dataToBeUpdated);

      expect(mockFileAssetEntityRepository.updateFileAssetFamilyByParentId).toBeCalledWith(parentFileAssetId, dataToBeUpdated, undefined);
    });
  });

  describe('updateFileAssetStatus', () => {
    it(`should call fileAsset service's updateFileAsset function with right params`, async () => {
      const fileAssetUuid = 'fileAsset-uuid-1';
      const updateFileAssetSpy = jest.spyOn(service, 'updateFileAsset');

      await service.updateFileAssetStatus(fileAssetUuid, { status: FILE_STATUS.ACTIVE });

      expect(updateFileAssetSpy).toBeCalledWith(fileAssetUuid, { status: FILE_STATUS.ACTIVE }, undefined);
    });
  });

  describe('updateFileAssetLastViewedAt', () => {
    it('response should be null', async () => {
      const mockFile = mockFileAsset;
      mockFile.ownerId = mockCitizenUser.id;
      mockFileAssetEntityRepository.findFileAssetByUuidAndUserId.mockResolvedValueOnce(mockFile);
      // Mock successful update
      mockFileAssetEntityRepository.updateFileAsset.mockResolvedValueOnce({ affected: 1 });

      await service.retrieveFileAssetByUuidAndUserId(mockFile.uuid, mockCitizenUser.id);
      const response = await service.updateFileAssetLastViewedAt(mockFile.uuid);
      expect(mockFileAssetEntityRepository.findFileAssetByUuidAndUserId).toBeCalledWith(
        mockFile.uuid,
        mockFile.ownerId,
        undefined,
        undefined,
      );
      expect(response).toBeNull;
    });
  });
});
