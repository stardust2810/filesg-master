import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_FAIL_CATEGORY,
  FILE_STATUS,
  FILE_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { mockApplication } from '../../transaction/__mocks__/revoke-transaction.mock';
import { PostScanEventService } from '../events/post-scan-event.service';

// =============================================================================
// Services
// =============================================================================
export const mockPostScanEventService: MockService<PostScanEventService> = {
  scanSuccessHandler: jest.fn(),
  scanVirusOrErrorHandler: jest.fn(),
};

// =============================================================================
// File Assets
// =============================================================================
export const mockScanningFileAssetUuid = 'mockScanningFileAssetUuid';
export const mockCleanFileAssetUuid = 'mockCleanFileAssetUuid';
export const mockVirusFileAssetUuid = 'mockVirusFileAssetUuid';
export const mockScanErrorFileAssetUuid = 'mockScanErrorFileAssetUuid';
const mockFileAssetName = 'mockFileAssetName';
const mockDocumentType = FILE_TYPE.OA;
const mockFileAssetSize = 123;
const mockFileAssetMetadata = {};

const mockScanningFileAsset = createMockFileAsset({
  uuid: mockScanningFileAssetUuid,
  type: FILE_ASSET_TYPE.UPLOADED,
  status: FILE_STATUS.SCANNING,
  name: mockFileAssetName,
  documentType: mockDocumentType,
  size: mockFileAssetSize,
  metadata: mockFileAssetMetadata,
});

const mockCleanFileAsset = createMockFileAsset({
  uuid: mockCleanFileAssetUuid,
  type: FILE_ASSET_TYPE.UPLOADED,
  status: FILE_STATUS.CLEAN,
  name: mockFileAssetName,
  documentType: mockDocumentType,
  size: mockFileAssetSize,
  metadata: mockFileAssetMetadata,
});

export const mockVirusFileAsset = createMockFileAsset({
  uuid: mockVirusFileAssetUuid,
  type: FILE_ASSET_TYPE.UPLOADED,
  status: FILE_STATUS.FAILED,
  failCategory: FILE_FAIL_CATEGORY.VIRUS,
  failReason: 'mock virus message',
  name: mockFileAssetName,
  documentType: mockDocumentType,
  size: mockFileAssetSize,
  metadata: mockFileAssetMetadata,
});

const mockScanErrorFileAsset = createMockFileAsset({
  uuid: mockScanErrorFileAssetUuid,
  type: FILE_ASSET_TYPE.UPLOADED,
  status: FILE_STATUS.FAILED,
  failCategory: FILE_FAIL_CATEGORY.SCAN_ERROR,
  failReason: 'mock scan error message',
  name: mockFileAssetName,
  documentType: mockDocumentType,
  size: mockFileAssetSize,
  metadata: mockFileAssetMetadata,
});

const mockScanningFileAssets = [mockCleanFileAsset, mockScanningFileAsset];
const mockCleanFileAssets = [mockCleanFileAsset, mockCleanFileAsset];
const mockVirusFileAssets = [mockCleanFileAsset, mockVirusFileAsset];
const mockScanErrorFileAssets = [mockScanErrorFileAsset, mockCleanFileAsset];

// =============================================================================
// Activities
// =============================================================================
export const mockScanningActivityUuid = 'mockScanningActivityUuid';
export const mockCleanActivityUuid = 'mockCleanActivityUuid';
export const mockVirusActivityUuid = 'mockVirusActivityUuid';
export const mockScanErrorActivityUuid = 'mockScanErrorActivityUuid';

const mockScanningUploadActivity = createMockActivity({
  uuid: mockScanningActivityUuid,
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.SCANNING,
  fileAssets: mockScanningFileAssets,
});

const mockCleanUploadActivity = createMockActivity({
  uuid: mockCleanActivityUuid,
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.SCANNING,
  fileAssets: mockCleanFileAssets,
});

const mockVirusUploadActivity = createMockActivity({
  uuid: mockVirusActivityUuid,
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.SCANNING,
  fileAssets: mockVirusFileAssets,
});

const mockScanErrorUploadActivity = createMockActivity({
  uuid: mockScanErrorActivityUuid,
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.SCANNING,
  fileAssets: mockScanErrorFileAssets,
});

