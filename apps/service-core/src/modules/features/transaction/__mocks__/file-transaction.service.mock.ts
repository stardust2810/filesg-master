import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  AgencyFileUpload,
  CreateApplicationRequest,
  CreateFileTransactionRecipientResponse,
  CreateFileTransactionRequest,
  CreateRecipientRequest,
  CreateTransactionRequest,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  FileInfo,
  FileUploadTransactionInfo,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { EntityManager, InsertResult } from 'typeorm';

import { Activity } from '../../../../entities/activity';
import { Transaction } from '../../../../entities/transaction';
import { ProgrammaticUser, User } from '../../../../entities/user';
import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockAcknowledgementTemplate } from '../../../entities/acknowledgement-template/__mocks__/acknowledgement-template.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { ActivityFileInsert } from '../../../entities/activity/activity.entity.repository';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockApplicationType } from '../../../entities/application-type/__mocks__/application-type.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockCitizenUser, createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { FileTransactionService, TxnCreationFileAssetInsert } from '../file-transaction.service';

// =============================================================================
// Test Service
// =============================================================================
export class TestFileTransactionService extends FileTransactionService {
  public async uploadTransferHandler(transactionReq: CreateFileTransactionRequest, user: User, acknowledgementTemplateId?: number) {
    return super.uploadTransferHandler(transactionReq, user, acknowledgementTemplateId);
  }

  public async validateRecipientEmails(recipients: CreateRecipientRequest[]) {
    return super.validateRecipientEmails(recipients);
  }

  public async createTransactionByRequest(
    createTransactionRequest: CreateTransactionRequest,
    createApplicationRequest: CreateApplicationRequest,
    user: User,
    entityManager?: EntityManager,
  ) {
    return super.createTransactionByRequest(createTransactionRequest, createApplicationRequest, user, entityManager);
  }

  public async saveActivityForTxnCreation(
    type: ACTIVITY_TYPE,
    transaction: Transaction,
    user: User,
    parent?: Activity,
    isAcknowledgementRequired?: boolean,
    entityManager?: EntityManager,
  ) {
    return super.saveActivityForTxnCreation(type, transaction, user, parent, isAcknowledgementRequired, entityManager);
  }

  public async insertFileAssetsForTxnCreation(inserts: TxnCreationFileAssetInsert[], entityManager?: EntityManager) {
    return super.insertFileAssetsForTxnCreation(inserts, entityManager);
  }

  public async getOrCreateUser(recipients: CreateRecipientRequest[], entityManager?: EntityManager) {
    return super.getOrCreateUser(recipients, entityManager);
  }

  public async createReceiveTransferActivitiesAndFilesForUsers(
    existingUsers: { [key: number]: CreateRecipientRequest },
    transaction: Transaction,
    parentActivity: Activity,
    files: AgencyFileUpload[],
    fileAssetIssuerId: number,
    sendTransferFileAssetIds: number[],
    isAcknowledgementRequired?: boolean,
    acknowledgementTemplateId?: number,
    entityManager?: EntityManager,
  ) {
    return super.createReceiveTransferActivitiesAndFilesForUsers(
      existingUsers,
      transaction,
      parentActivity,
      files,
      fileAssetIssuerId,
      sendTransferFileAssetIds,
      isAcknowledgementRequired,
      acknowledgementTemplateId,
      entityManager,
    );
  }

  public async generateFileUploadJwt(transactionUuid: string) {
    return super.generateFileUploadJwt(transactionUuid);
  }

  public generateFileUploadInfo(programmaticUser: ProgrammaticUser, transactionInfo: FileUploadTransactionInfo) {
    return super.generateFileUploadInfo(programmaticUser, transactionInfo);
  }

  public validateNoDuplicateFileNames(files: AgencyFileUpload[]) {
    return super.validateNoDuplicateFileNames(files);
  }
}

export const mockFileTransactionService: MockService<FileTransactionService> = {
  createFileTransaction: jest.fn(),
};
// =============================================================================
// Base Mocks
// =============================================================================
export const mockAgency = createMockAgency({
  uuid: 'agency-uuid-1',
  name: 'GovTech',
  code: 'GOVT',
});

export const mockEservice = createMockEservice({
  id: 1,
  uuid: 'eservice-uuid-1',
  name: 'FileSG',
  emails: ['filesg@gmail.com'],
  agency: mockAgency,
});

