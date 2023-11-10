import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_STATUS,
  NOTIFICATION_TEMPLATE_TYPE,
  OA_CERTIFICATE_STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockApplicationEntityService } from '../../../entities/application/__mocks__/application.entity.service.mock';
import { ApplicationEntityService } from '../../../entities/application/application.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.service.mock';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { mockOaCertificateEntityService } from '../../../entities/oa-certificate/__mocks__/oa-certificate.entity.service.mock';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockProgrammaticUserEntityService } from '../../../entities/user/__mocks__/programmatic-user.entity.service.mock';
import { ProgrammaticUserEntityService } from '../../../entities/user/programmatic-user.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { mockNotificationService } from '../../notification/__mocks__/notification.service.mock';
import { EmailService } from '../../notification/email.service';
import { NotificationService } from '../../notification/notification.service';
import {
  mockApplication,
  mockCitizenUser,
  mockEserviceFileAsset,
  mockIssuanceTransaction,
  mockProgrammaticUser,
  mockReceiveRevokeActivity,
  mockReceiveRevokeActivityFileInserts,
  mockReceiveTransferActivity,
  mockRevocationTransaction,
  mockRevokeEserviceFileAssetHistories,
  mockRevokeTransactionByFileAssetUuidsRequest,
  mockRevokeTransactionByTransactionUuidRequest,
  mockRevokeUserFileAssetHistories,
  mockSendRevokeActivity,
  mockSendRevokeActivityFileInserts,
  mockUserFileAsset,
} from '../__mocks__/revoke-transaction.mock';
import { RevokeTransactionService } from '../revoke-transaction.service';

