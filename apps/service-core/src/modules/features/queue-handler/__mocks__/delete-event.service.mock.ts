import { FilesToDeleteMessageInfo } from '@filesg/backend-common';
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
import { DeleteEventService } from '../events/delete-event.service';

export const mockDeleteEventService: MockService<DeleteEventService> = {
  fileDeleteSuccessHandler: jest.fn(),
  fileDeleteFailureHandler: jest.fn(),
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
export const MOCK_TRANSACTION_WITH_OA_ONLY = createMockTransaction({
  id: 3001,
  uuid: 'transaction-uuid-3001',
  fileSessionId: null,
  name: 'transaction 3001',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  customAgencyMessage: null,
  userId: 3,
  applicationId: 2001,
  application: MOCK_APPLICATION_1,
});

export const MOCK_TRANSACTION_WITH_PDF_ONLY = createMockTransaction({
  id: 3002,
  uuid: 'transaction-uuid-3002',
  fileSessionId: null,
  name: 'transaction 3002',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  customAgencyMessage: null,
  userId: 3,
  applicationId: 2001,
  application: MOCK_APPLICATION_1,
});

export const MOCK_TRANSACTION_WITH_OA_PDF = createMockTransaction({
  id: 3003,
  uuid: 'transaction-uuid-3003',
  fileSessionId: null,
  name: 'transaction 3003',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  customAgencyMessage: null,
  userId: 3,
  applicationId: 2001,
  application: MOCK_APPLICATION_1,
});

// =============================================================================
// Activities
// =============================================================================
export const MOCK_ACTIVITY_UPLOAD_WITH_OA_ONLY = createMockActivity({
  id: 4001,
  uuid: 'activity-uuid-4001',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_OA_ONLY.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_OA_ONLY,
});

export const MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY = createMockActivity({
  id: 4002,
  uuid: 'activity-uuid-4002',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_OA_ONLY.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_OA_ONLY,
});

export const MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY = createMockActivity({
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
  transactionId: MOCK_TRANSACTION_WITH_OA_ONLY.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_OA_ONLY,
});

const MOCK_ACTIVITY_UPLOAD_WITH_PDF_ONLY = createMockActivity({
  id: 4004,
  uuid: 'activity-uuid-4004',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_PDF_ONLY.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_PDF_ONLY,
});

export const MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY = createMockActivity({
  id: 4005,
  uuid: 'activity-uuid-4005',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_PDF_ONLY.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_PDF_ONLY,
});

export const MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY = createMockActivity({
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
  transactionId: MOCK_TRANSACTION_WITH_PDF_ONLY.id,
  userId: 4,
  transaction: MOCK_TRANSACTION_WITH_PDF_ONLY,
});

const MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY_2 = createMockActivity({
  id: 4007,
  uuid: 'activity-uuid-4007',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: {
    name: 'John Desu',
    dob: '1980-10-01',
    mobile: '+659876533',
    email: 'myemail3@myemail.com',
    failedAttempts: 0,
  },
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_PDF_ONLY.id,
  userId: 5,
  transaction: MOCK_TRANSACTION_WITH_PDF_ONLY,
});

const MOCK_ACTIVITY_UPLOAD_WITH_OA_AND_PDF = createMockActivity({
  id: 4008,
  uuid: 'activity-uuid-4008',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_OA_PDF.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_OA_PDF,
});

export const MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF = createMockActivity({
  id: 4009,
  uuid: 'activity-uuid-4009',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  recipientInfo: null,
  isBannedFromNonSingpassVerification: false,
  parentId: null,
  transactionId: MOCK_TRANSACTION_WITH_OA_PDF.id,
  userId: 3,
  transaction: MOCK_TRANSACTION_WITH_OA_PDF,
});

export const MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF = createMockActivity({
  id: 4010,
  uuid: 'activity-uuid-4010',
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
  transactionId: MOCK_TRANSACTION_WITH_OA_PDF.id,
  userId: 4,
  transaction: MOCK_TRANSACTION_WITH_OA_PDF,
});

// =============================================================================
// Test Data
// =============================================================================
export const OA_AND_PDF_FILE_ASSETS: FileAsset[] = [
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
    activities: [MOCK_ACTIVITY_UPLOAD_WITH_OA_AND_PDF, MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF],
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
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF],
  }),
  createMockFileAsset({
    id: 5003,
    uuid: 'fileAsset-uuid-5003',
    name: 'file-1.pdf',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.PDF,
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
    oaCertificateId: null,
    activities: [MOCK_ACTIVITY_UPLOAD_WITH_OA_AND_PDF, MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF],
  }),
  createMockFileAsset({
    id: 5004,
    uuid: 'fileAsset-uuid-5004',
    name: 'file-1.pdf',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.PDF,
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
    oaCertificateId: null,
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF],
  }),
];

