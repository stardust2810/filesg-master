/* eslint-disable sonarjs/no-duplicate-string */
import {
  MoveCompletedMessagePayload,
  MoveCompletedMessageTransfer,
  MoveFailedMessagePayload,
  MoveFailedMessageTransfer,
  TransferMoveCompletedMessage,
  TransferMoveFailedMessage,
  UploadMoveCompletedMessage,
  UploadMoveFailedMessage,
} from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  EVENT,
  FILE_FAIL_CATEGORY,
  FILE_SESSION_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  FileTransferMoveSession,
  FileTransferMoveSessionTransfer,
  STATUS,
  TRANSACTION_TYPE,
  TransactionDetails,
} from '@filesg/common';
import { EntityManager } from 'typeorm';

import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockCitizenUser, createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { MoveEventService } from '../events/move-event.service';

export const mockMoveEventService: MockService<MoveEventService> = {
  uploadMoveSuccessHandler: jest.fn(),
  uploadMoveFailedHandler: jest.fn(),
  transferMoveSuccessHandler: jest.fn(),
  transferMoveFailedHandler: jest.fn(),
};

// =============================================================================
// Test Service
// =============================================================================
export class TestMoveEventService extends MoveEventService {
  public async uploadMoveSuccessUploadTxnHandler(payload: MoveCompletedMessagePayload) {
    return super.uploadMoveSuccessUploadTxnHandler(payload);
  }

  public async uploadMoveSuccessUploadTransferTxnHandler(payload: MoveCompletedMessagePayload) {
    return super.uploadMoveSuccessUploadTransferTxnHandler(payload);
  }

  public async uploadMoveFailureAllTxnHandler(payload: MoveFailedMessagePayload) {
    return super.uploadMoveFailureAllTxnHandler(payload);
  }

  public async transferMoveSuccessTransferTxnHandler(payload: MoveCompletedMessagePayload) {
    return super.transferMoveSuccessTransferTxnHandler(payload);
  }

  public async transferMoveSuccessUploadTransferTxnHandler(payload: MoveCompletedMessagePayload) {
    return super.transferMoveSuccessUploadTransferTxnHandler(payload);
  }

  public async transferMoveFailureAllTxnHandler(payload: MoveFailedMessagePayload) {
    return super.transferMoveFailureAllTxnHandler(payload);
  }

  public async moveCompletedMessageHandler(
    transactionUuid: string,
    transfers: MoveCompletedMessageTransfer[],
    entityManager?: EntityManager,
    additionals?: { fileAssetUuids?: string[]; activityUuids?: string[]; oaCertificateIds: string[] },
  ) {
    return super.moveCompletedMessageHandler(transactionUuid, transfers, entityManager, additionals);
  }

  public async moveFailedMessageHandler(
    transaction: TransactionDetails,
    transfers: MoveFailedMessageTransfer[],
    failCategory: FILE_FAIL_CATEGORY,
    entityManager?: EntityManager,
    additionals?: { activityUuids?: string[] },
  ) {
    return super.moveFailedMessageHandler(transaction, transfers, failCategory, entityManager, additionals);
  }

  public async addTransferMoveSession(transaction: TransactionDetails, transfers: MoveCompletedMessageTransfer[]) {
    return super.addTransferMoveSession(transaction, transfers);
  }

  public async sendTransferSessionToRedis(transaction: TransactionDetails, transfers: FileTransferMoveSessionTransfer[]) {
    return super.sendTransferSessionToRedis(transaction, transfers);
  }
}

// =============================================================================
// Mock Entities
// =============================================================================

export const mockProgrammaticUser = createMockProgrammaticUser({
  uuid: 'mockUser-uuid-1',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
  clientId: 'client-uuid-1',
  clientSecret: 'secret',
});

const mockCitizenUser = createMockCitizenUser({
  uuid: 'mockUser-uuid-2',
  uin: 'S9203266C',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
});

const mockUploadActivity = createMockActivity({
  uuid: 'mockActivity-uuid-1',
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.UPLOAD,
  user: mockProgrammaticUser,
});

export const mockSendTransferActivity = createMockActivity({
  uuid: 'mockActivity-uuid-2',
  status: ACTIVITY_STATUS.INIT,
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  user: mockProgrammaticUser,
});

const mockSentFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'fileAsset-1',
  size: 123,
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.JPEG,
  metadata: { project: '', alias: '' },
  status: FILE_STATUS.ACTIVE,
  expireAt: new Date(),
});

const mockSentFileAsset2 = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-2',
  name: 'fileAsset-2',
  size: 456,
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.OA,
  metadata: { project: '', alias: '' },
  status: FILE_STATUS.ACTIVE,
  expireAt: new Date(),
});

export const mockReceivedFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-3',
  name: 'fileAsset-3',
  size: 123,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.JPEG,
  metadata: { project: '', alias: '' },
  status: FILE_STATUS.ACTIVE,
  expireAt: new Date(),
  parent: mockSentFileAsset,
});

