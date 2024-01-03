import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  AgencyFileUpload,
  CreateApplicationRequest,
  CreateFileTransactionRecipientResponse,
  CreateFileTransactionV2Request,
  CreateRecipientV2Request,
  CreateTransactionV2Request,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  FileUploadTransactionInfo,
  MessageTemplate,
  NOTIFICATION_CHANNEL,
  NotificationMessage,
  RECIPIENT_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { EntityManager, InsertResult } from 'typeorm';

import { Activity } from '../../../../entities/activity';
import { EserviceWhitelistedUser } from '../../../../entities/eservice-whitelisted-user';
import { Transaction } from '../../../../entities/transaction';
import { ProgrammaticUser, User } from '../../../../entities/user';
import { FILE_ASSET_TYPE, PartialNotificationMessageInputCreation } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { ActivityFileInsert } from '../../../entities/activity/activity.entity.repository';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import {
  createMockCitizenUser,
  createMockCorporate,
  createMockCorporateBaseUser,
  createMockProgrammaticUser,
} from '../../../entities/user/__mocks__/user.mock';
import { TxnCreationFileAssetInsert } from '../file-transaction.service';
import { FileTransactionV2Service } from '../file-transaction.v2.service';
import { mockAcknowledgementTemplateUuid, uploadedFileAssetUuid } from './file-transaction.service.mock';

// =============================================================================
// Test Service
// =============================================================================
export class TestFileTransactionV2Service extends FileTransactionV2Service {
  public async uploadTransferHandler(
    transactionReq: CreateFileTransactionV2Request,
    user: User,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
    acknowledgementTemplateId?: number,
    isCorporateRecipients?: boolean,
  ) {
    return super.uploadTransferHandler(transactionReq, user, eserviceWhitelistedUser, acknowledgementTemplateId, isCorporateRecipients);
  }

  public async validateRecipientEmails(emails: string[]) {
    return super.validateRecipientEmails(emails);
  }

