import { MockRepository } from '../../../../typings/common.mock';
import { FileAssetAccessEntityRepository } from '../file-asset-access.entity.respository';
import { createMockFileAssetAccess } from './file-asset-access.mock';

export const mockFileAssetAccessEntityRepository: MockRepository<FileAssetAccessEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockFileAssetAccess(arg)),
    save: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
  }),
  findTokenUsingFileAssetId: jest.fn(),
  deleteTokenUsingFileAssetId: jest.fn(),
  deleteTokensUsingFileAssetIds: jest.fn(),
  verifyTokenBelongsToFileAssetId: jest.fn(),
};
