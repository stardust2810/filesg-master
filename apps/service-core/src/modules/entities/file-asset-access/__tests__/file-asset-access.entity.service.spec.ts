import { EntityNotFoundException } from '@filesg/backend-common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileAsset } from '../../file-asset/__mocks__/file-asset.entity.service.mock';
import { mockFileAssetAccessEntityRepository } from '../__mocks__/file-asset-access.entity.repository.mock';
import { mockFileAssetAccessModel } from '../__mocks__/file-asset-access.entity.service.mock';
import { createMockFileAssetAccess } from '../__mocks__/file-asset-access.mock';
import { FileAssetAccessEntityRepository } from '../file-asset-access.entity.respository';
import { FileAssetAccessEntityService } from '../file-asset-access.entity.service';

describe('FileAssetAccessEntityService', () => {
  let service: FileAssetAccessEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileAssetAccessEntityService,
        { provide: FileAssetAccessEntityRepository, useValue: mockFileAssetAccessEntityRepository },
      ],
    }).compile();

    service = module.get<FileAssetAccessEntityService>(FileAssetAccessEntityService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildFileAssetAccess', () => {
    it(`should call getRepository's create function with right params`, () => {
      service.buildFileAssetAccess(mockFileAssetAccessModel);
      expect(mockFileAssetAccessEntityRepository.getRepository().create).toBeCalledWith(mockFileAssetAccessModel);
    });
  });

  describe('insertFileAssetAccess', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const buildFileAssetAccessSpy = jest.spyOn(service, 'buildFileAssetAccess');
      const createdMockAsset = createMockFileAssetAccess(mockFileAssetAccessModel);

      await service.insertFileAssetAccess(mockFileAssetAccessModel);
      expect(buildFileAssetAccessSpy).toBeCalledWith(mockFileAssetAccessModel);
      expect(mockFileAssetAccessEntityRepository.getRepository().insert).toBeCalledWith(createdMockAsset);
    });
  });

  describe('saveFileAssetAccess', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const buildFileAssetAccessSpy = jest.spyOn(service, 'buildFileAssetAccess');
      const createdMockAsset = createMockFileAssetAccess(mockFileAssetAccessModel);

      await service.saveFileAssetAccess(mockFileAssetAccessModel);
      expect(buildFileAssetAccessSpy).toBeCalledWith(mockFileAssetAccessModel);
      expect(mockFileAssetAccessEntityRepository.getRepository().save).toBeCalledWith(createdMockAsset);
    });
  });

  describe('retrieveTokenUsingFileAssetId', () => {
    it('should return fileAsset when found', async () => {
      mockFileAssetAccessEntityRepository.findTokenUsingFileAssetId.mockResolvedValueOnce(mockFileAssetAccessModel);
      expect(await service.retrieveTokenUsingFileAssetId(mockFileAsset.id)).toEqual(mockFileAssetAccessModel);
    });

    it('should return fileAsset when found', async () => {
      mockFileAssetAccessEntityRepository.findTokenUsingFileAssetId.mockResolvedValueOnce(mockFileAssetAccessModel);
      expect(await service.retrieveTokenUsingFileAssetId(mockFileAsset.id)).toEqual(mockFileAssetAccessModel);
    });

    it('should return null when entity not found', async () => {
      mockFileAssetAccessEntityRepository.findTokenUsingFileAssetId.mockResolvedValueOnce(null);
      expect(await service.retrieveTokenUsingFileAssetId(mockFileAsset.id)).toEqual(null);
    });
  });

  describe('verifyTokenBelongsToFileAssetId', () => {
    it('should pass verification fileAssetAccess record when found', async () => {
      mockFileAssetAccessEntityRepository.verifyTokenBelongsToFileAssetId.mockResolvedValueOnce(mockFileAssetAccessModel);
      expect(await service.verifyTokenBelongsToFileAssetId(mockFileAssetAccessModel.token, mockFileAssetAccessModel.fileAsset.id)).toEqual(
        mockFileAssetAccessModel,
      );
    });

    it('should throw error when no fileAssetAccess record is found', async () => {
      mockFileAssetAccessEntityRepository.verifyTokenBelongsToFileAssetId.mockResolvedValueOnce(null);
      await expect(
        service.verifyTokenBelongsToFileAssetId(mockFileAssetAccessModel.token, mockFileAssetAccessModel.fileAsset.id),
      ).rejects.toThrow(EntityNotFoundException);
    });
  });
});