  public async createTransactionByRequest(
    createTransactionRequest: CreateTransactionV2Request,
    createApplicationRequest: CreateApplicationRequest,
    user: User,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
    isCorporateRecipients?: boolean,
    entityManager?: EntityManager,
  ) {
    return super.createTransactionByRequest(
      createTransactionRequest,
      createApplicationRequest,
      user,
      eserviceWhitelistedUser,
      isCorporateRecipients,
      entityManager,
    );
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

  public async getOrCreateUser(recipients: CreateRecipientV2Request[], entityManager?: EntityManager) {
    return super.getOrCreateUser(recipients, entityManager);
  }

  public async getOrCreateCorporateUser(recipients: CreateRecipientV2Request[], entityManager?: EntityManager) {
    return super.getOrCreateCorporateUser(recipients, entityManager);
  }

  public async createReceiveTransferActivitiesAndFilesForUsers(
    existingUsers: { [key: number]: CreateRecipientV2Request },
    transaction: Transaction,
    parentActivity: Activity,
    files: AgencyFileUpload[],
    fileAssetIssuerId: number,
    sendTransferFileAssetIds: number[],
    isAcknowledgementRequired?: boolean,
    acknowledgementTemplateId?: number,
    isCorporateRecipients?: boolean,
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
      isCorporateRecipients,
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

  public async verifyAndGenerateCustomMessage(messageTemplate: MessageTemplate, applicationTypeId: number): Promise<string[]> {
    return super.verifyAndGenerateCustomMessage(messageTemplate, applicationTypeId);
  }

  public async verifyNotificationChannelAndTemplateAndSave(
    notificationMessages: NotificationMessage[],
    agencyId: number,
    applicationId: number,
    recipients: CreateRecipientV2Request[],
    isCorporateRecipients?: boolean,
  ): Promise<PartialNotificationMessageInputCreation[]> {
    return super.verifyNotificationChannelAndTemplateAndSave(
      notificationMessages,
      agencyId,
      applicationId,
      recipients,
      isCorporateRecipients,
    );
  }

  public validateAndCompareArrays<T>(
    requiredFields: T[] | undefined,
    fieldsProvidedDuringTransaction: T[] | undefined,
    templateUuid: string,
  ): void {
    return super.validateAndCompareArrays(requiredFields, fieldsProvidedDuringTransaction, templateUuid);
  }

  public validateIfMixedRecipients(requestRecipients: CreateRecipientV2Request[]) {
    return super.validateIfMixedRecipients(requestRecipients);
  }

  public validateIfRecipientsHaveDuplicateIdentifier(recipients: CreateRecipientV2Request[], isCorporateRecipients?: boolean) {
    return super.validateIfRecipientsHaveDuplicateIdentifier(recipients, isCorporateRecipients);
  }
}

export const mockFileTransactionV2Service: MockService<FileTransactionV2Service> = {
  createFileTransaction: jest.fn(),
  validateRecipientEmails: jest.fn(),
};

// =============================================================================
// Base entities
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

export const mockCitizenUser1 = createMockCitizenUser({
  id: 2,
  name: 'mockCitizenUserName1',
  uin: 'S3002610A',
  status: STATUS.ACTIVE,
});

export const mockCitizenUser2 = createMockCitizenUser({
  id: 3,
  name: 'mockCitizenUserName2',
  uin: 'S3002608Z',
  status: STATUS.ACTIVE,
});

export const mockReceiveTransferActivity1 = createMockActivity({
  id: 3,
  uuid: 'activity-uuid-3',
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.INIT,
});

export const mockReceiveTransferActivity2 = createMockActivity({
  id: 4,
  uuid: 'activity-uuid-4',
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

const mockAgencyFileUpload: AgencyFileUpload = {
  name: 'LTVP.oa',
  checksum: '11c0fbbdc104bc2d70448c8f3222887902c0b85bb3fbfe18af32d0cef4ad7b24',
  expiry: '2026-08-08',
  isPasswordEncryptionRequired: true,
  agencyPassword: { 'path/file.jpg': 'password' },
};

export const mockUploadedFileAsset = createMockFileAsset({
  uuid: 'fileAsset-uuid-1',
  name: mockAgencyFileUpload.name,
  status: FILE_STATUS.INIT,
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.UNKNOWN,
  size: 1,
});

export const mockTransferredFileAsset1 = createMockFileAsset({
  uuid: 'fileAsset-uuid-2',
  name: mockAgencyFileUpload.name,
  status: FILE_STATUS.INIT,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.UNKNOWN,
  size: 1,
});

export const mockTransferredFileAsset2 = createMockFileAsset({
  uuid: 'fileAsset-uuid-3',
  name: mockAgencyFileUpload.name,
  status: FILE_STATUS.INIT,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  documentType: FILE_TYPE.UNKNOWN,
  size: 1,
});

const mockEncryptedAgencyPassword = 'mockEncryptedAgencyPassword';

export const corporateRecipients: CreateRecipientV2Request[] = [
  {
    type: RECIPIENT_TYPE.CORPORATE,
    name: 'Corporate 1',
    uen: '200000177W',
  },
];

export const mockCorporateBaseUser = createMockCorporateBaseUser({ id: 1, uuid: 'corporate-user-uuid-1', status: STATUS.ACTIVE });
export const mockCorporate = createMockCorporate({ id: 1, uen: '200000177W', user: mockCorporateBaseUser, userId: 1 });

// =============================================================================
// createFileTransaction
// =============================================================================

// Arguments
export const mockCreateFileTransactionV2Request: CreateFileTransactionV2Request = {
  files: [mockAgencyFileUpload],
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
      transaction: {
        templateId: 'transactioncustommessagetemplate-1654395064012-u1v2w3x4y5z6a7b8',
      },
      notifications: [
        {
          channel: NOTIFICATION_CHANNEL.EMAIL,
          templateId: 'notificationmessagetemplate-1655110619636-03e9d4ac12637a54',
          templateInput: {
            variableOne: 'Hello World',
          },
        },
        {
          channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
          templateId: 'notificationmessagetemplate-1655110619636-03e9d4ac12637a55',
          templateInput: {
            variableOne: 'Hello World',
          },
        },
      ],
    },
    recipients: [
      {
        name: mockCitizenUser1.name!,
        contact: '+6581234567',
        email: 'user1@gmail.com',
        uin: mockCitizenUser1.uin,
        dob: '1995-01-01',
        isNonSingpassRetrievable: true,
      },
      {
        name: mockCitizenUser2.name!,
        contact: '+6587654321',
        email: 'user2@gmail.com',
        uin: mockCitizenUser2.uin,
        dob: '1995-01-02',
        isNonSingpassRetrievable: true,
        isCopy: true,
      },
    ],
  },
};

export const requestNotUploadTransferV2Txn: CreateFileTransactionV2Request = {
  ...mockCreateFileTransactionV2Request,
  transaction: {
    ...mockCreateFileTransactionV2Request.transaction,
    type: TRANSACTION_TYPE.UPLOAD,
  },
};

export const mockCustomTransactionMessageResponse: string[] = ['mockPara1'];

export const mockCustomTransactionMessage: MessageTemplate = {
  templateId: 'transactioncustommessagetemplate-1654395064012-u1v2w3x4y5z6a7b8',
  templateInput: {
    variableOne: 'test variable',
  },
};

const {
  transaction: { recipients },
} = mockCreateFileTransactionV2Request;

export const mockExistingUsers: { [key: number]: CreateRecipientV2Request } = {
  [mockCitizenUser1.id]: recipients[0],
  [mockCitizenUser2.id]: recipients[1],
};

export const mockTransactionInfo: FileUploadTransactionInfo = {
  files: [
    {
      checksum: mockCreateFileTransactionV2Request.files[0].checksum,
      fileAssetId: uploadedFileAssetUuid,
      isPasswordEncryptionRequired: true,
      encryptedAgencyPassword: mockEncryptedAgencyPassword,
      name: mockCreateFileTransactionV2Request.files[0].name,
    },
  ],
  recipients: [
    { uin: mockCitizenUser1.uin!, activityUuid: mockReceiveTransferActivity1.uuid, isNonSingpassRetrievable: true },
    { uin: mockCitizenUser2.uin!, activityUuid: mockReceiveTransferActivity2.uuid, isNonSingpassRetrievable: true },
  ],
  transactionUuid: mockTransaction.uuid,
};
// =============================================================================
// UploadFileHandler
// =============================================================================
export const mockInsertTransferredFileAssetsResult: InsertResult = {
  identifiers: [{ id: 2 }, { id: 3 }],
  generatedMaps: [],
  raw: {},
};

export const mockTransferredFileAssetsForTxnCreationInsertResults: { result: InsertResult; uuids: string[] } = {
  result: mockInsertTransferredFileAssetsResult,
  uuids: [mockTransferredFileAsset1.uuid, mockTransferredFileAsset2.uuid],
};

export const mockReceiveTransferFileAssetIds = mockTransferredFileAssetsForTxnCreationInsertResults.result.identifiers.map(
  (identifier) => identifier.id,
);

export const mockReceiveTransferFileAssetHistoryUuids = ['fileAssetHistory-uuid-2', 'fileAssetHistory-uuid-3'];

export const mockTransferredTxnCreationFileAssetInsert: TxnCreationFileAssetInsert[] = Object.entries(mockExistingUsers).reduce<
  TxnCreationFileAssetInsert[]
>((prev, [id, createRecipientRequest]) => {
  const userId = parseInt(id, 10);

  const recipientFileAssetInserts = mockCreateFileTransactionV2Request.files.map(
    (file): TxnCreationFileAssetInsert => ({
      fileInfo: file,
      ownerId: userId,
      ownerMetadata: createRecipientRequest.metadata ?? {},
      issuerId: mockProgrammaticUser.id,
      parentId: 1,
      type: FILE_ASSET_TYPE.TRANSFERRED,
    }),
  );

  prev.push(...recipientFileAssetInserts);
  return prev;
}, []);

export const mockTransferredFileAssetHistoriesCreationModel = mockReceiveTransferFileAssetIds.map((id, index) => ({
  uuid: mockReceiveTransferFileAssetHistoryUuids[index],
  type: FILE_ASSET_ACTION.ISSUED,
  actionById: mockProgrammaticUser.id,
  actionToId: mockTransferredTxnCreationFileAssetInsert[index].ownerId,
  fileAssetId: id,
}));

// =============================================================================
// createReceiveTransferActivitiesAndFilesForUsers
// =============================================================================
export const mockCreateFileTransactionRecipientResponse: CreateFileTransactionRecipientResponse[] = [
  { uin: mockExistingUsers[mockCitizenUser1.id].uin!, activityUuid: mockReceiveTransferActivity1.uuid, isNonSingpassRetrievable: true },
  { uin: mockExistingUsers[mockCitizenUser2.id].uin!, activityUuid: mockReceiveTransferActivity2.uuid, isNonSingpassRetrievable: true },
];

export const mockInsertReceiveTransferActivitiesResults: InsertResult = {
  identifiers: [{ id: 3 }, { id: 4 }],
  generatedMaps: [],
  raw: {},
};

export const receiveTransferActivityFileInserts: ActivityFileInsert[] = [
  {
    activityId: mockReceiveTransferActivity1.id,
    fileAssetId: mockReceiveTransferFileAssetIds[0],
  },
  {
    activityId: mockReceiveTransferActivity2.id,
    fileAssetId: mockReceiveTransferFileAssetIds[1],
  },
];