export const mockReceivedFileAsset2 = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-4',
  name: 'fileAsset-4',
  size: 456,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.OA,
  metadata: { project: '', alias: '' },
  status: FILE_STATUS.ACTIVE,
  expireAt: new Date(),
  parent: mockSentFileAsset2,
  oaCertificateId: 'mockOaCertificate-id-1',
});

export const mockReceiveTransferActivity = createMockActivity({
  uuid: 'mockActivity-uuid-3',
  status: ACTIVITY_STATUS.INIT,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  user: mockCitizenUser,
  fileAssets: [mockReceivedFileAsset, mockReceivedFileAsset2],
});

// =============================================================================
// Mocked Message
// =============================================================================

export const mockUploadMoveCompletedUploadTxnMessage: UploadMoveCompletedMessage = {
  event: EVENT.FILES_UPLOAD_MOVE_COMPLETED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.UPLOAD,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: TRANSACTION_TYPE.UPLOAD,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockSentFileAsset.uuid }, { id: mockSentFileAsset2.uuid }] }],
  },
};

export const mockUploadMoveCompletedUploadTransferTxnMessage: UploadMoveCompletedMessage = {
  event: EVENT.FILES_UPLOAD_MOVE_COMPLETED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.UPLOAD,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockSentFileAsset.uuid }, { id: mockSentFileAsset2.uuid }] }],
  },
};

export const mockUploadMoveCompletedUnknownTxnMessage: UploadMoveCompletedMessage = {
  event: EVENT.FILES_UPLOAD_MOVE_COMPLETED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.UPLOAD,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: 'UNKNOWN' as TRANSACTION_TYPE,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockSentFileAsset.uuid }, { id: mockSentFileAsset2.uuid }] }],
  },
};

export const mockUploadMoveFailedAllTxnMessage: UploadMoveFailedMessage = {
  event: EVENT.FILES_UPLOAD_MOVE_FAILED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.UPLOAD,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: TRANSACTION_TYPE.UPLOAD,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockSentFileAsset2.uuid, error: 'mockError' }] }],
  },
};

export const mockUploadMoveFailedUnknownTxnMessage: UploadMoveFailedMessage = {
  event: EVENT.FILES_UPLOAD_MOVE_FAILED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.UPLOAD,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: 'UNKNOWN' as TRANSACTION_TYPE,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockSentFileAsset2.uuid, error: 'mockError' }] }],
  },
};

export const mockTransferMoveCompletedTransferTxnMessage: TransferMoveCompletedMessage = {
  event: EVENT.FILES_TRANSFER_MOVE_COMPLETED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.TRANSFER,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: TRANSACTION_TYPE.TRANSFER,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockReceivedFileAsset.uuid }, { id: mockReceivedFileAsset2.uuid }] }],
  },
};

export const mockTransferMoveCompletedUploadTransferTxnMessage: TransferMoveCompletedMessage = {
  event: EVENT.FILES_TRANSFER_MOVE_COMPLETED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.TRANSFER,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockReceivedFileAsset.uuid }, { id: mockReceivedFileAsset2.uuid }] }],
  },
};

export const mockTransferMoveCompletedUnknownTxnMessage: TransferMoveCompletedMessage = {
  event: EVENT.FILES_TRANSFER_MOVE_COMPLETED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.TRANSFER,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: 'UNKNOWN' as TRANSACTION_TYPE,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockReceivedFileAsset.uuid }, { id: mockReceivedFileAsset2.uuid }] }],
  },
};

export const mockTransferMoveFailedAllTxnMessage: TransferMoveFailedMessage = {
  event: EVENT.FILES_TRANSFER_MOVE_FAILED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.TRANSFER,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockReceivedFileAsset.uuid, error: 'mockError' }] }],
  },
};

export const mockTransferMoveFailedUnknownTxnMessage: TransferMoveFailedMessage = {
  event: EVENT.FILES_TRANSFER_MOVE_FAILED,
  payload: {
    fileSession: {
      id: 'mockFileSession-uuid-1',
      type: FILE_SESSION_TYPE.TRANSFER,
    },
    transaction: {
      id: 'mockTransaction-uuid-1',
      type: 'UNKNOWN' as TRANSACTION_TYPE,
    },
    transfers: [{ activityId: mockUploadActivity.uuid, files: [{ id: mockReceivedFileAsset.uuid, error: 'mockError' }] }],
  },
};

// =============================================================================
// Mock file session
// =============================================================================

export const sessionTransfers: FileTransferMoveSessionTransfer[] = [mockReceiveTransferActivity].map((activity) => ({
  activityId: activity.uuid,
  owner: {
    id: mockSendTransferActivity.user!.uuid,
    type: mockSendTransferActivity.user!.type,
  },
  receiver: {
    id: activity.user!.uuid,
    type: activity.user!.type,
  },
  files: activity.fileAssets!.map((file) => ({ ownerFileAssetId: file.parent!.uuid, receiverFileAssetId: file.uuid })),
}));

export const transferSession: FileTransferMoveSession = {
  type: FILE_SESSION_TYPE.TRANSFER,
  transaction: mockUploadMoveCompletedUploadTransferTxnMessage.payload.transaction,
  transfers: sessionTransfers,
};
