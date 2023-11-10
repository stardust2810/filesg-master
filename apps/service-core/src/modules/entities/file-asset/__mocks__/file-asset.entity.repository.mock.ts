import { MockRepository } from '../../../../typings/common.mock';
import { FileAssetEntityRepository } from '../file-asset.entity.repository';
import { createMockFileAsset } from './file-asset.mock';

export const mockFileAssetEntityRepository: MockRepository<FileAssetEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockFileAsset(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  }),
  findFileAssetByUuidAndUserUuid: jest.fn(),
  findFileAssetByUuidAndUserId: jest.fn(),
  findActivatedFileAssetByUuidAndUserId: jest.fn(),
  findActivatedFileAssetsWithApplicationTypeByUuidsAndUserId: jest.fn(),
  findFileAssetsWithParentAndOaCertificateByUuids: jest.fn(),
  findFileAssetsByUuids: jest.fn(),
  findDownloadableFileAssetsByUuidsAndUserUuid: jest.fn(),
  findAndCountViewableFileAssets: jest.fn(),
  findViewableFileAssetsByStatusAndUserUuid: jest.fn(),
  findFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid: jest.fn(),
  findFileAssetsByStatusAndExpireAt: jest.fn(),
  findFileAssetsByStatusesAndDeleteAt: jest.fn(),
  findAllChildrenUsingParentUuids: jest.fn(),
  findCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses: jest.fn(),
  findCountAccessedAgencyIssuedFileAssets: jest.fn(),
  updateFileAsset: jest.fn(),
  updateFileAssets: jest.fn(),
  updateFileAssetFamilyByParentId: jest.fn(),
  findFileAssetsByUuidsWithAgencyInfo: jest.fn(),
  findAgenciesIssuingFileAssetsWithStatusesByUserId: jest.fn(),
};
