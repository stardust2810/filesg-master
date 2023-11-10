/* eslint-disable sonarjs/no-duplicate-string */
import { Credentials } from '@aws-sdk/types';
import { FailedMove } from '@filesg/aws';
import { MoveFailedMessageTransfer } from '@filesg/backend-common';
import {
  FILE_SESSION_TYPE,
  FileMoveInfoResponse,
  FileMoveSessionDetails,
  FileTransfer,
  TRANSACTION_TYPE,
  TransactionDetails,
} from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { CopyTransferFilesEncrypted, EncryptedFileAssetUuidToNewSizeMap } from '../../aws/s3.service';
import { UploadAndTransferMoveService } from '../move-type/upload-transfer-move.service';

// =============================================================================
// Test Service
// =============================================================================
export class TestUploadAndTransferMoveService extends UploadAndTransferMoveService {
  public async handleMoveTransfer(transferInfo: FileMoveInfoResponse) {
    return super.handleMoveTransfer(transferInfo);
  }

  public async validateMovePromiseResults(
    movePromiseResults: PromiseSettledResult<CopyTransferFilesEncrypted | undefined>[],
    transferInfo: FileMoveInfoResponse,
  ) {
    return super.validateMovePromiseResults(movePromiseResults, transferInfo);
  }

  public async validateMoveTransfer(fileSessionType: FILE_SESSION_TYPE, transfer: FileTransfer, failedFileAssetIds: string[]) {
    return super.validateMoveTransfer(fileSessionType, transfer, failedFileAssetIds);
  }

  public async handleFailedMoveException(failedMoves: FailedMove[], transferInfo: FileMoveInfoResponse) {
    return super.handleFailedMoveException(failedMoves, transferInfo);
  }

  public async sendUploadMoveCompletedMessage(
    fileSession: FileMoveSessionDetails,
    transaction: TransactionDetails,
    transfers: FileTransfer[],
    encryptedPassword?: string,
    fileAssetUuidToNewSizeMap?: EncryptedFileAssetUuidToNewSizeMap,
  ) {
    return super.sendUploadMoveCompletedMessage(fileSession, transaction, transfers, encryptedPassword, fileAssetUuidToNewSizeMap);
  }

  public async sendTransferMoveCompletedMessage(
    fileSession: FileMoveSessionDetails,
    transaction: TransactionDetails,
    transfers: FileTransfer[],
  ) {
    return super.sendTransferMoveCompletedMessage(fileSession, transaction, transfers);
  }

  public async sendMoveFailedMessage(
    fileSession: FileMoveSessionDetails,
    transaction: TransactionDetails,
    transfers: MoveFailedMessageTransfer[],
  ) {
    return super.sendMoveFailedMessage(fileSession, transaction, transfers);
  }

  public async deleteAllFilesFromBucket(fileSessionType: FILE_SESSION_TYPE, transfers: FileTransfer[]) {
    return super.deleteAllFilesFromBucket(fileSessionType, transfers);
  }

  public reconcileZipEncryptedFileName(name: string) {
    return super.reconcileZipEncryptedFileName(name);
  }
}

export const mockUploadAndTransferMoveService: MockService<UploadAndTransferMoveService> = {
  handleUploadAndTransferMove: jest.fn(),
};

// =============================================================================
// Mock Data
// =============================================================================
export const mockCredentials: Credentials = {
  accessKeyId: 'mockAccessKeyId',
  secretAccessKey: 'mockSecretAccessKey',
};

export const mockUploadMoveTransferInfo: FileMoveInfoResponse = {
  fileSession: { id: 'fileSession-uuid-1', type: FILE_SESSION_TYPE.UPLOAD },
  transaction: {
    id: 'transaction-uuid-1',
    type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  },
  fromBucket: 's3-fsg-devezapp-file-stg-clean',
  toBucket: 's3-fsg-devezapp-file-main',
  transfers: [
    {
      activityId: 'activity-uuid-1',
      assumeRole: {
        receiver: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17',
      },
      files: [
        {
          from: {
            fileAssetUuid: 'fileAsset-uuid-1',
            key: 'fileAsset-uuid-1',
          },
          to: {
            fileAssetUuid: 'fileAsset-uuid-1',
            key: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17/fileAsset-uuid-1',
          },
        },
        {
          from: {
            fileAssetUuid: 'fileAsset-uuid-2',
            key: 'fileAsset-uuid-2',
          },
          to: {
            fileAssetUuid: 'fileAsset-uuid-2',
            key: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17/fileAsset-uuid-2',
          },
        },
      ],
    },
  ],
};

export const mockNewFileName = 'newName.zip';

export const mockUploadMoveTransferInfoWithEncryptedFiles: FileMoveInfoResponse = {
  ...mockUploadMoveTransferInfo,
  transfers: [
    {
      ...mockUploadMoveTransferInfo.transfers[0],
      files: mockUploadMoveTransferInfo.transfers[0].files.map((file) => ({
        ...file,
        isPasswordEncryptionRequired: true,
        name: mockNewFileName,
      })),
    },
  ],
};

export const mockFileAssetUuidToNewSizeMap =
  mockUploadMoveTransferInfoWithEncryptedFiles.transfers[0].files.reduce<EncryptedFileAssetUuidToNewSizeMap>((acc, cur) => {
    if (cur.isPasswordEncryptionRequired) {
      acc[cur.to.fileAssetUuid!] = 100;
    }
    return acc;
  }, {});

export const mockEncryptedPassword = 'mockEncryptedPassword';

export const mockTransferMoveTransferInfo: FileMoveInfoResponse = {
  fileSession: {
    id: 'fileSession-uuid-1',
    type: FILE_SESSION_TYPE.TRANSFER,
  },
  transaction: {
    id: 'transaction-uuid-1',
    type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  },
  fromBucket: 's3-fsg-devezapp-file-main',
  toBucket: 's3-fsg-devezapp-file-main',
  transfers: [
    {
      activityId: 'activity-uuid-1',
      assumeRole: {
        owner: '54321979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d912345',
        receiver: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17',
      },
      files: [
        {
          from: {
            fileAssetUuid: 'fileAsset-uuid-1',
            key: '54321979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d912345/fileAsset-uuid-1',
          },
          to: {
            fileAssetUuid: 'fileAsset-uuid-3',
            key: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17/fileAsset-uuid-3',
          },
        },
        {
          from: {
            fileAssetUuid: 'fileAsset-uuid-2',
            key: '54321979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d912345/fileAsset-uuid-2',
          },
          to: {
            fileAssetUuid: 'fileAsset-uuid-4',
            key: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17/fileAsset-uuid-4',
          },
        },
      ],
    },
  ],
};

export const mockTransferInfoWithoutTransferFiles: FileMoveInfoResponse = {
  ...mockUploadMoveTransferInfo,
  transfers: [
    {
      activityId: 'activity-uuid-1',
      assumeRole: {
        receiver: '106e6979629566c84f025dae60fd3e19ad484b56d1f50d869db692783d9bea17',
      },
      files: [],
    },
  ],
};

export const mockFailureTransferInfo = {
  ...mockUploadMoveTransferInfo,
  fileSession: {
    id: 'fileSession-uuid-1',
    type: FILE_SESSION_TYPE.DOWNLOAD as typeof FILE_SESSION_TYPE.UPLOAD,
  },
};
