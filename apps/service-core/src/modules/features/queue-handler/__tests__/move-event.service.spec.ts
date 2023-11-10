/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable sonarjs/no-identical-functions */
import { MoveCompletedMessageTransfer, MoveFailedMessageTransfer } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  FILE_FAIL_CATEGORY,
  FILE_STATUS,
  OA_CERTIFICATE_STATUS,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TransactionDetails,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { DatabaseException, UnknownTransactionTypeException } from '../../../../common/filters/custom-exceptions.filter';
import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import * as helpers from '../../../../utils/helpers';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockOaCertificateEntityService } from '../../../entities/oa-certificate/__mocks__/oa-certificate.entity.service.mock';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockEventLogsServiceClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { mockNotificationService } from '../../notification/__mocks__/notification.service.mock';
import { EmailService } from '../../notification/email.service';
import { NotificationService } from '../../notification/notification.service';
import {
  mockProgrammaticUser,
  mockReceivedFileAsset,
  mockReceivedFileAsset2,
  mockReceiveTransferActivity,
  mockSendTransferActivity,
  mockTransferMoveCompletedTransferTxnMessage,
  mockTransferMoveCompletedUnknownTxnMessage,
  mockTransferMoveCompletedUploadTransferTxnMessage,
  mockTransferMoveFailedAllTxnMessage,
  mockTransferMoveFailedUnknownTxnMessage,
  mockUploadMoveCompletedUnknownTxnMessage,
  mockUploadMoveCompletedUploadTransferTxnMessage,
  mockUploadMoveCompletedUploadTxnMessage,
  mockUploadMoveFailedAllTxnMessage,
  mockUploadMoveFailedUnknownTxnMessage,
  sessionTransfers,
  TestMoveEventService,
  transferSession,
} from '../__mocks__/move-event.service.mock';

const validateFileAssetsUpdate = (
  transfers: MoveCompletedMessageTransfer[],
  status: FILE_STATUS,
  entityManager: EntityManager,
  additionals?: { fileAssetUuids?: string[] },
) => {
  const fileUuidsToUpdate: string[] = [];

  transfers.forEach((transfer) => {
    const { files } = transfer;
    files.forEach((file) => fileUuidsToUpdate.push(file.id));
  });

  if (additionals?.fileAssetUuids) {
    fileUuidsToUpdate.push(...additionals.fileAssetUuids);
  }

  expect(mockFileAssetEntityService.updateFileAssets).toBeCalledTimes(1);
  expect(mockFileAssetEntityService.updateFileAssets).toBeCalledWith(fileUuidsToUpdate, { status }, entityManager);
};

const validateFileAssetUpdateToFailed = (
  transfers: MoveFailedMessageTransfer[],
  failCategory: FILE_FAIL_CATEGORY,
  entityManager: EntityManager,
) => {
  let updateFileAssetTimes = 0;

  for (const transfer of transfers) {
    const { files } = transfer;
    for (const file of files) {
      updateFileAssetTimes += 1;

      expect(mockFileAssetEntityService.updateFileAsset).toBeCalledWith(
        file.id,
        {
          status: FILE_STATUS.FAILED,
          failCategory,
          failReason: file.error,
        },
        entityManager,
      );
    }
  }
  expect(mockFileAssetEntityService.updateFileAsset).toBeCalledTimes(updateFileAssetTimes);
};

const validateActivityUpdate = (
  transfers: MoveCompletedMessageTransfer[],
  status: ACTIVITY_STATUS,
  entityManager: EntityManager,
  additionals?: { activityUuids?: string[] },
) => {
  const activityUuidsToUpdate = transfers.map((transfer) => transfer.activityId);

  if (additionals?.activityUuids) {
    activityUuidsToUpdate.push(...additionals.activityUuids);
  }

  expect(mockActivityEntityService.updateActivities).toBeCalledTimes(1);
  expect(mockActivityEntityService.updateActivities).toBeCalledWith(activityUuidsToUpdate, { status }, entityManager);
};

const validateTransactionUpdate = (transaction: TransactionDetails, status: TRANSACTION_STATUS, entityManager: EntityManager) => {
  expect(mockTransactionEntityService.updateTransactionStatus).toBeCalledTimes(1);
  expect(mockTransactionEntityService.updateTransactionStatus).toBeCalledWith(transaction.id, status, entityManager);
};