describe('RevokeTransactionService', () => {
  let service: RevokeTransactionService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeTransactionService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: ProgrammaticUserEntityService, useValue: mockProgrammaticUserEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: ApplicationEntityService, useValue: mockApplicationEntityService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<RevokeTransactionService>(RevokeTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRevokeTransaction method', () => {
    beforeEach(() => {
      jest.clearAllMocks();

      // createRevokeTransaction
      mockProgrammaticUserEntityService.retrieveAllEservicesProgrammaticUsersByUserId.mockResolvedValueOnce([mockProgrammaticUser]);

      // revokeHandler
      mockFileAssetEntityService.retrieveAllChildrenUsingParentUuids.mockResolvedValueOnce([mockUserFileAsset]);

      // createTransaction
      mockApplicationEntityService.retrieveApplicationByTransactionUuid.mockResolvedValueOnce(mockApplication);

      mockTransactionEntityService.saveTransaction.mockResolvedValueOnce(mockRevocationTransaction);

      // createSendRevokeActivity
      mockActivityEntityService.saveActivity.mockResolvedValueOnce(mockSendRevokeActivity);

      mockActivityEntityService.retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid.mockResolvedValueOnce(
        [mockReceiveTransferActivity],
      );

      // createReceiveRevokeActivity
      mockActivityEntityService.saveActivity.mockResolvedValueOnce(mockReceiveRevokeActivity);

      // send email
      mockActivityEntityService.retrieveActivitiesDetailsRequiredForEmail.mockResolvedValueOnce([mockReceiveRevokeActivity]);
    });

    it('should be defined', () => {
      expect(service.createRevokeTransaction).toBeDefined();
    });

    it('should create revoke transction, send revoke activity, receive revoke activities, activityFile records & fileAssetHistories, update fileAssets & oaCertificates, within the same db txn and return revoked fileAsset uuids when revoking via transacionUuid', async () => {
      // revokeTransactionHandler
      mockTransactionEntityService.retrieveTransactionByUuid.mockResolvedValueOnce(mockIssuanceTransaction);

      mockFileAssetEntityService.retrieveFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid.mockResolvedValueOnce([
        mockEserviceFileAsset,
      ]);

      // Return revoke transaction uuid, a list of revoked fileAsset uuids and request trace Id
      const { id: userId } = mockProgrammaticUser;
      expect(await service.createRevokeTransaction(userId, mockRevokeTransactionByTransactionUuidRequest)).toEqual({
        revokeTransactionUuid: mockRevocationTransaction.uuid,
        revokedFileAssetUuids: [mockEserviceFileAsset.uuid],
      });

      // Call and start db transaction
      expect(mockDatabaseTransactionService.startTransaction).toBeCalledTimes(1);

      // // createTransaction
      // // Create and save a revoke transaction
      const { transaction } = mockRevokeTransactionByTransactionUuidRequest;
      const { name, customAgencyMessage } = transaction;
      expect(mockTransactionEntityService.saveTransaction).toBeCalledWith(
        {
          name,
          type: TRANSACTION_TYPE.REVOKE,
          status: TRANSACTION_STATUS.COMPLETED,
          creationMethod: TRANSACTION_CREATION_METHOD.API,
          customAgencyMessage: customAgencyMessage,
          application: mockApplication,
          user: mockProgrammaticUser,
        },
        mockDatabaseTransaction.entityManager,
      );

      // // createSendRevokeActiviy
      // // Created and save a send revoke activity
      expect(mockActivityEntityService.saveActivity).toBeCalledWith(
        {
          status: ACTIVITY_STATUS.COMPLETED,
          type: ACTIVITY_TYPE.SEND_REVOKE,
          transaction: mockRevocationTransaction,
          user: mockProgrammaticUser,
        },
        mockDatabaseTransaction.entityManager,
      );

      // // Create send revoke activityFile records
      expect(mockActivityEntityService.insertActivityFiles).nthCalledWith(
        1,
        mockSendRevokeActivityFileInserts,
        mockDatabaseTransaction.entityManager,
      );

      // // Update agency(upload/sendTransfer) fileAssets
      expect(mockFileAssetEntityService.updateFileAssets).nthCalledWith(
        1,
        [mockEserviceFileAsset.uuid],
        {
          status: FILE_STATUS.REVOKED,
        },
        mockDatabaseTransaction.entityManager,
      );

      // // Update OA certificate
      const { revocation } = mockRevokeTransactionByTransactionUuidRequest;
      const { type, reason } = revocation;

      expect(mockOaCertificateEntityService.updateOaCertificates).toBeCalledWith(
        [mockEserviceFileAsset.oaCertificate!.id],
        {
          status: OA_CERTIFICATE_STATUS.REVOKED,
          revocationType: type,
          reason,
          revokedBy: mockProgrammaticUser,
        },
        mockDatabaseTransaction.entityManager,
      );

      // // Create revoke agency(upload/sendTransfer) fileAssetHistory
      expect(mockFileAssetHistoryEntityService.insertFileAssetHistories).nthCalledWith(
        1,
        mockRevokeEserviceFileAssetHistories,
        mockDatabaseTransaction.entityManager,
      );

      // // createReceiveRevokeActivity
      // // Created and save receive revoke activities'
      expect(mockActivityEntityService.saveActivity).nthCalledWith(
        2,
        {
          status: ACTIVITY_STATUS.COMPLETED,
          type: ACTIVITY_TYPE.RECEIVE_REVOKE,
          transaction: mockRevocationTransaction,
          user: mockCitizenUser,
          recipientInfo: mockReceiveTransferActivity.recipientInfo,
        },
        mockDatabaseTransaction.entityManager,
      );

      // Update user(receiveTransfer) fileAssets
      expect(mockFileAssetEntityService.updateFileAssets).nthCalledWith(
        2,
        [mockUserFileAsset.uuid],
        {
          status: FILE_STATUS.REVOKED,
        },
        mockDatabaseTransaction.entityManager,
      );

      // // Create receive revoke activityFile records
      expect(mockActivityEntityService.insertActivityFiles).nthCalledWith(
        2,
        mockReceiveRevokeActivityFileInserts,
        mockDatabaseTransaction.entityManager,
      );

      // // Create revoke user(receiveTransfer) fileAssetHistory
      expect(mockFileAssetHistoryEntityService.insertFileAssetHistories).nthCalledWith(
        2,
        mockRevokeUserFileAssetHistories,
        mockDatabaseTransaction.entityManager,
      );

      // // // Send revocation emails
      expect(mockNotificationService.processNotifications).toBeCalledWith([mockReceiveRevokeActivity.uuid], {
        templateType: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
      });
    });

    it('should create revoke transction, send revoke activity, receive revoke activities, activityFile records & fileAssetHistories, update fileAssets & oaCertificates, within the same db txn and return revoked fileAsset uuids when revoking via fileAsset uuids', async () => {
      // revokeFileAssetsHandler;
      mockFileAssetEntityService.retrieveFileAssetsByUuids.mockResolvedValueOnce([mockEserviceFileAsset]);
      mockTransactionEntityService.retrieveTransactionsByFileAssetUuids.mockResolvedValueOnce([mockEserviceFileAsset.uuid]);
      // Return a list of revoked fileAssets
      const { id: userId } = mockProgrammaticUser;
      expect(await service.createRevokeTransaction(userId, mockRevokeTransactionByFileAssetUuidsRequest)).toEqual({
        revokeTransactionUuid: mockRevocationTransaction.uuid,
        revokedFileAssetUuids: [mockEserviceFileAsset.uuid],
      });

      // Call and start db transaction
      expect(mockDatabaseTransactionService.startTransaction).toBeCalledTimes(1);

      // createTransaction
      // Created and save a revoke transaction
      const { transaction } = mockRevokeTransactionByFileAssetUuidsRequest;
      const { name, customAgencyMessage } = transaction;
      expect(mockTransactionEntityService.saveTransaction).toBeCalledWith(
        {
          name,
          type: TRANSACTION_TYPE.REVOKE,
          status: TRANSACTION_STATUS.COMPLETED,
          creationMethod: TRANSACTION_CREATION_METHOD.API,
          customAgencyMessage: customAgencyMessage,
          application: mockApplication,
          user: mockProgrammaticUser,
        },
        mockDatabaseTransaction.entityManager,
      );
      // createSendRevokeActiviy
      // Created and save a send revoke activity
      expect(mockActivityEntityService.saveActivity).toBeCalledWith(
        {
          status: ACTIVITY_STATUS.COMPLETED,
          type: ACTIVITY_TYPE.SEND_REVOKE,
          transaction: mockRevocationTransaction,
          user: mockProgrammaticUser,
        },
        mockDatabaseTransaction.entityManager,
      );
      // Create send revoke activityFile records
      expect(mockActivityEntityService.insertActivityFiles).nthCalledWith(
        1,
        mockSendRevokeActivityFileInserts,
        mockDatabaseTransaction.entityManager,
      );
      // Update agency(upload/sendTransfer) fileAssets
      expect(mockFileAssetEntityService.updateFileAssets).nthCalledWith(
        1,
        [mockEserviceFileAsset.uuid],
        {
          status: FILE_STATUS.REVOKED,
        },
        mockDatabaseTransaction.entityManager,
      );
      // Update OA certificate
      const { revocation } = mockRevokeTransactionByTransactionUuidRequest;
      const { type, reason } = revocation;
      expect(mockOaCertificateEntityService.updateOaCertificates).toBeCalledWith(
        [mockEserviceFileAsset.oaCertificate!.id],
        {
          status: OA_CERTIFICATE_STATUS.REVOKED,
          revocationType: type,
          reason,
          revokedBy: mockProgrammaticUser,
        },
        mockDatabaseTransaction.entityManager,
      );
      // Create revoke agency(upload/sendTransfer) fileAssetHistory
      expect(mockFileAssetHistoryEntityService.insertFileAssetHistories).nthCalledWith(
        1,
        mockRevokeEserviceFileAssetHistories,
        mockDatabaseTransaction.entityManager,
      );
      // createReceiveRevokeActivity
      // Created and save receive revoke activities'
      expect(mockActivityEntityService.saveActivity).nthCalledWith(
        2,
        {
          status: ACTIVITY_STATUS.COMPLETED,
          type: ACTIVITY_TYPE.RECEIVE_REVOKE,
          transaction: mockRevocationTransaction,
          user: mockCitizenUser,
          recipientInfo: mockReceiveTransferActivity.recipientInfo,
        },
        mockDatabaseTransaction.entityManager,
      );
      // Update user(receiveTransfer) fileAssets
      expect(mockFileAssetEntityService.updateFileAssets).nthCalledWith(
        2,
        [mockUserFileAsset.uuid],
        {
          status: FILE_STATUS.REVOKED,
        },
        mockDatabaseTransaction.entityManager,
      );
      // Create receive revoke activityFile records
      expect(mockActivityEntityService.insertActivityFiles).nthCalledWith(
        2,
        mockReceiveRevokeActivityFileInserts,
        mockDatabaseTransaction.entityManager,
      );
      // Create revoke user(receiveTransfer) fileAssetHistory
      expect(mockFileAssetHistoryEntityService.insertFileAssetHistories).nthCalledWith(
        2,
        mockRevokeUserFileAssetHistories,
        mockDatabaseTransaction.entityManager,
      );
      // Send revocation emails
      expect(mockNotificationService.processNotifications).toBeCalledWith([mockReceiveRevokeActivity.uuid], {
        templateType: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
      });
    });
  });
});
