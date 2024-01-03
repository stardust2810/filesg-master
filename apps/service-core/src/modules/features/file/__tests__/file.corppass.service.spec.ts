import { FILE_ASSET_SORT_BY, PaginationOptions, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AllFileAssetsFromCorporateRequestDto, AllFileAssetUuidsRequestDto } from '../../../../dtos/file/request';
import { mockCorppassFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.corppass.service.mock';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { CorppassFileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.corpass.service';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockCorppassFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.corppass.service.mock';
import { mockFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.service.mock';
import { CorppassFileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.corppass.service';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { mockCorporateEntityService } from '../../../entities/user/__mocks__/corporate/corporate.entity.service.mock';
import { mockCorporateUserAuthUser } from '../__mocks__/file.corppass.service.mock';
import { mockFileAsset, mockFileService } from '../__mocks__/file.service.mock';
import { CorppassFileService } from '../file.corppass.service';
import { FileService } from '../file.service';

describe('CorppassFileService', () => {
  let service: CorppassFileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorppassFileService,
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: FileService, useValue: mockFileService },
        { provide: CorppassFileAssetHistoryEntityService, useValue: mockCorppassFileAssetHistoryEntityService },
        { provide: CorppassFileAssetEntityService, useValue: mockCorppassFileAssetEntityService },
      ],
    }).compile();

    service = module.get<CorppassFileService>(CorppassFileService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateFileSessionAndJwtForDownload', () => {
    it('should call methods with correct args', async () => {
      const mockFileAssetUuids = ['fileAsset-uuid-1', 'fileAsset-uuid-2'];

      await service.generateFileSessionAndJwtForDownload(mockFileAssetUuids, mockCorporateUserAuthUser);

      expect(mockFileService.generateFileSessionAndJwtForDownload).toBeCalledWith(
        mockFileAssetUuids,
        mockCorporateUserAuthUser.corporateBaseUserUuid,
        undefined,
        undefined,
      );
    });
  });

  describe('retrieveRecentFileAssets', () => {
    const query: PaginationOptions = {
      limit: 10,
      page: 0,
    };
    it('should call methods with the right params', async () => {
      mockCorporateEntityService.retrieveCorporateByUen.mockResolvedValueOnce(mockCorporateUserAuthUser);
      mockCorppassFileAssetEntityService.retrieveCorporateRecentFileAssets.mockResolvedValueOnce({
        fileAssets: [mockFileAsset],
        count: 0,
        next: null,
      });

      await service.retrieveRecentFileAssets(mockCorporateUserAuthUser, query);

      expect(mockCorppassFileAssetEntityService.retrieveCorporateRecentFileAssets).toBeCalledWith({
        ownerId: mockCorporateUserAuthUser.corporateBaseUserId,
        query,
        historyActionById: mockCorporateUserAuthUser.userId,
      });
    });

    it('should return empty array if user has not been assigned any accessible agencies', async () => {
      const modifiedCorporateUser = { ...mockCorporateUserAuthUser, accessibleAgencies: [] };

      expect(await service.retrieveRecentFileAssets(modifiedCorporateUser, query)).toEqual({ items: [], count: 0, next: null });
    });
  });

  describe('retrieveAllFileAssets', () => {
    it('should call methods with the right params and retrieve all agencies issued file assets if user is given ALL access and no agency code is given in query', async () => {
      const query: AllFileAssetsFromCorporateRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
      };

      const expectedQuery = { ...query };

      mockCorporateEntityService.retrieveCorporateByUen.mockResolvedValueOnce(mockCorporateUserAuthUser);
      mockFileAssetEntityService.retrieveAllCorporateFileAssets.mockResolvedValueOnce({ fileAssets: [], count: 0, next: null });

      await service.retrieveAllFileAssets(mockCorporateUserAuthUser, query);

      expect(mockFileAssetEntityService.retrieveAllCorporateFileAssets).toBeCalledWith({
        ownerId: mockCorporateUserAuthUser.corporateBaseUserId,
        query: expectedQuery,
      });
    });

    it('should retrieve file assets based on the agency code from query and user assigned accessible agencies', async () => {
      const query: AllFileAssetsFromCorporateRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
        agencyCodes: ['ICA', 'ELD'],
      };

      const expectedQuery = { ...query, agencyCodes: ['ICA'] };
      const modifiedCorporateUser = { ...mockCorporateUserAuthUser, accessibleAgencies: [{ code: 'ICA', name: 'ICA name' }] };

      mockCorporateEntityService.retrieveCorporateByUen.mockResolvedValueOnce(mockCorporateUserAuthUser);
      mockFileAssetEntityService.retrieveAllCorporateFileAssets.mockResolvedValueOnce({ fileAssets: [], count: 0, next: null });

      await service.retrieveAllFileAssets(modifiedCorporateUser, query);

      expect(mockFileAssetEntityService.retrieveAllCorporateFileAssets).toBeCalledWith({
        ownerId: mockCorporateUserAuthUser.corporateBaseUserId,
        query: expectedQuery,
      });
    });

    it('should return empty array if user has not been assigned any accessible agencies', async () => {
      const query: AllFileAssetsFromCorporateRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
      };

      const modifiedCorporateUser = { ...mockCorporateUserAuthUser, accessibleAgencies: [] };

      expect(await service.retrieveAllFileAssets(modifiedCorporateUser, query)).toEqual({ items: [], count: 0, next: null });
    });
  });

  describe('retrieveAllCorporateFileAssetUuids', () => {
    it('should be defined', () => {
      expect(service.retrieveAllCorporateFileAssetUuids).toBeDefined();
    });

    it('should retrieve all accessible files if no agency code is provided', async () => {
      const mockQuery: AllFileAssetUuidsRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
      };

      jest.spyOn(mockFileAssetEntityService, 'retrieveFileAssetsByStatusAndCorporateUen').mockResolvedValue([mockFileAsset]);
      await service.retrieveAllCorporateFileAssetUuids(mockCorporateUserAuthUser, mockQuery);

      expect(mockFileAssetEntityService.retrieveFileAssetsByStatusAndCorporateUen).toBeCalledWith(mockCorporateUserAuthUser.corporateUen!, {
        ...mockQuery,
        agencyCodes: undefined,
      });
    });

    it('should return empty array if agency code are not accessible', async () => {
      const mockQuery: AllFileAssetUuidsRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
        agencyCodes: ['FSG'],
      };

      const mockCorporateUserWithCustomAccessibleAgencies = {
        ...mockCorporateUserAuthUser,
        accessibleAgencies: [{ code: 'FORMSG', name: 'FORMSG' }],
      };

      const result = await service.retrieveAllCorporateFileAssetUuids(mockCorporateUserWithCustomAccessibleAgencies, mockQuery);

      expect(result).toEqual({ fileAssets: [] });
    });

    it('should return correct data when agency code is accessible', async () => {
      const mockQuery: AllFileAssetUuidsRequestDto = {
        asc: true,
        sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
        statuses: VIEWABLE_FILE_STATUSES,
        agencyCodes: ['FSG'],
      };

      const mockCorporateUserWithCustomAccessibleAgencies = {
        ...mockCorporateUserAuthUser,
        accessibleAgencies: [{ code: 'FSG', name: 'FSG' }],
      };

      jest.spyOn(mockFileAssetEntityService, 'retrieveFileAssetsByStatusAndCorporateUen').mockResolvedValue([mockFileAsset]);

      const result = await service.retrieveAllCorporateFileAssetUuids(mockCorporateUserWithCustomAccessibleAgencies, mockQuery);

      expect(result).toEqual({ fileAssets: [mockFileAsset.uuid] });
    });
  });

  describe('updateCorppassLastViewedAt', () => {
    const mockFileAssetUuid = mockFileAsset.uuid;
    const mockUserId = mockCorporateUserAuthUser.userId;

    it('should update last viewed at successfully ', async () => {
      jest
        .spyOn(mockCorppassFileAssetEntityService, 'retrieveCorporateFileAssetByUuidAndUserId')
        .mockResolvedValue({ id: mockFileAsset.id });

      await service.updateCorppassLastViewedAt(mockFileAssetUuid, mockCorporateUserAuthUser);
      expect(mockCorppassFileAssetEntityService.retrieveCorporateFileAssetByUuidAndUserId).toBeCalledWith(
        mockFileAssetUuid,
        mockCorporateUserAuthUser.corporateBaseUserId,
        undefined,
        undefined,
      );
      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).toBeCalledWith(mockUserId, mockFileAsset.id);
    });

    it('should handle corporate retrieval failure', async () => {
      const errorMsg = 'Failed to retrieve file asset';

      (mockCorppassFileAssetEntityService.retrieveCorporateFileAssetByUuidAndUserId as jest.Mock).mockRejectedValueOnce(
        new Error(errorMsg),
      );

      await expect(service.updateCorppassLastViewedAt(mockFileAssetUuid, mockCorporateUserAuthUser)).rejects.toThrowError(errorMsg);

      expect(mockFileAssetHistoryEntityService.upsertLastViewedAt).toBeCalledTimes(0);
    });
  });

  describe('retrieveFileHistory', () => {
    const mockFileAssetUuid = mockFileAsset.uuid;
    const mockFileAssetHistories = mockFileAsset.histories;
    it('should call methods with the right params and retrieve all agencies issued file assets if user is given ALL access and no agency code is given in query', async () => {
      mockCorppassFileAssetHistoryEntityService.retrieveCorporateFileAssetHistoryByFileAssetUuidAndOwnerId.mockResolvedValueOnce({
        fileHistoryList: mockFileAssetHistories,
        totalCount: 20,
        nextPage: 2,
      });

      jest.spyOn(mockCorppassFileAssetEntityService, 'retrieveAccessibleCorporateFileAssetByUuidAndUserId').mockResolvedValue({
        uuid: mockFileAssetUuid,
      } as any);

      await service.retrieveFileHistory(mockFileAssetUuid, mockCorporateUserAuthUser, {});

      expect(mockCorppassFileAssetHistoryEntityService.retrieveCorporateFileAssetHistoryByFileAssetUuidAndOwnerId).toBeCalledWith({
        fileAssetUuid: mockFileAssetUuid,
        agencyCodes: undefined,
        ownerId: mockCorporateUserAuthUser.corporateBaseUserId,
      });
    });

    it('should throw not found exception when user does not have any accessible agency', async () => {
      expect(
        service.retrieveFileHistory(
          mockFileAssetUuid,
          {
            ...mockCorporateUserAuthUser,
            accessibleAgencies: [],
          },
          {},
        ),
      ).rejects.toThrow(`[EntityNotFoundException] No FileAsset found with uuid of ${mockFileAssetUuid}`);
    });

    it('should handle error message if file history not found', async () => {
      const errorMsg = `No FileAsset found with uuid of ${mockFileAssetUuid}`;
      (
        mockCorppassFileAssetHistoryEntityService.retrieveCorporateFileAssetHistoryByFileAssetUuidAndOwnerId as jest.Mock
      ).mockRejectedValueOnce(new Error(errorMsg));

      expect(
        service.retrieveFileHistory(
          mockFileAssetUuid,
          {
            ...mockCorporateUserAuthUser,
            accessibleAgencies: [],
          },
          {},
        ),
      ).rejects.toThrow(errorMsg);
    });
  });
});
