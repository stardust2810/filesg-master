import { MockRepository } from '../../../../typings/common.mock';
import { FileAssetHistoryEntityCorppassRepository } from '../file-asset-history.entity.corppass.repository';
import { createMockFileAssetHistory } from './file-asset-history.mock';

export const mockFileAssetHistoryEntityCorppassRepository: MockRepository<FileAssetHistoryEntityCorppassRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockFileAssetHistory(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
  }),
  findAndCountCorporateFileAssetHistoryByFileAssetUuidAndOwnerId: jest.fn(),
};
