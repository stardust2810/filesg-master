import { FILE_ASSET_ACTION } from '@filesg/common';

import { FileAssetHistoryCreationModel } from '../../../../entities/file-asset-history';
import { MockService } from '../../../../typings/common.mock';
import { mockUser } from '../../activity/__mocks__/activity.entity.service.mock';
import { mockEservice } from '../../eservice/__mocks__/eservice.entity.service.mock';
import { FileAssetHistoryEntityService } from '../file-asset-history.entity.service';
import { createMockFileAssetHistory } from './file-asset-history.mock';

export const mockFileAssetHistoryEntityService: MockService<FileAssetHistoryEntityService> = {
  //Create
  buildFileAssetHistory: jest.fn(),
  insertFileAssetHistories: jest.fn(),
  saveFileAssetHistories: jest.fn(),
  saveFileAssetHistory: jest.fn(),
  insertFileAssetHistory: jest.fn(),

  // Read
  retrieveFileAssetHistoryByFileAssetUuidAndOwnerId: jest.fn(),

  // Upsert
  upsertLastViewedAt: jest.fn(),
};

export const mockFileAssetHistoryUuid = 'mockFileAssetHistory-uuid-1';
export const mockFileAssetHistoryUuid2 = 'mockFileAssetHistory-uuid-2';
export const mockTimestamp = '1696219069120';

export const mockFileAssetHistoryModels: FileAssetHistoryCreationModel[] = [
  { type: FILE_ASSET_ACTION.DOWNLOADED },
  { type: FILE_ASSET_ACTION.DELETED },
];

export const mockFileAssetHistory = createMockFileAssetHistory({
  type: FILE_ASSET_ACTION.DOWNLOADED,
  actionBy: { ...mockUser, eservices: [mockEservice] },
});

export const mockFileAssetHistory2 = createMockFileAssetHistory({
  type: FILE_ASSET_ACTION.DELETED,
  actionBy: { ...mockUser, eservices: [mockEservice] },
});

export const mockFileAssetHistoryViewed = createMockFileAssetHistory({
  type: FILE_ASSET_ACTION.VIEWED,
});

export const mockFileAssetHistories = [mockFileAssetHistory, mockFileAssetHistory2];