export const mockProgrammaticUser = createMockProgrammaticUser({
  id: 1,
  status: STATUS.ACTIVE,
  clientId: 'client-uuid-1',
  clientSecret: 'secret',
  eservices: [mockEservice],
});

export const mockAcknowledgementTemplateUuid = 'mockAcknowledgementTemplate-uuid-1';
export const mockAcknowledgementTemplate = createMockAcknowledgementTemplate({
  id: 1,
  uuid: mockAcknowledgementTemplateUuid,
  name: 'LTVP Acknowledgement Template',
  content: {
    content: [
      {
        content: ['Some LTVP content'],
      },
    ],
  },
  eserviceId: mockEservice.id,
});

export const mockEncryptedAgencyPassword = 'mockEncryptedAgencyPassword';
export const uploadedFileAssetUuid = 'fileAsset-uuid-1';

export const mockCitizenUser = createMockCitizenUser({
  id: 2,
  name: 'mockName',
  uin: 'S3002610A',
  status: STATUS.ACTIVE,
});

export const mockReceiveTransferActivity = createMockActivity({
  id: 3,
  uuid: 'activity-uuid-3',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.INIT,
});

export const mockTransaction = createMockTransaction({
  id: 1,
  uuid: 'transaction-uuid-1',
  name: 'LTVP Application',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  status: TRANSACTION_STATUS.INIT,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockFileSessionId = 'fileSession-id-1';

// =============================================================================
// createFileTransaction
// =============================================================================
// Arguments
export const mockCreateFileTransactionRequest: CreateFileTransactionRequest = {
  files: [
    {
      name: 'LTVP.oa',
      checksum: '11c0fbbdc104bc2d70448c8f3222887902c0b85bb3fbfe18af32d0cef4ad7b24',
      expiry: '2026-08-08',
      isPasswordEncryptionRequired: true,
      agencyPassword: { 'path/file.jpg': 'password' },
    },
  ],
  application: {
    type: 'LTVP',
    externalRefId: 'externalRef-uuid-1',
  },
  transaction: {
    type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
    name: 'LTVP application',
    isAcknowledgementRequired: true,
    acknowledgementTemplateUuid: mockAcknowledgementTemplateUuid,
    customAgencyMessage: {
      transaction: ['transaction message'],
      email: ['email message'],
    },
    recipients: [
      {
        name: mockCitizenUser.name!,
        contact: '+6581234567',
        email: 'user1@gmail.com',
        uin: mockCitizenUser.uin,
        dob: '1995-01-01',
      },
    ],
  },
};

/**
 * Handler return mocks
 */
// uploadTransferHandler
export const mockTransactionInfo: FileUploadTransactionInfo = {
  files: [
    {
      checksum: mockCreateFileTransactionRequest.files[0].checksum,
      fileAssetId: uploadedFileAssetUuid,
      isPasswordEncryptionRequired: true,
      encryptedAgencyPassword: mockEncryptedAgencyPassword,
      name: mockCreateFileTransactionRequest.files[0].name,
    },
  ],
  recipients: [{ uin: mockCitizenUser.uin!, activityUuid: mockReceiveTransferActivity.uuid }],
  transactionUuid: mockTransaction.uuid,
};

// generateFileUploadJwt
export const mockFileUploadJwt = 'mockFileUploadJwt';

// generateFileUploadInfo
export const mockFileUploadInfo: ReturnType<FileTransactionService['generateFileUploadInfo']> = {
  userUuid: mockProgrammaticUser.uuid,
  agencyInfo: { name: mockAgency.name, code: mockAgency.code, identityProofLocation: 'mockProofLocation', sk: 'mockKey' },
  transactionInfo: mockTransactionInfo,
};

// Alternate flow mocks
export const requestNotUploadTransferTxn: CreateFileTransactionRequest = {
  ...mockCreateFileTransactionRequest,
  transaction: {
    ...mockCreateFileTransactionRequest.transaction,
    type: TRANSACTION_TYPE.UPLOAD,
  },
};

const {
  files,
  transaction: { recipients },
} = mockCreateFileTransactionRequest;

export const mockInsertReceiveTransferActivitiesResults: InsertResult = {
  identifiers: [{ id: 3 }],
  generatedMaps: [],
  raw: {},
};

// =============================================================================
// uploadTransferHandler
// =============================================================================

export const mockUploadActivity = createMockActivity({
  id: 1,
  uuid: 'activity-uuid-1',
  type: ACTIVITY_TYPE.UPLOAD,
  status: ACTIVITY_STATUS.INIT,
});

export const mockSendTransferActivity = createMockActivity({
  id: 2,
  uuid: 'activity-uuid-2',
  type: ACTIVITY_TYPE.SEND_TRANSFER,
  status: ACTIVITY_STATUS.INIT,
});

// Build file asset mock
export const mockUploadedFileAsset = createMockFileAsset({
  uuid: 'fileAsset-uuid-1',
  name: mockCreateFileTransactionRequest.files[0].name,
  status: FILE_STATUS.INIT,
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.UNKNOWN,
  size: 1,
});

export const mockTransferredFileAsset = createMockFileAsset({
  uuid: 'fileAsset-uuid-2',
  name: mockCreateFileTransactionRequest.files[0].name,
  status: FILE_STATUS.INIT,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.UNKNOWN,
  size: 1,
});

export const mockUploadAndSendTransferFileAssetHistoryUuids = ['fileAssetHistory-uuid-1'];

export const mockReceiveTransferFileAssetHistoryUuids = ['fileAssetHistory-uuid-2'];

export const mockInsertUploadedFileAssetsResult: InsertResult = {
  identifiers: [{ id: 1 }],
  generatedMaps: [],
  raw: {},
};

export const mockInsertTransferredFileAssetsResult: InsertResult = {
  identifiers: [{ id: 2 }],
  generatedMaps: [],
  raw: {},
};

export const mockUploadedTxnCreationFileAssetInsert: TxnCreationFileAssetInsert[] = mockCreateFileTransactionRequest.files.map(
  (file): TxnCreationFileAssetInsert => ({
    fileInfo: file,
    ownerId: mockProgrammaticUser.id,
    issuerId: mockProgrammaticUser.id,
    type: FILE_ASSET_TYPE.UPLOADED,
  }),
);

/**
 * Handler return mocks
 */
// insertFileAssetsForTxnCreation
export const mockUploadedFileAssetsForTxnCreationInsertResults: { result: InsertResult; uuids: string[] } = {
  result: {
    identifiers: [{ id: 1 }],
    generatedMaps: [],
    raw: {},
  },
  uuids: [mockUploadedFileAsset.uuid],
};

// createReceiveTransferActivitiesAndFilesForUsers
export const mockFileAssetModels: TxnCreationFileAssetInsert[] = mockCreateFileTransactionRequest.files.map(
  (file): TxnCreationFileAssetInsert => ({
    fileInfo: file,
    ownerId: mockCitizenUser.id,
    ownerMetadata: mockCreateFileTransactionRequest.transaction.recipients[0].metadata && {},
    issuerId: mockProgrammaticUser.id,
    parentId: mockSendTransferActivity.id,
    type: FILE_ASSET_TYPE.UPLOADED,
  }),
);

export const mockTransferredFileAssetsForTxnCreationInsertResults: { result: InsertResult; uuids: string[] } = {
  result: {
    identifiers: [{ id: 2 }],
    generatedMaps: [],
    raw: {},
  },
  uuids: [mockTransferredFileAsset.uuid],
};

export const mockUploadAndSendTransferFileAssetIds = mockUploadedFileAssetsForTxnCreationInsertResults.result.identifiers.map(
  (identifier) => identifier.id,
);

export const mockReceiveTransferFileAssetIds = mockTransferredFileAssetsForTxnCreationInsertResults.result.identifiers.map(
  (identifier) => identifier.id,
);

export const mockUploadedFileAssetHistoriesCreationModel = mockUploadAndSendTransferFileAssetIds.map((id) => ({
  uuid: mockUploadAndSendTransferFileAssetHistoryUuids[0],
  type: FILE_ASSET_ACTION.ISSUED,
  actionById: mockProgrammaticUser.id,
  actionToId: mockProgrammaticUser.id,
  fileAssetId: id,
}));

export const mockTransferredFileAssetHistoriesCreationModel = mockReceiveTransferFileAssetIds.map((id) => ({
  uuid: mockReceiveTransferFileAssetHistoryUuids[0],
  type: FILE_ASSET_ACTION.ISSUED,
  actionById: mockProgrammaticUser.id,
  actionToId: mockCitizenUser.id,
  fileAssetId: id,
}));

// =============================================================================
// validateRecipientEmails
// =============================================================================
export const mockRecentBlackListedEmail = {
  emailAddress: 'bounce@simulator.amazonses.com',
  createdAt: new Date(),
};

export const mockOldBlackListedEmail = {
  emailAddress: 'bounce-old@simulator.amazonses.com',
  createdAt: new Date('01-01-2020'),
};

// =============================================================================
// createTransactionByRequest
// =============================================================================
export const mockApplicationType = createMockApplicationType({
  id: 1,
  uuid: 'applicationType-uuid-1',
  name: 'Long Term Visit Pass',
  code: 'LTVP',
});

export const mockApplication = createMockApplication({
  id: 1,
  uuid: 'application-uuid-1',
  applicationType: mockApplicationType,
  eservice: mockProgrammaticUser.eservices![0],
});

// =============================================================================
// saveActivtyForTxnCreation
// =============================================================================

// =============================================================================
// insertFileAssetsForTxnCreation
// =============================================================================

export const mockInsertFileAssetsForTxnCreationFileAsset = createMockFileAsset({
  uuid: 'fileAsset-uuid-1',
  name: 'mockName',
  status: FILE_STATUS.INIT,
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.UNKNOWN,
  size: 1,
});

export const mockInsertFileAssetsForTxnCreationInsertFileAssetsResult: InsertResult = {
  identifiers: [{ id: 1 }],
  generatedMaps: [],
  raw: {},
};

export const mockInsertFileAssetsForTxnCreationTxnCreationFileAssetInsert: TxnCreationFileAssetInsert[] = [
  {
    fileInfo: {
      name: 'mockName',
      checksum: 'mockChecksum',
    },
    ownerId: mockProgrammaticUser.id,
    issuerId: mockProgrammaticUser.id,
    type: FILE_ASSET_TYPE.UPLOADED,
  },
];

// Return value

export const mockFileInfos: FileInfo[] = [
  {
    name: files[0].name,
    checksum: files[0].checksum,
    fileAssetId: mockUploadedFileAsset.uuid,
    isPasswordEncryptionRequired: files[0].isPasswordEncryptionRequired,
    ...(files[0].agencyPassword && {
      encryptedAgencyPassword: mockEncryptedAgencyPassword,
    }),
  },
];

// =============================================================================
// getOrCreateUser
// =============================================================================
export const mockExistingUsers: { [key: number]: CreateRecipientRequest } = {
  [mockCitizenUser.id]: recipients[0],
};

export const mockInsertCitizenUsersResult: InsertResult = {
  identifiers: [{ id: mockCitizenUser.id }],
  generatedMaps: [],
  raw: {},
};

// =============================================================================
// createReceiveTransferActivitiesAndFilesForUsers
// =============================================================================
export const mockTransferredTxnCreationFileAssetInsert: TxnCreationFileAssetInsert[] = mockCreateFileTransactionRequest.files.map(
  (file): TxnCreationFileAssetInsert => ({
    fileInfo: file,
    ownerId: mockCitizenUser.id,
    issuerId: mockProgrammaticUser.id,
    type: FILE_ASSET_TYPE.TRANSFERRED,
    ownerMetadata: {},
    parentId: 1,
  }),
);

// Build activity mock
export const receiveTransferActivityFileInserts: ActivityFileInsert[] = [
  {
    activityId: mockReceiveTransferActivity.id,
    fileAssetId: mockReceiveTransferFileAssetIds[0],
  },
];

export const mockCreateFileTransactionRecipientResponse: CreateFileTransactionRecipientResponse[] = [
  { uin: mockExistingUsers[mockCitizenUser.id].uin, activityUuid: mockReceiveTransferActivity.uuid },
];

// =============================================================================
// generateFileUploadInfo
// =============================================================================
//Return value

// =============================================================================
// generateFileUploadJwt
// =============================================================================
//Return value

export const mockInsertOwnerFileAssetsForTxnCreationResults: { result: InsertResult; uuids: string[] } = {
  result: mockInsertUploadedFileAssetsResult,
  uuids: ['fileAsset-uuid-1'],
};

export const mockInsertRecipientFileAssetsForTxnCreationResults: { result: InsertResult; uuids: string[] } = {
  result: mockInsertTransferredFileAssetsResult,
  uuids: ['fileAsset-uuid-2'],
};

export const mockUploadAndSendTransferActivityFileInserts: ActivityFileInsert[] = [
  {
    activityId: mockUploadActivity.id,
    fileAssetId: mockInsertUploadedFileAssetsResult.identifiers[0].id,
  },
  { activityId: mockSendTransferActivity.id, fileAssetId: mockInsertUploadedFileAssetsResult.identifiers[0].id },
];