export const ONLY_OA_FILE_ASSETS: FileAsset[] = [
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
    activities: [MOCK_ACTIVITY_UPLOAD_WITH_OA_ONLY, MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY],
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
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY],
  }),
];

export const ONLY_PDF_FILE_ASSETS: FileAsset[] = [
  createMockFileAsset({
    id: 5005,
    uuid: 'fileAsset-uuid-5005',
    name: 'file-1.pdf',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.PDF,
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
    oaCertificateId: null,
    activities: [MOCK_ACTIVITY_UPLOAD_WITH_PDF_ONLY, MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY],
  }),
  createMockFileAsset({
    id: 5006,
    uuid: 'fileAsset-uuid-5006',
    name: 'file-1.pdf',
    documentHash: 'XXXXX',
    documentType: FILE_TYPE.PDF,
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
    oaCertificateId: null,
    activities: [MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY_2],
  }),
];

const MOCK_DELETE_MESSAGE_SEND_TRANSFER_ACTIVITY_WITH_OA_ONLY: FilesToDeleteMessageInfo = {
  transactionId: MOCK_TRANSACTION_WITH_OA_ONLY.id,
  transactionType: MOCK_TRANSACTION_WITH_OA_ONLY.type,
  activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id,
  activityType: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.type,
  issuerId: ONLY_OA_FILE_ASSETS[0].issuerId,
  ownerId: ONLY_OA_FILE_ASSETS[0].ownerId,
  files: [
    {
      fileAssetId: ONLY_OA_FILE_ASSETS[0].id,
      oaCertId: ONLY_OA_FILE_ASSETS[0].oaCertificateId,
    },
  ],
};

const MOCK_DELETE_MESSAGE_RECEIVE_TRANSFER_ACTIVITY_WITH_OA_ONLY: FilesToDeleteMessageInfo = {
  transactionId: MOCK_TRANSACTION_WITH_OA_ONLY.id,
  transactionType: MOCK_TRANSACTION_WITH_OA_ONLY.type,
  activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id,
  activityType: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.type,
  issuerId: ONLY_OA_FILE_ASSETS[1].issuerId,
  ownerId: ONLY_OA_FILE_ASSETS[1].ownerId,
  files: [
    {
      fileAssetId: ONLY_OA_FILE_ASSETS[1].id,
      oaCertId: ONLY_OA_FILE_ASSETS[1].oaCertificateId,
    },
  ],
};

const MOCK_DELETE_MESSAGE_SEND_TRANSFER_ACTIVITY_WITH_PDF_ONLY: FilesToDeleteMessageInfo = {
  transactionId: MOCK_TRANSACTION_WITH_PDF_ONLY.id,
  transactionType: MOCK_TRANSACTION_WITH_PDF_ONLY.type,
  activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY.id,
  activityType: MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY.type,
  issuerId: ONLY_PDF_FILE_ASSETS[0].issuerId,
  ownerId: ONLY_PDF_FILE_ASSETS[0].ownerId,
  files: [
    {
      fileAssetId: ONLY_PDF_FILE_ASSETS[0].id,
      oaCertId: ONLY_PDF_FILE_ASSETS[0].oaCertificateId,
    },
  ],
};

