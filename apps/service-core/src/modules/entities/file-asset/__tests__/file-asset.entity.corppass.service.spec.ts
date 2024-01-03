/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { FileAsset } from '../../../../entities/file-asset';
import { mockCorporateUserAuthUser } from '../../../features/file/__mocks__/file.corppass.service.mock';
import { mockCorppassFileAssetEntityRepository } from '../__mocks__/file-asset.entity.corppass.repository.mock';
import { mockFileAsset, mockFileAssetUuid } from '../__mocks__/file-asset.entity.service.mock';
import { CorppassFileAssetEntityService } from '../file-asset.entity.corpass.service';
import { CorppassFileAssetEntityRepository } from '../file-asset.entity.corppass.repository';

describe('CorppassFileAssetEntityService', () => {
  let service: CorppassFileAssetEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CorppassFileAssetEntityService,
        { provide: CorppassFileAssetEntityRepository, useValue: mockCorppassFileAssetEntityRepository },
      ],
    }).compile();

    service = module.get<CorppassFileAssetEntityService>(CorppassFileAssetEntityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveAccessibleCorporateFileAssetByUuidAndUserId', () => {
    it('should return fileAsset when found', async () => {
      jest.spyOn(mockCorppassFileAssetEntityRepository, 'findAccessibleCorporateFileAssetByUuidAndUserId').mockResolvedValue(mockFileAsset);

      expect(
        await service.retrieveAccessibleCorporateFileAssetByUuidAndUserId(mockFileAssetUuid, mockCorporateUserAuthUser.corporateBaseUserId),
      ).toEqual(mockFileAsset);
    });

    it('should throw EntityNotFoundException when fileAsset is not found', async () => {
      jest.spyOn(mockCorppassFileAssetEntityRepository, 'findAccessibleCorporateFileAssetByUuidAndUserId').mockResolvedValue(null);

      await expect(
        service.retrieveAccessibleCorporateFileAssetByUuidAndUserId(mockFileAssetUuid, mockCorporateUserAuthUser.corporateBaseUserId),
      ).rejects.toThrow(new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', mockFileAssetUuid));
    });
  });

  describe('retrieveCorporateFileAssetByUuidAndUserId', () => {
    it('should return fileAsset when found', async () => {
      jest.spyOn(mockCorppassFileAssetEntityRepository, 'findCorporateFileAssetByUuidAndUserId').mockResolvedValue(mockFileAsset);

      expect(
        await service.retrieveCorporateFileAssetByUuidAndUserId(mockFileAssetUuid, mockCorporateUserAuthUser.corporateBaseUserId),
      ).toEqual(mockFileAsset);
    });

    it('should throw EntityNotFoundException when fileAsset is not found', async () => {
      jest.spyOn(mockCorppassFileAssetEntityRepository, 'findCorporateFileAssetByUuidAndUserId').mockResolvedValue(null);

      await expect(
        service.retrieveCorporateFileAssetByUuidAndUserId(mockFileAssetUuid, mockCorporateUserAuthUser.corporateBaseUserId),
      ).rejects.toThrow(new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', mockFileAssetUuid));
    });
  });

  describe('retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId', () => {
    it('should return fileAsset when found', async () => {
      jest
        .spyOn(mockCorppassFileAssetEntityRepository, 'findCorporateActivatedFileAssetsWithApplicationTypeByUuidsAndUserId')
        .mockResolvedValue(mockFileAsset);

      expect(
        await service.retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
          [mockFileAssetUuid],
          mockCorporateUserAuthUser.corporateBaseUserId,
        ),
      ).toEqual(mockFileAsset);
    });
  });
});
