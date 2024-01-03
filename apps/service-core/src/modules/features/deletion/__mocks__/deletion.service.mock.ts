import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { FileAsset } from '../../../../entities/file-asset';
import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockApplicationType } from '../../../entities/application-type/__mocks__/application-type.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { DeletionService } from '../deletion.service';

export const mockDeletionService: MockService<DeletionService> = {
  agencyDeleteFileAssets: jest.fn(),
  createFileSessionAndSendDeleteMsg: jest.fn(),
};

export const FILE_ASSET_MOCK_DATE = new Date('2022-07-24T00:00:00.000Z');
// =============================================================================
// Base Entity
// =============================================================================
// -----------------------------------------------------------------------------
// OA Cert UUID
// -----------------------------------------------------------------------------
export const MOCK_OA_CERT_UUID_1 = 'oa-cert-uuid-1';
export const MOCK_OA_CERT_UUID_2 = 'oa-cert-uuid-2';

// -----------------------------------------------------------------------------
// Application Type
// -----------------------------------------------------------------------------
const MOCK_APPLICATION_TYPE = createMockApplicationType({
  id: 1001,
  uuid: 'applicationType-uuid-1001',
  code: 'LTVP',
  name: 'Long Term Visit Pass',
});

// -----------------------------------------------------------------------------
// Application
// -----------------------------------------------------------------------------
export const MOCK_APPLICATION_1 = createMockApplication({
  id: 2001,
  uuid: 'application-uuid-2001',
  externalRefId: 'ICA-LTVP-20220329151330-ae3aa582',
  applicationType: MOCK_APPLICATION_TYPE,
});

// =============================================================================
// Transaction
// =============================================================================
export const MOCK_TRANSACTION_1 = createMockTransaction({
  id: 3001,
  uuid: 'transaction-uuid-3001',
  fileSessionId: null,
  name: 'transaction 3001',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.SYSTEM,
  customAgencyMessage: null,
  userId: 3,
  applicationId: 2001,
  application: MOCK_APPLICATION_1,
});

export const MOCK_TRANSACTION_2 = createMockTransaction({
  id: 3002,
  uuid: 'transaction-uuid-3002',
  fileSessionId: null,
  name: 'transaction 3002',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.SYSTEM,
  customAgencyMessage: null,
  userId: 3,
  applicationId: 2001,
  application: MOCK_APPLICATION_1,
});

export const MOCK_DELETION_TRANSACTION = createMockTransaction({
  id: 3101,
  uuid: 'transaction-uuid-3101',
  fileSessionId: null,
  name: 'transaction 3101',
  status: TRANSACTION_STATUS.INIT,
  type: TRANSACTION_TYPE.DELETE,
  creationMethod: TRANSACTION_CREATION_METHOD.SYSTEM,
  customAgencyMessage: null,
  userId: 3,
  applicationId: 2001,
  application: MOCK_APPLICATION_1,
});

// =============================================================================
// Activities
// =============================================================================
const MOCK_ACTIVITY_UPLOAD_1 = createMockActivity({
  id: 4001,
  uuid: 'activity-uuid-4001',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3001,
  userId: 3,
  transaction: MOCK_TRANSACTION_1,
});

const MOCK_ACTIVITY_SEND_TRANSFER_1 = createMockActivity({
  id: 4002,
  uuid: 'activity-uuid-4002',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3001,
  userId: 3,
  transaction: MOCK_TRANSACTION_1,
});

export const MOCK_ACTIVITY_RECEIVE_TRANSFER_1 = createMockActivity({
  id: 4003,
  uuid: 'activity-uuid-4003',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: {
    name: 'John',
    dob: '1980-01-01',
    mobile: '+659876532',
    email: 'myemail@myemail.com',
    failedAttempts: 0,
  },
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3001,
  userId: 3,
  transaction: MOCK_TRANSACTION_1,
});

const MOCK_ACTIVITY_UPLOAD_2 = createMockActivity({
  id: 4004,
  uuid: 'activity-uuid-4004',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3002,
  userId: 3,
  transaction: MOCK_TRANSACTION_2,
});

const MOCK_ACTIVITY_SEND_TRANSFER_2 = createMockActivity({
  id: 4005,
  uuid: 'activity-uuid-4005',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3002,
  userId: 3,
  transaction: MOCK_TRANSACTION_2,
});

const MOCK_ACTIVITY_RECEIVE_TRANSFER_2 = createMockActivity({
  id: 4006,
  uuid: 'activity-uuid-4006',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: {
    name: 'John',
    dob: '1980-01-01',
    mobile: '+659876532',
    email: 'myemail@myemail.com',
    failedAttempts: 0,
  },
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3002,
  userId: 4,
  transaction: MOCK_TRANSACTION_2,
});

const MOCK_ACTIVITY_RECEIVE_TRANSFER_3 = createMockActivity({
  id: 4007,
  uuid: 'activity-uuid-4007',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: {
    name: 'Kopi Ma',
    dob: '1985-01-01',
    mobile: '+6512345678',
    email: 'myemail2@myemail.com',
    failedAttempts: 0,
  },
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: 3002,
  userId: 5,
  transaction: MOCK_TRANSACTION_2,
});

export const MOCK_ACTIVITY_TRIGGER_DELETE = createMockActivity({
  id: 4101,
  uuid: 'activity-uuid-4101',
  type: ACTIVITY_TYPE.TRIGGER_DELETE,
  status: ACTIVITY_STATUS.INIT,
  transactionId: 3101,
  userId: 2,
  transaction: MOCK_DELETION_TRANSACTION,
});

