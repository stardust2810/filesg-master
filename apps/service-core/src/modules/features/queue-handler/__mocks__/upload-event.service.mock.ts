import { FileAssetMetaData, UploadToStgCompletedMessage, UploadToStgFailedMessage } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  EVENT,
  FILE_STATUS,
  FILE_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { EntityManager } from 'typeorm';

import { Activity } from '../../../../entities/activity';
import { Transaction } from '../../../../entities/transaction';
import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { UploadEventService } from '../events/upload-event.service';

export const mockUploadEventService: MockService<UploadEventService> = {
  uploadToStgSuccessHandler: jest.fn(),
  uploadtoStgFailedHandler: jest.fn(),
};

// =============================================================================
// Test Service
// =============================================================================
export class TestUploadEventService extends UploadEventService {
  public async processFileAssset(fileMetaData: FileAssetMetaData, entityManager?: EntityManager) {
    return super.processFileAssset(fileMetaData, entityManager);
  }

  public constructFileUploadMoveSession(parentTransaction: Transaction, parentActivity: Activity, fileMetaData: FileAssetMetaData[]) {
    return super.constructFileUploadMoveSession(parentTransaction, parentActivity, fileMetaData);
  }
}

// =============================================================================
// Mock Entities
// =============================================================================
const mockUser = createMockProgrammaticUser({
  uuid: 'mockUser-uuid-1',
  email: 'test@gmail.com',
  status: STATUS.ACTIVE,
  clientId: 'client-uuid-1',
  clientSecret: 'secret',
});

export const mockActivity = createMockActivity({
  uuid: 'mockActivity-uuid-1',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.INIT,
  user: mockUser,
  emails: [],
});

export const mockFileAsset = createMockFileAsset({
  id: 1,
  uuid: 'mockFileAsset-uuid-1',
  name: 'fileAsset-1',
  size: 1024,
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.OA,
  metadata: { project: '', alias: '' },
  status: FILE_STATUS.INIT,
  expireAt: new Date(),
});

export const mockTransaction = createMockTransaction({
  uuid: 'mockTransaction-uuid-1',
  fileSessionId: 'mockFileAsset-uuid-1',
  name: 'transaction-1',
  status: TRANSACTION_STATUS.INIT,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  customAgencyMessage: { transaction: ['customAgencyMessage'], email: ['customAgencyMessage'] },
});

// =============================================================================
// Mock Message
// =============================================================================
export const mockUploadTransferSuccessfullTxnMessage: UploadToStgCompletedMessage = {
  event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED,
  payload: {
    transactionId: 'mockTransaction-uuid-1',
    fileAssetInfos: [
      {
        fileName: 'mockFileName.pdf',
        fileAssetId: 'mockFileAsset-uuid-1',
        fileType: FILE_TYPE.OA,
        size: 1024,
        oaCertificateId: 'oaCertificate-id-1',
        oaCertificateHash: 'oaCertificateHash-1',
        isPasswordEncryptionRequired: true,
      },
    ],
  },
};

export const mockUploadTransferFailedTxnMessage: UploadToStgFailedMessage = {
  event: EVENT.FILES_UPLOAD_TO_STG_FAILED,
  payload: {
    failedFiles: [{ fileAssetId: 'mockFileAsset-uuid-1', failedReason: 'Requested bucket not found in S3' }],
    transactionId: 'mockTransaction-uuid-1',
  },
};
