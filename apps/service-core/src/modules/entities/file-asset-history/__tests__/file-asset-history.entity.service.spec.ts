/* eslint-disable sonarjs/no-duplicate-string */
import { FILE_ASSET_ACTION } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Equal, FindOneOptions } from 'typeorm';

import { FileAssetHistoryRequestDto } from '../../../../dtos/file/request';
import { FileAssetHistory } from '../../../../entities/file-asset-history';
import { mockFileAssetHistoryEntityRepository } from '../__mocks__/file-asset-history.entity.repository.mock';
import {
  mockFileAssetHistories,
  mockFileAssetHistory,
  mockFileAssetHistoryModels,
  mockFileAssetHistoryUuid,
  mockFileAssetHistoryUuid2,
  mockTimestamp,
} from '../__mocks__/file-asset-history.entity.service.mock';
import { createMockFileAssetHistory } from '../__mocks__/file-asset-history.mock';
import { FileAssetHistoryEntityRepository } from '../file-asset-history.entity.repository';
import { FileAssetHistoryEntityService } from '../file-asset-history.entity.service';

const helpers = require('../../../../utils/helpers');

describe('FileAssetHistoryEntityService', () => {
  let service: FileAssetHistoryEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileAssetHistoryEntityService,
        { provide: FileAssetHistoryEntityRepository, useValue: mockFileAssetHistoryEntityRepository },
      ],
    }).compile();

    service = module.get<FileAssetHistoryEntityService>(FileAssetHistoryEntityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildFileAssetHistory', () => {
    it(`should call getRepository's create function with right params`, () => {
      const fileAssetHistoryModel = mockFileAssetHistoryModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetHistoryUuid);

      service.buildFileAssetHistory(fileAssetHistoryModel);

      expect(mockFileAssetHistoryEntityRepository.getRepository().create).toBeCalledWith({
        uuid: mockFileAssetHistoryUuid,
        ...fileAssetHistoryModel,
      });
    });
  });

  describe('insertFileAssetHistories', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedFileAssetHistories = mockFileAssetHistoryModels.map((model, index) =>
        createMockFileAssetHistory({ uuid: `mockFileAssetHistory-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetHistoryUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetHistoryUuid2);
      const buildFileAssetHistorySpy = jest.spyOn(service, 'buildFileAssetHistory');

      await service.insertFileAssetHistories(mockFileAssetHistoryModels);

      mockFileAssetHistoryModels.forEach((model) => expect(buildFileAssetHistorySpy).toBeCalledWith(model));
      expect(mockFileAssetHistoryEntityRepository.getRepository().insert).toBeCalledWith(expectedFileAssetHistories);
    });
  });

  describe('insertFileAssetHistory', () => {
    it(`should call getRepository's insert single function`, async () => {
      const expectedFileAssetHistory = createMockFileAssetHistory({
        ...mockFileAssetHistory,
        uuid: mockFileAssetHistoryUuid,
      });

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetHistoryUuid);
      const buildFileAssetHistorySpy = jest.spyOn(service, 'buildFileAssetHistory');

      await service.insertFileAssetHistory(expectedFileAssetHistory);

      expect(buildFileAssetHistorySpy).toBeCalledWith(expectedFileAssetHistory);
      expect(mockFileAssetHistoryEntityRepository.getRepository().insert).toBeCalledWith(expectedFileAssetHistory);
    });
  });

  describe('saveFileAssetHistories', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedFileAssetHistories = mockFileAssetHistoryModels.map((model, index) =>
        createMockFileAssetHistory({ uuid: `mockFileAssetHistory-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetHistoryUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockFileAssetHistoryUuid2);
      const buildFileAssetHistorySpy = jest.spyOn(service, 'buildFileAssetHistory');

      await service.saveFileAssetHistories(mockFileAssetHistoryModels);

      mockFileAssetHistoryModels.forEach((model) => expect(buildFileAssetHistorySpy).toBeCalledWith(model));
      expect(mockFileAssetHistoryEntityRepository.getRepository().save).toBeCalledWith(expectedFileAssetHistories);
    });
  });

  describe('saveFileAssetHistory', () => {
    it(`should call saveFileAssetHistorie function with a model in array`, async () => {
      const fileAssetHistoryModel = mockFileAssetHistoryModels[0];

      const saveFileAssetHistoriesSpy = jest.spyOn(service, 'saveFileAssetHistories');

      await service.saveFileAssetHistory(fileAssetHistoryModel);

      expect(saveFileAssetHistoriesSpy).toBeCalledWith([fileAssetHistoryModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveFileAssetHistoryByFileAssetUuidAndOwnerId', () => {
    const mockFileAssetUuid = 'mockFileAsset-uuid-1';

    it('should call findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId with page = 1 and limit = 20 when both are not given and return next with null when no additional items', async () => {
      const mockUserId = 1;
      const query: FileAssetHistoryRequestDto = {};
      mockFileAssetHistoryEntityRepository.findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId.mockResolvedValueOnce([
        mockFileAssetHistories,
        2,
      ]);

      expect(await service.retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(mockFileAssetUuid, mockUserId, query)).toEqual({
        fileHistoryList: mockFileAssetHistories,
        totalCount: 2,
        nextPage: null,
      });
      expect(mockFileAssetHistoryEntityRepository.findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId).toBeCalledWith(
        mockFileAssetUuid,
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
      const query: FileAssetHistoryRequestDto = {
        page: 1,
        limit: 1,
      };
      mockFileAssetHistoryEntityRepository.findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId.mockResolvedValueOnce([
        mockFileAssetHistories,
        2,
      ]);

      expect(await service.retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(mockFileAssetUuid, mockUserId, query)).toEqual({
        fileHistoryList: mockFileAssetHistories,
        totalCount: 2,
        nextPage: 2,
      });
      expect(mockFileAssetHistoryEntityRepository.findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId).toBeCalledWith(
        mockFileAssetUuid,
        mockUserId,
        query,
        undefined,
        undefined,
      );
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('upsertLastViewed', () => {
    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(new Date(parseInt(mockTimestamp)));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const mockedUserId = 1;
    const mockedFileAssetId = 1;
    const mockedFileAssetHistoryId = 1;

    const criteria: FindOneOptions<FileAssetHistory> = {
      where: { type: Equal(FILE_ASSET_ACTION.VIEWED), actionById: Equal(mockedUserId), fileAssetId: mockedFileAssetId },
    };

    it('should update existing FileAssetHistory of type viewed to current time', async () => {
      const mockedExistingData = createMockFileAssetHistory({
        type: FILE_ASSET_ACTION.VIEWED,
        id: mockedFileAssetHistoryId,
        actionById: mockedUserId,
        fileAssetId: mockedFileAssetId,
      });

      const mockedDataToBeUpdated = {
        lastViewedAt: new Date(),
      };

      jest.spyOn(mockFileAssetHistoryEntityRepository, 'findFileAssetHistory').mockReturnValueOnce(mockedExistingData);
      const insertFileAssetHistorySpy = jest.spyOn(service, 'insertFileAssetHistory');

      await service.upsertLastViewedAt(mockedUserId, mockedFileAssetId);

      expect(mockFileAssetHistoryEntityRepository.findFileAssetHistory).toHaveBeenCalledWith(criteria, { toThrow: false });
      expect(mockFileAssetHistoryEntityRepository.updateFileAssetHistory).toHaveBeenCalledTimes(1);
      expect(insertFileAssetHistorySpy).toBeCalledTimes(0);
      expect(mockFileAssetHistoryEntityRepository.updateFileAssetHistory).toHaveBeenCalledWith(
        { id: mockedFileAssetHistoryId },
        mockedDataToBeUpdated,
      );
    });

    it('should create new FileAssetHistory of type viewed to current time', async () => {
      const mockedCreationData = createMockFileAssetHistory({
        type: FILE_ASSET_ACTION.VIEWED,
        actionById: mockedUserId,
        fileAssetId: mockedFileAssetId,
        lastViewedAt: new Date(),
      });

      jest.spyOn(mockFileAssetHistoryEntityRepository, 'findFileAssetHistory').mockReturnValueOnce(null);
      const insertFileAssetHistorySpy = jest.spyOn(service, 'insertFileAssetHistory');

      await service.upsertLastViewedAt(mockedUserId, mockedFileAssetId);

      expect(mockFileAssetHistoryEntityRepository.findFileAssetHistory).toHaveBeenCalledWith(criteria, { toThrow: false });
      expect(mockFileAssetHistoryEntityRepository.updateFileAssetHistory).toHaveBeenCalledTimes(0);
      expect(insertFileAssetHistorySpy).toBeCalledTimes(1);
      expect(insertFileAssetHistorySpy).toHaveBeenCalledWith(mockedCreationData);
    });
  });
});