describe('MoveEventService', () => {
  let service: TestMoveEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestMoveEventService,
        { provide: SqsService, useValue: mockSqsService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceClientProvider },
      ],
    }).compile();

    service = module.get<TestMoveEventService>(TestMoveEventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Main Handlers
  // ===========================================================================
  describe('uploadMoveSuccessHandler', () => {
    it('should call uploadMoveSuccessUploadTxnHandler when transaction is type UPLOAD', async () => {
      const uploadMoveSuccessUploadTxnHandlerSpy = jest.spyOn(service, 'uploadMoveSuccessUploadTxnHandler');
      uploadMoveSuccessUploadTxnHandlerSpy.mockReturnThis();

      await service.uploadMoveSuccessHandler(mockUploadMoveCompletedUploadTxnMessage);
      expect(uploadMoveSuccessUploadTxnHandlerSpy).toBeCalledWith(mockUploadMoveCompletedUploadTxnMessage.payload);
    });

    it('should call uploadMoveSuccessUploadTransferTxnHandler when transaction is type UPLOAD_TRANSFER', async () => {
      const uploadMoveSuccessUploadTransferTxnHandlerSpy = jest.spyOn(service, 'uploadMoveSuccessUploadTransferTxnHandler');
      uploadMoveSuccessUploadTransferTxnHandlerSpy.mockReturnThis();
      jest.spyOn(service, 'addTransferMoveSession').mockReturnThis();

      await service.uploadMoveSuccessHandler(mockUploadMoveCompletedUploadTransferTxnMessage);
      expect(uploadMoveSuccessUploadTransferTxnHandlerSpy).toBeCalledWith(mockUploadMoveCompletedUploadTransferTxnMessage.payload);
    });

    it('should throw error if TRANSACTION type is neither UPLOAD nor UPLOAD_TRANSFER', async () => {
      await expect(service.uploadMoveSuccessHandler(mockUploadMoveCompletedUnknownTxnMessage)).rejects.toThrowError(
        new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'UNKNOWN' as TRANSACTION_TYPE),
      );
    });
  });

  describe('uploadMoveFailedHandler', () => {
    it('should call uploadMoveFailureAllTxnHandler when transaction is type UPLOAD or UPLOAD_TRANSFER', async () => {
      const uploadMoveFailureAllTxnHandlerSpy = jest.spyOn(service, 'uploadMoveFailureAllTxnHandler');
      uploadMoveFailureAllTxnHandlerSpy.mockReturnThis();

      await service.uploadMoveFailedHandler(mockUploadMoveFailedAllTxnMessage);
      expect(uploadMoveFailureAllTxnHandlerSpy).toBeCalledWith(mockUploadMoveFailedAllTxnMessage.payload);
    });

    it('should throw error if TRANSACTION type is neither UPLOAD nor UPLOAD_TRANSFER', async () => {
      await expect(service.uploadMoveFailedHandler(mockUploadMoveFailedUnknownTxnMessage)).rejects.toThrowError(
        new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'UNKNOWN' as TRANSACTION_TYPE),
      );
    });
  });

  describe('transferMoveSuccessHandler', () => {
    it('should call transferMoveSuccessTransferTxnHandler when transaction is type TRANSFER', async () => {
      const transferMoveSuccessTransferTxnHandlerSpy = jest.spyOn(service, 'transferMoveSuccessTransferTxnHandler');
      transferMoveSuccessTransferTxnHandlerSpy.mockReturnThis();

      await service.transferMoveSuccessHandler(mockTransferMoveCompletedTransferTxnMessage);
      expect(transferMoveSuccessTransferTxnHandlerSpy).toBeCalledWith(mockTransferMoveCompletedTransferTxnMessage.payload);
    });

    it('should call transferMoveSuccessUploadTransferTxnHandler when transaction is type UPLOAD_TRANSFER', async () => {
      const transferMoveSuccessUploadTransferTxnHandlerSpy = jest.spyOn(service, 'transferMoveSuccessUploadTransferTxnHandler');
      transferMoveSuccessUploadTransferTxnHandlerSpy.mockReturnThis();

      await service.transferMoveSuccessHandler(mockTransferMoveCompletedUploadTransferTxnMessage);
      expect(transferMoveSuccessUploadTransferTxnHandlerSpy).toBeCalledWith(mockTransferMoveCompletedUploadTransferTxnMessage.payload);
    });

    it('should throw error if TRANSACTION type is neither UPLOAD nor UPLOAD_TRANSFER', async () => {
      await expect(service.transferMoveSuccessHandler(mockTransferMoveCompletedUnknownTxnMessage)).rejects.toThrowError(
        new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'UNKNOWN' as TRANSACTION_TYPE),
      );
    });
  });

  describe('transferMoveFailedHandler', () => {
    it('should call transferMoveFailureAllTxnHandler when transaction is type UPLOAD or UPLOAD_TRANSFER', async () => {
      const transferMoveFailureAllTxnHandlerSpy = jest.spyOn(service, 'transferMoveFailureAllTxnHandler');
      transferMoveFailureAllTxnHandlerSpy.mockReturnThis();

      await service.transferMoveFailedHandler(mockTransferMoveFailedAllTxnMessage);
      expect(transferMoveFailureAllTxnHandlerSpy).toBeCalledWith(mockTransferMoveFailedAllTxnMessage.payload);
    });

    it('should throw error if TRANSACTION type is neither UPLOAD nor UPLOAD_TRANSFER', async () => {
      await expect(service.transferMoveFailedHandler(mockTransferMoveFailedUnknownTxnMessage)).rejects.toThrowError(
        new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'UNKNOWN' as TRANSACTION_TYPE),
      );
    });
  });

  // ===========================================================================
  // Sub handlers (Upload Move)
  // ===========================================================================
  describe('uploadMoveSuccessUploadTxnHandler', () => {
    it('should call moveCompletedMessageHandler with the right params', async () => {
      const { transaction, transfers } = mockUploadMoveCompletedUploadTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      const fileAssetsWithParentAndOaCertificate = [mockReceivedFileAsset, mockReceivedFileAsset2];
      mockFileAssetEntityService.retrieveFileAssetsWithParentAndOaCertificateByUuids.mockResolvedValueOnce(
        fileAssetsWithParentAndOaCertificate,
      );

      const moveCompletedMessageHandlerSpy = jest.spyOn(service, 'moveCompletedMessageHandler');

      await service.uploadMoveSuccessUploadTxnHandler(mockUploadMoveCompletedUploadTxnMessage.payload);

      expect(mockFileAssetEntityService.retrieveFileAssetsWithParentAndOaCertificateByUuids).toBeCalledWith(
        transfers[0].files.map((file) => file.id),
      );
      expect(moveCompletedMessageHandlerSpy).toBeCalledWith(transaction.id, transfers, entityManager, {
        oaCertificateIds: [mockReceivedFileAsset2.oaCertificateId],
      });
    });
  });

  describe('uploadMoveSuccessUploadTransferTxnHandler', () => {
    it('should update activity type upload to completed status and transaction to uploaded status and create transfer file session if TRANSACTION type is UPLOAD_TRANSFER', async () => {
      const { transaction, transfers } = mockUploadMoveCompletedUploadTransferTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      const addTransferSessionHandlerSpy = jest.spyOn(service, 'addTransferMoveSession');
      addTransferSessionHandlerSpy.mockReturnThis();

      await service.uploadMoveSuccessUploadTransferTxnHandler(mockUploadMoveCompletedUploadTransferTxnMessage.payload);

      validateActivityUpdate(transfers, ACTIVITY_STATUS.COMPLETED, entityManager);
      validateTransactionUpdate(transaction, TRANSACTION_STATUS.UPLOADED, entityManager);
      expect(addTransferSessionHandlerSpy).toBeCalledWith(transaction, transfers);
    });
  });

  describe('uploadMoveFailureAllTxnHandler', () => {
    it('should call moveFailedMessageHandler with the right params', async () => {
      const { transaction, transfers } = mockUploadMoveFailedUnknownTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      const moveFailedMessageHandlerSpy = jest.spyOn(service, 'moveFailedMessageHandler');

      await service.uploadMoveFailureAllTxnHandler(mockUploadMoveFailedUnknownTxnMessage.payload);

      expect(moveFailedMessageHandlerSpy).toBeCalledWith(transaction, transfers, FILE_FAIL_CATEGORY.UPLOAD_MOVE, entityManager);
    });
  });

  // ===========================================================================
  // Sub handlers (Transfer Move)
  // ===========================================================================
  describe('transferMoveSuccessTransferTxnHandler', () => {
    it('should call moveCompletedMessageHandler with the right params', async () => {
      const { transaction, transfers } = mockTransferMoveCompletedTransferTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      mockActivityEntityService.retrieveParentActivityByUuid.mockResolvedValueOnce(mockSendTransferActivity);
      const moveCompletedMessageHandlerSpy = jest.spyOn(service, 'moveCompletedMessageHandler');

      await service.transferMoveSuccessTransferTxnHandler(mockTransferMoveCompletedTransferTxnMessage.payload);

      expect(mockActivityEntityService.retrieveParentActivityByUuid).toBeCalledWith(transfers[0].activityId);
      expect(moveCompletedMessageHandlerSpy).toBeCalledWith(transaction.id, transfers, entityManager, {
        activityUuids: [mockSendTransferActivity.uuid],
      });
    });
  });

  describe('transferMoveSuccessUploadTransferTxnHandler', () => {
    it('should call moveCompletedMessageHandler with the right params', async () => {
      const { transaction, transfers } = mockTransferMoveCompletedUploadTransferTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      mockActivityEntityService.retrieveParentActivityByUuid.mockResolvedValueOnce(mockSendTransferActivity);

      const fileAssetsWithParentAndOaCertificate = [mockReceivedFileAsset, mockReceivedFileAsset2];
      mockFileAssetEntityService.retrieveFileAssetsWithParentAndOaCertificateByUuids.mockResolvedValueOnce(
        fileAssetsWithParentAndOaCertificate,
      );

      const moveCompletedMessageHandlerSpy = jest.spyOn(service, 'moveCompletedMessageHandler');

      await service.transferMoveSuccessUploadTransferTxnHandler(mockTransferMoveCompletedUploadTransferTxnMessage.payload);

      const receiveTransferActivityUuid = transfers[0].activityId;
      const parentFileAssetUuids = fileAssetsWithParentAndOaCertificate.map((file) => file.parent!.uuid);

      expect(mockActivityEntityService.retrieveParentActivityByUuid).toBeCalledWith(receiveTransferActivityUuid);
      expect(mockFileAssetEntityService.retrieveFileAssetsWithParentAndOaCertificateByUuids).toBeCalledWith(
        transfers[0].files.map((file) => file.id),
      );
      expect(moveCompletedMessageHandlerSpy).toBeCalledWith(transaction.id, transfers, entityManager, {
        activityUuids: [mockSendTransferActivity.uuid],
        fileAssetUuids: [...parentFileAssetUuids],
        oaCertificateIds: [mockReceivedFileAsset2.oaCertificateId],
      });
    });
  });

  describe('transferMoveFailureAllTxnHandler', () => {
    it('should call moveFailedMessageHandler with the right params', async () => {
      const { transaction, transfers } = mockTransferMoveFailedAllTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      mockActivityEntityService.retrieveParentActivityByUuid.mockResolvedValueOnce(mockSendTransferActivity);
      const moveFailedMessageHandlerSpy = jest.spyOn(service, 'moveFailedMessageHandler');

      await service.transferMoveFailureAllTxnHandler(mockTransferMoveFailedAllTxnMessage.payload);

      const receiveTransferActivityUuid = transfers[0].activityId;
      expect(mockActivityEntityService.retrieveParentActivityByUuid).toBeCalledWith(receiveTransferActivityUuid);
      expect(moveFailedMessageHandlerSpy).toBeCalledWith(transaction, transfers, FILE_FAIL_CATEGORY.TRANSFER_MOVE, entityManager, {
        activityUuids: [mockSendTransferActivity.uuid],
      });
    });
  });

  // ===========================================================================
  // Utility Methods
  // ===========================================================================
  describe('moveCompletedMessageHandler', () => {
    it('should update all fileAssets to active status, activity type upload to completed status and transaction to completed status if TRANSACTION type is UPLOAD', async () => {
      const { transaction, transfers } = mockUploadMoveCompletedUploadTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      await service.moveCompletedMessageHandler(transaction.id, transfers, entityManager as unknown as EntityManager);

      validateFileAssetsUpdate(transfers, FILE_STATUS.ACTIVE, entityManager);
      validateActivityUpdate(transfers, ACTIVITY_STATUS.COMPLETED, entityManager);
      validateTransactionUpdate(transaction, TRANSACTION_STATUS.COMPLETED, entityManager);
    });

    it('should append to the files, activities and oaCertificates list when additionals are given', async () => {
      const { transaction, transfers } = mockUploadMoveCompletedUploadTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      const additionalFileAssetUuids = ['fileAsset-uuid-999'];
      const additionalActivityUuids = ['activity-uuid-999'];
      const additionalOaCertificateIds = ['oaCertificate-id-1'];

      await service.moveCompletedMessageHandler(transaction.id, transfers, entityManager as unknown as EntityManager, {
        fileAssetUuids: additionalFileAssetUuids,
        activityUuids: additionalActivityUuids,
        oaCertificateIds: additionalOaCertificateIds,
      });

      validateFileAssetsUpdate(transfers, FILE_STATUS.ACTIVE, entityManager, { fileAssetUuids: additionalFileAssetUuids });
      validateActivityUpdate(transfers, ACTIVITY_STATUS.COMPLETED, entityManager, { activityUuids: additionalActivityUuids });
      expect(mockOaCertificateEntityService.updateOaCertificates).toBeCalledWith(
        additionalOaCertificateIds,
        { status: OA_CERTIFICATE_STATUS.ISSUED },
        entityManager,
      );
    });
  });

  describe('moveFailedMessageHandler', () => {
    it('should update failed fileAssets to failed status with failCategory (UPLOAD_MOVE) and failReason, activity type upload to failed status and transaction to failed status for BOTH TRANSACTION type', async () => {
      const { transaction, transfers } = mockUploadMoveFailedAllTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      await service.moveFailedMessageHandler(
        transaction,
        transfers,
        FILE_FAIL_CATEGORY.UPLOAD_MOVE,
        entityManager as unknown as EntityManager,
      );

      validateFileAssetUpdateToFailed(transfers, FILE_FAIL_CATEGORY.UPLOAD_MOVE, entityManager);
      validateActivityUpdate(transfers, ACTIVITY_STATUS.FAILED, entityManager);
      validateTransactionUpdate(transaction, TRANSACTION_STATUS.FAILED, entityManager);
    });

    it('should append to the activities list when additionals are given', async () => {
      const { transaction, transfers } = mockUploadMoveFailedAllTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      const additionalActivityUuids = ['activity-uuid-999'];

      await service.moveFailedMessageHandler(
        transaction,
        transfers,
        FILE_FAIL_CATEGORY.UPLOAD_MOVE,
        entityManager as unknown as EntityManager,
        { activityUuids: additionalActivityUuids },
      );

      validateFileAssetUpdateToFailed(transfers, FILE_FAIL_CATEGORY.UPLOAD_MOVE, entityManager);
      validateActivityUpdate(transfers, ACTIVITY_STATUS.FAILED, entityManager, { activityUuids: additionalActivityUuids });
    });
  });

  describe('addTransferSessionHandler', () => {
    const { transaction, transfers } = mockUploadMoveCompletedUploadTransferTxnMessage.payload;

    it('should call sendTransferSessionToRedis and sendMessageToQueueTransferEvents with right params', async () => {
      const mockFileSessionUuid = 'mockFileSession-uuid-1';

      mockActivityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType
        .mockResolvedValueOnce([mockSendTransferActivity])
        .mockResolvedValueOnce([mockReceiveTransferActivity]);

      jest.spyOn(helpers, 'generateFileSessionUUID').mockReturnValueOnce(mockFileSessionUuid);
      const sendTransferSessionToRedisSpy = jest.spyOn(service, 'sendTransferSessionToRedis');

      await service.addTransferMoveSession(transaction, transfers);

      expect(mockActivityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType).toBeCalledTimes(
        transfers.length * 2,
      );

      transfers.forEach((transfer) => {
        const { activityId } = transfer;

        expect(mockActivityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType).toBeCalledWith(
          activityId,
          ACTIVITY_TYPE.SEND_TRANSFER,
        );
        expect(mockActivityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType).toBeCalledWith(
          mockSendTransferActivity.uuid,
          ACTIVITY_TYPE.RECEIVE_TRANSFER,
        );
      });

      expect(sendTransferSessionToRedisSpy).toBeCalledWith(transaction, sessionTransfers);
      expect(mockSqsService.sendMessageToQueueTransferEvents).toBeCalledWith({ fileSessionId: mockFileSessionUuid });
    });

    it('should throw DatabaseException when more than 1 send transfer activities are retrieved', async () => {
      const mockExtraSendTransferActivity = createMockActivity({
        uuid: 'mockActivity-uuid-99',
        status: ACTIVITY_STATUS.INIT,
        type: ACTIVITY_TYPE.SEND_TRANSFER,
        user: mockProgrammaticUser,
      });

      mockActivityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType.mockResolvedValueOnce([
        mockSendTransferActivity,
        mockExtraSendTransferActivity,
      ]);

      await expect(service.addTransferMoveSession(transaction, transfers)).rejects.toThrowError(
        new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'retrieving', 'activity'),
      );
    });
  });

  describe('sendTransferSessionToRedis', () => {
    it('should call redis service set method with right params', async () => {
      const mockFileSessionUuid = 'mockFileSession-uuid-1';
      const { transaction } = mockUploadMoveCompletedUploadTransferTxnMessage.payload;

      jest.spyOn(helpers, 'generateFileSessionUUID').mockReturnValueOnce(mockFileSessionUuid);

      await service.sendTransferSessionToRedis(transaction, sessionTransfers);

      expect(mockFileSGRedisService.set).toBeCalledTimes(1);
      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.FILE_SESSION,
        mockFileSessionUuid,
        JSON.stringify(transferSession),
      );
    });
  });
});
