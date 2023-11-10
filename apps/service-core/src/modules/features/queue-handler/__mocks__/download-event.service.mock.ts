import { DownloadMessage } from '@filesg/backend-common';
import { EVENT, FILE_ASSET_ACTION, FILE_STATUS, FILE_TYPE, STATUS } from '@filesg/common';
import { EntityManager } from 'typeorm';

import { FileAssetHistoryCreationModel } from '../../../../entities/file-asset-history';
import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { DownloadEventService } from '../events/download-event.service';

export const mockDownloadEventService: MockService<DownloadEventService> = { fileDownloadedHandler: jest.fn() };

// =============================================================================
// Test Service
// =============================================================================
export class TestDownloadEventService extends DownloadEventService {
  public async retrieveFileAssetAndCreateDownloadHistory(fileAssetId: string, entityManager: EntityManager) {
    return super.retrieveFileAssetAndCreateDownloadHistory(fileAssetId, entityManager);
  }
}

// =============================================================================
// Mock Entities
// =============================================================================
export const mockCitizenUser = createMockCitizenUser({
  id: 1,
  uin: 'S9203266C',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
});

export const mockFileAsset1 = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile1',
  documentType: FILE_TYPE.JPEG,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  size: 123,
  status: FILE_STATUS.ACTIVE,
  metadata: {},
  oaCertificate: null,
});

export const mockFileAsset2 = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-2',
  name: 'mockFile2',
  documentType: FILE_TYPE.JPEG,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  size: 123,
  status: FILE_STATUS.ACTIVE,
  metadata: {},
  oaCertificate: null,
});

// =============================================================================
// Mock Messages
// =============================================================================
export const mockMessage: DownloadMessage = {
  event: EVENT.FILES_DOWNLOADED,
  payload: {
    fileAssetIds: [mockFileAsset1.uuid, mockFileAsset2.uuid],
  },
};

export const mockFileAssetHistoryCreationModel1: FileAssetHistoryCreationModel = {
  type: FILE_ASSET_ACTION.DOWNLOAD,
  actionBy: mockCitizenUser,
  fileAsset: mockFileAsset1,
};

export const mockFileAssetHistoryCreationModel2: FileAssetHistoryCreationModel = {
  type: FILE_ASSET_ACTION.DOWNLOAD,
  actionBy: mockCitizenUser,
  fileAsset: mockFileAsset2,
};
