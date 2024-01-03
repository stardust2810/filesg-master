import { MockRepository } from '../../../../typings/common.mock';
import { CorppassFileAssetEntityRepository } from '../file-asset.entity.corppass.repository';
import { createMockFileAsset } from './file-asset.mock';

export const mockCorppassFileAssetEntityRepository: MockRepository<CorppassFileAssetEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockFileAsset(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
  }),
  findCorporateActivatedFileAssetsWithApplicationTypeByUuidsAndUserId: jest.fn(),
  findAccessibleCorporateFileAssetByUuidAndUserId: jest.fn(),
  findCorporateRecentFileAssets: jest.fn(),
  findCorporateFileAssetByUuidAndUserId: jest.fn(),
};