const MOCK_DELETE_MESSAGE_RECEIVE_TRANSFER_ACTIVITY_WITH_PDF_ONLY: FilesToDeleteMessageInfo = {
  transactionId: MOCK_TRANSACTION_WITH_PDF_ONLY.id,
  transactionType: MOCK_TRANSACTION_WITH_PDF_ONLY.type,
  activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY.id,
  activityType: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY.type,
  issuerId: ONLY_PDF_FILE_ASSETS[1].issuerId,
  ownerId: ONLY_PDF_FILE_ASSETS[1].ownerId,
  files: [
    {
      fileAssetId: ONLY_PDF_FILE_ASSETS[1].id,
      oaCertId: ONLY_PDF_FILE_ASSETS[1].oaCertificateId,
    },
  ],
};

const MOCK_DELETE_MESSAGE_SEND_TRANSFER_ACTIVITY_WITH_OA_AND_PDF: FilesToDeleteMessageInfo = {
  transactionId: MOCK_TRANSACTION_WITH_OA_PDF.id,
  transactionType: MOCK_TRANSACTION_WITH_OA_PDF.type,
  activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF.id,
  activityType: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF.type,
  issuerId: OA_AND_PDF_FILE_ASSETS[0].issuerId,
  ownerId: OA_AND_PDF_FILE_ASSETS[0].ownerId,
  files: [
    {
      fileAssetId: OA_AND_PDF_FILE_ASSETS[0].id,
      oaCertId: OA_AND_PDF_FILE_ASSETS[0].oaCertificateId,
    },
    {
      fileAssetId: OA_AND_PDF_FILE_ASSETS[2].id,
      oaCertId: OA_AND_PDF_FILE_ASSETS[2].oaCertificateId,
    },
  ],
};

const MOCK_DELETE_MESSAGE_RECEIVE_TRANSFER_ACTIVITY_WITH_OA_AND_PDF: FilesToDeleteMessageInfo = {
  transactionId: MOCK_TRANSACTION_WITH_OA_PDF.id,
  transactionType: MOCK_TRANSACTION_WITH_OA_PDF.type,
  activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF.id,
  activityType: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF.type,
  issuerId: OA_AND_PDF_FILE_ASSETS[1].issuerId,
  ownerId: OA_AND_PDF_FILE_ASSETS[1].ownerId,
  files: [
    {
      fileAssetId: OA_AND_PDF_FILE_ASSETS[1].id,
      oaCertId: OA_AND_PDF_FILE_ASSETS[1].oaCertificateId,
    },
    {
      fileAssetId: OA_AND_PDF_FILE_ASSETS[3].id,
      oaCertId: OA_AND_PDF_FILE_ASSETS[3].oaCertificateId,
    },
  ],
};

export const MOCK_OA_ONLY_ACTIVIES_DELETE_MESSAGES = [
  MOCK_DELETE_MESSAGE_SEND_TRANSFER_ACTIVITY_WITH_OA_ONLY,
  MOCK_DELETE_MESSAGE_RECEIVE_TRANSFER_ACTIVITY_WITH_OA_ONLY,
];

export const MOCK_PDF_ONLY_ACTIVIES_DELETE_MESSAGES = [
  MOCK_DELETE_MESSAGE_SEND_TRANSFER_ACTIVITY_WITH_PDF_ONLY,
  MOCK_DELETE_MESSAGE_RECEIVE_TRANSFER_ACTIVITY_WITH_PDF_ONLY,
];

export const MOCK_OA_AND_PDF_ACTIVIES_DELETE_MESSAGES = [
  MOCK_DELETE_MESSAGE_SEND_TRANSFER_ACTIVITY_WITH_OA_AND_PDF,
  MOCK_DELETE_MESSAGE_RECEIVE_TRANSFER_ACTIVITY_WITH_OA_AND_PDF,
];