const mockSendTransferActivity = createMockActivity({
  uuid: 'mockActivity-uuid-2',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.INIT,
});

const mockReceiveTransferActivity = createMockActivity({
  uuid: 'mockActivity-uuid-3',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.INIT,
});

const mockScanningActivities = [mockSendTransferActivity, mockReceiveTransferActivity, mockScanningUploadActivity];
const mockCleanActivities = [mockSendTransferActivity, mockReceiveTransferActivity, mockCleanUploadActivity];
const mockVirusActivities = [mockSendTransferActivity, mockReceiveTransferActivity, mockVirusUploadActivity];
const mockScanErrorActivities = [mockSendTransferActivity, mockReceiveTransferActivity, mockScanErrorUploadActivity];

// =============================================================================
// Transactions
// =============================================================================
export const mockFileSessionId = 'mockFileSession-uuid-1';
const mockScanningTransactionUuid = 'mockScanningTransactionUuid';
export const mockCleanTransactionUuid = 'mockCleanTransactionUuid';
const mockVirusTransactionUuid = 'mockVirusTransactionUuid';
const mockScanErrorTransactionUuid = 'mockScanErrorTransactionUuid';

export const mockScanningTransaction = createMockTransaction({
  uuid: mockScanningTransactionUuid,
  fileSessionId: mockFileSessionId,
  status: TRANSACTION_STATUS.INIT,
  type: TRANSACTION_TYPE.UPLOAD,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  name: 'mock transaction 1',
  activities: mockScanningActivities,
});

export const mockCleanTransaction = createMockTransaction({
  uuid: mockCleanTransactionUuid,
  fileSessionId: mockFileSessionId,
  status: TRANSACTION_STATUS.INIT,
  type: TRANSACTION_TYPE.UPLOAD,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  name: 'mock transaction 1',
  activities: mockCleanActivities,
  application: mockApplication,
});

export const mockVirusTransaction = createMockTransaction({
  uuid: mockVirusTransactionUuid,
  fileSessionId: mockFileSessionId,
  status: TRANSACTION_STATUS.INIT,
  type: TRANSACTION_TYPE.UPLOAD,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  name: 'mock transaction 1',
  activities: mockVirusActivities,
  application: {
    id: 1,
    uuid: 'mockApplication-uuid-01',
    externalRefId: 'external-ref',
    createdAt: new Date(),
    updatedAt: new Date(),
    eservice: {
      id: 1,
      uuid: 'mockService-uuid-1',
      emails: ['mockeservice@gmail.com'],
      name: 'mockeservice',
      agencyId: 1,
      agency: {
        id: 1,
        uuid: 'mockAgency-uuid-1',
        name: 'mockagency',
        code: 'MA',
        status: STATUS.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
        oaSigningKey: 'someKey',
        identityProofLocation: 'file.gov.sg',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  },
});

export const mockScanErrorTransaction = createMockTransaction({
  uuid: mockScanErrorTransactionUuid,
  fileSessionId: mockFileSessionId,
  status: TRANSACTION_STATUS.INIT,
  type: TRANSACTION_TYPE.UPLOAD,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  name: 'mock transaction 1',
  activities: mockScanErrorActivities,
});

// =============================================================================
// Implementations
// =============================================================================

export const retrieveActivityWithFileAssetsImplementation = (activityUuid: string) => {
  switch (activityUuid) {
    case mockScanningActivityUuid:
      return mockScanningUploadActivity;
    case mockCleanActivityUuid:
      return mockCleanUploadActivity;
    case mockVirusActivityUuid:
      return mockVirusUploadActivity;
    case mockScanErrorActivityUuid:
      return mockScanErrorUploadActivity;
  }
};

export const retrieveTransactionByFileAssetUuidImplementation = (fileAssetUuid: string) => {
  switch (fileAssetUuid) {
    case mockScanningFileAssetUuid:
      return mockScanningTransaction;
    case mockCleanFileAssetUuid:
      return mockCleanTransaction;
    case mockVirusFileAssetUuid:
      return mockVirusTransaction;
    case mockScanErrorFileAssetUuid:
      return mockScanErrorTransaction;
  }
};
