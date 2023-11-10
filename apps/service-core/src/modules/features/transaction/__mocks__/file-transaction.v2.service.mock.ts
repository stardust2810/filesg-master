import {
  ACTIVITY_TYPE,
  AgencyFileUpload,
  CreateApplicationRequest,
  CreateFileTransactionV2Request,
  CreateRecipientV2Request,
  CreateTransactionV2Request,
  FileUploadTransactionInfo,
  MessageTemplate,
  NOTIFICATION_CHANNEL,
  NotificationMessage,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { EntityManager } from 'typeorm';

import { Activity } from '../../../../entities/activity';
import { EserviceWhitelistedUser } from '../../../../entities/eservice-whitelisted-user';
import { Transaction } from '../../../../entities/transaction';
import { ProgrammaticUser, User } from '../../../../entities/user';
import { PartialNotificationMessageInputCreation } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { TxnCreationFileAssetInsert } from '../file-transaction.service';
import { FileTransactionV2Service } from '../file-transaction.v2.service';
import { mockAcknowledgementTemplateUuid, mockCitizenUser } from './file-transaction.service.mock';

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
  ): Promise<PartialNotificationMessageInputCreation[]> {
    return super.verifyNotificationChannelAndTemplateAndSave(notificationMessages, agencyId, applicationId, recipients);
  }

  public validateAndCompareArrays<T>(
    requiredFields: T[] | undefined,
    fieldsProvidedDuringTransaction: T[] | undefined,
    templateUuid: string,
  ): void {
    return super.validateAndCompareArrays(requiredFields, fieldsProvidedDuringTransaction, templateUuid);
  }
}

export const mockFileTransactionV2Service: MockService<FileTransactionV2Service> = {
  createFileTransaction: jest.fn(),
  validateRecipientEmails: jest.fn(),
};

// =============================================================================
// createFileTransaction
// =============================================================================
// Arguments
export const mockCreateFileTransactionV2Request: CreateFileTransactionV2Request = {
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
        name: mockCitizenUser.name!,
        contact: '+6581234567',
        email: 'user1@gmail.com',
        uin: mockCitizenUser.uin,
        dob: '1995-01-01',
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
