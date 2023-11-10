import { ACTIVITY_TYPE, TRANSACTION_CREATION_METHOD, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@filesg/common';

import { TransactionCreationModel } from '../../../../entities/transaction';
import { MockService } from '../../../../typings/common.mock';
import {
  mockReceiveTransferActivty,
  mockSendTransferActivty,
  mockUploadActivty,
} from '../../activity/__mocks__/activity.entity.service.mock';
import { TransactionEntityService } from '../transaction.entity.service';
import { createMockTransaction } from './transaction.mock';

export const mockTransactionEntityService: MockService<TransactionEntityService> = {
  // Create
  buildTransaction: jest.fn(),
  insertTransactions: jest.fn(),
  saveTransactions: jest.fn(),
  saveTransaction: jest.fn(),

  // Read
  retrieveTransactionByUuid: jest.fn(),
  retrievePartialTransactionWithStatusInfoByUuidAndUserId: jest.fn(),
  retrieveTransactionWithActivitiesAndOwnersByUuidAndActivityType: jest.fn(),
  retrieveTransactionWithApplicationDetailsByUuid: jest.fn(),
  retrieveTransactionByFileAssetUuid: jest.fn(),
  retrieveTransactionsByFileAssetUuids: jest.fn(),
  retrieveTransactionsUsingEserviceIds: jest.fn(),

  // Update
  updateTransaction: jest.fn(),
  updateTransactions: jest.fn(),
  updateTransactionStatus: jest.fn(),
  retrieveTransactionByUuidAndUserId: jest.fn(),
};

export const mockTransactionUuid = 'mockTransaction-uuid-1';
export const mockTransactionUuid2 = 'mockTransaction-uuid-2';
export const mockTransactionModels: TransactionCreationModel[] = [
  {
    name: 'transaction-1',
    status: TRANSACTION_STATUS.COMPLETED,
    type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
    creationMethod: TRANSACTION_CREATION_METHOD.API,
  },
  {
    name: 'transaction-2',
    status: TRANSACTION_STATUS.COMPLETED,
    type: TRANSACTION_TYPE.REVOKE,
    creationMethod: TRANSACTION_CREATION_METHOD.API,
  },
];

export const mockTransaction = createMockTransaction({
  name: 'transaction-1',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockTransaction2 = createMockTransaction({
  name: 'transaction-2',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.REVOKE,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockedDataForTransactionStatus = {
  status: 'completed',
  type: 'delete',
  activities: [
    {
      uuid: 'FSG-20230522-db25a54c943ab41b',
      fileAssets: [
        {
          name: 'LTVP.oa',
          status: 'deleted',
          failCategory: null,
          failReason: null,
        },
      ],
    },
  ],
  updatedAt: new Date().toISOString(),
};

export const resultantDataForTransactionStatus = {
  status: 'completed',
  type: 'delete',
  activities: [
    {
      uuid: 'FSG-20230522-db25a54c943ab41b',
      fileAssets: [
        {
          name: 'LTVP.oa',
          status: 'deleted',
          failCategory: null,
          failReason: null,
        },
      ],
    },
  ],
  updatedAt: mockedDataForTransactionStatus.updatedAt,
};

export const mockTransactions = [mockTransaction, mockTransaction2];

export const mockTransactionWithActivityAndFileAssets = createMockTransaction({
  id: 1,
  uuid: mockTransactionUuid,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
  name: 'Your file is ready for viewing',
  activities: [mockUploadActivty, mockSendTransferActivty, mockReceiveTransferActivty],
  applicationId: 1,
});