export const MOCK_ACTIVITY_RECEIVE_DELETE = createMockActivity({
  id: 4102,
  uuid: 'activity-uuid-4102',
  type: ACTIVITY_TYPE.RECEIVE_DELETE,
  status: ACTIVITY_STATUS.INIT,
  recipientInfo: {
    name: 'Kopi Ma',
    dob: '1985-01-01',
    mobile: '+6512345678',
    email: 'myemail2@myemail.com',
    failedAttempts: 0,
  },
  isBannedFromNonSingpassVerification: false,
  parentId: 4101,
  transactionId: 3101,
  userId: 4,
  transaction: MOCK_DELETION_TRANSACTION,
});

// =============================================================================
// Test Data
// =============================================================================
export const MOCK_FILE_ASSET_1_AGENCY = createMockFileAsset({
  id: 5001,
  uuid: 'fileAsset-uuid-5001',
  name: 'file-1.oa',
  documentHash: 'XXXXX',
  documentType: FILE_TYPE.OA,
  type: FILE_ASSET_TYPE.UPLOADED,
  size: 1234,
  status: FILE_STATUS.ACTIVE,
  failCategory: null,
  failReason: null,
  metadata: {},
  expireAt: FILE_ASSET_MOCK_DATE,
  ownerId: 3,
  issuerId: 3,
  parentId: null,
  oaCertificateId: MOCK_OA_CERT_UUID_1,
  activities: [MOCK_ACTIVITY_UPLOAD_1, MOCK_ACTIVITY_SEND_TRANSFER_1],
});
export const MOCK_FILE_ASSET_1_RECIPIENT = createMockFileAsset({
  id: 5002,
  uuid: 'fileAsset-uuid-5002',
  name: 'file-1.oa',
  documentHash: 'XXXXX',
  documentType: FILE_TYPE.OA,
  type: FILE_ASSET_TYPE.UPLOADED,
  size: 1234,
  status: FILE_STATUS.ACTIVE,
  failCategory: null,
  failReason: null,
  metadata: {},
  expireAt: FILE_ASSET_MOCK_DATE,
  ownerId: 4,
  issuerId: 3,
  parentId: null,
  oaCertificateId: MOCK_OA_CERT_UUID_1,
  activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_1],
});
// Consist of 1 issuer copy and 1 recipient copy
export const SINGLE_TRANSACTION_SINGLE_FILE: FileAsset[] = [MOCK_FILE_ASSET_1_AGENCY, MOCK_FILE_ASSET_1_RECIPIENT];

export const MULTIPLE_TRANSACTIONS_MULTIPLE_FILES: FileAsset[] = [
  createMockFileAsset({
    id: 5001,
    uuid: 'fileAsset-uuid-5001',
    name: 'file-1.oa',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.OA,
    type: FILE_ASSET_TYPE.UPLOADED,
    size: 1234,
    status: FILE_STATUS.ACTIVE,
    failCategory: null,
    failReason: null,
    metadata: {},
    expireAt: FILE_ASSET_MOCK_DATE,
    ownerId: 3,
    issuerId: 3,
    parentId: null,
    oaCertificateId: MOCK_OA_CERT_UUID_1,
    activities: [MOCK_ACTIVITY_UPLOAD_1, MOCK_ACTIVITY_SEND_TRANSFER_1],
  }),
  createMockFileAsset({
    id: 5002,
    uuid: 'fileAsset-uuid-5002',
    name: 'file-1.oa',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.OA,
    type: FILE_ASSET_TYPE.UPLOADED,
    size: 1234,
    status: FILE_STATUS.ACTIVE,
    failCategory: null,
    failReason: null,
    metadata: {},
    expireAt: FILE_ASSET_MOCK_DATE,
    ownerId: 4,
    issuerId: 3,
    parentId: null,
    oaCertificateId: MOCK_OA_CERT_UUID_1,
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_1],
  }),
  createMockFileAsset({
    id: 5003,
    uuid: 'fileAsset-uuid-5003',
    name: 'file-1.oa',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.OA,
    type: FILE_ASSET_TYPE.UPLOADED,
    size: 1234,
    status: FILE_STATUS.ACTIVE,
    failCategory: null,
    failReason: null,
    metadata: {},
    expireAt: FILE_ASSET_MOCK_DATE,
    ownerId: 3,
    issuerId: 3,
    parentId: null,
    oaCertificateId: MOCK_OA_CERT_UUID_2,
    activities: [MOCK_ACTIVITY_UPLOAD_2, MOCK_ACTIVITY_SEND_TRANSFER_2],
  }),
  createMockFileAsset({
    id: 5004,
    uuid: 'fileAsset-uuid-5004',
    name: 'file-1.oa',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.OA,
    type: FILE_ASSET_TYPE.UPLOADED,
    size: 1234,
    status: FILE_STATUS.ACTIVE,
    failCategory: null,
    failReason: null,
    metadata: {},
    expireAt: FILE_ASSET_MOCK_DATE,
    ownerId: 4,
    issuerId: 3,
    parentId: null,
    oaCertificateId: MOCK_OA_CERT_UUID_2,
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_2],
  }),
  createMockFileAsset({
    id: 5005,
    uuid: 'fileAsset-uuid-5005',
    name: 'file-1.oa',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.OA,
    type: FILE_ASSET_TYPE.UPLOADED,
    size: 1234,
    status: FILE_STATUS.ACTIVE,
    failCategory: null,
    failReason: null,
    metadata: {},
    expireAt: FILE_ASSET_MOCK_DATE,
    ownerId: 5,
    issuerId: 3,
    parentId: null,
    oaCertificateId: MOCK_OA_CERT_UUID_2,
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_3],
  }),
];
