import { MockRepository } from '../../../../typings/common.mock';
import { FileAssetHistoryEntityRepository } from '../file-asset-history.entity.repository';
import { createMockFileAssetHistory } from './file-asset-history.mock';

export const mockFileAssetHistoryEntityRepository: MockRepository<FileAssetHistoryEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockFileAssetHistory(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
  }),
  findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId: jest.fn(),
  findFileAssetHistory: jest.fn(),
  updateFileAssetHistory: jest.fn(),
};
