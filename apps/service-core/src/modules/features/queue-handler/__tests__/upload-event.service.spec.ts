import { FileAssetMetaData } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  FILE_FAIL_CATEGORY,
  FILE_SESSION_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  FileUploadMoveSession,
  OA_CERTIFICATE_STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
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
import {
  mockActivity,
  mockFileAsset,
  mockTransaction,
  mockUploadTransferFailedTxnMessage,
  mockUploadTransferSuccessfullTxnMessage,
  TestUploadEventService,
} from '../__mocks__/upload-event.service.mock';

describe('UploadEventService', () => {
  let service: TestUploadEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestUploadEventService,
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceClientProvider },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<TestUploadEventService>(TestUploadEventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadToStgSuccessHandler', () => {
    it('should update fileAsset and activity successfully', async () => {
      const { transactionId, fileAssetInfos } = mockUploadTransferSuccessfullTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      mockActivityEntityService.retrieveParentActivityByTransactionUuid.mockResolvedValueOnce(mockActivity);
      mockTransactionEntityService.retrieveTransactionByUuid.mockResolvedValueOnce(mockTransaction);

      const constructFileUploadMoveSessionSpy = jest.spyOn(service, 'constructFileUploadMoveSession');
      const processFileAsssetSpy = jest.spyOn(service, 'processFileAssset').mockReturnThis();

      await service.uploadToStgSuccessHandler(mockUploadTransferSuccessfullTxnMessage);

      expect(mockActivityEntityService.retrieveParentActivityByTransactionUuid).toBeCalledWith(transactionId);
      expect(mockTransactionEntityService.retrieveTransactionByUuid).toBeCalledWith(transactionId);
      expect(constructFileUploadMoveSessionSpy).toBeCalledWith(mockTransaction, mockActivity, fileAssetInfos);

      expect(processFileAsssetSpy).toBeCalledTimes(fileAssetInfos.length);
      fileAssetInfos.forEach((info) => expect(processFileAsssetSpy).toBeCalledWith(info, entityManager));

      expect(mockActivityEntityService.updateActivityStatus).toBeCalledWith(mockActivity.uuid, ACTIVITY_STATUS.SCANNING, entityManager);

      const fileUploadMoveSession: FileUploadMoveSession = {
        type: FILE_SESSION_TYPE.UPLOAD,
        transaction: { id: mockTransaction.uuid, type: TRANSACTION_TYPE.UPLOAD_TRANSFER, creationMethod: TRANSACTION_CREATION_METHOD.API },
        transfers: [
          {
            activityId: mockActivity.uuid,
            owner: { id: mockActivity.user!.uuid, type: mockActivity.user!.type },
            files: [{ ownerFileAssetId: mockFileAsset.uuid, isPasswordEncryptionRequired: true, name: fileAssetInfos[0].fileName }],
          },
        ],
      };

      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.FILE_SESSION,
        mockTransaction.fileSessionId!,
        JSON.stringify(fileUploadMoveSession),
      );
    });
  });

  describe('uploadtoStgFailedHandler', () => {
    it('should update fileAsset and activity successfully', async () => {
      const { transactionId, failedFiles } = mockUploadTransferFailedTxnMessage.payload;
      const { entityManager } = mockDatabaseTransaction;

      mockActivityEntityService.retrieveParentActivityByTransactionUuid.mockResolvedValueOnce(mockActivity);

      await service.uploadtoStgFailedHandler(mockUploadTransferFailedTxnMessage);

      expect(mockActivityEntityService.retrieveParentActivityByTransactionUuid).toBeCalledWith(transactionId);

      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledTimes(failedFiles.length);
      failedFiles.forEach((file) =>
        expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(
          file.fileAssetId,
          {
            status: FILE_STATUS.FAILED,
            failCategory: FILE_FAIL_CATEGORY.UPLOAD_TO_STAG,
            failReason: file.failedReason,
          },
          entityManager,
        ),
      );

      expect(mockActivityEntityService.updateActivityStatus).toBeCalledWith(mockActivity.uuid, ACTIVITY_STATUS.FAILED, entityManager);
      expect(mockTransactionEntityService.updateTransactionStatus).toBeCalledWith(
        mockUploadTransferFailedTxnMessage.payload.transactionId,
        TRANSACTION_STATUS.FAILED,
        entityManager,
      );
    });
  });

  describe('processFileAssset', () => {
    it('should save OA certificate if file is of type OA', async () => {
      const fileMetadata: FileAssetMetaData = {
        fileName: 'mockFileName.pdf',
        fileAssetId: 'mockFileAsset-uuid-1',
        fileType: FILE_TYPE.OA,
        size: 1024,
        oaCertificateId: 'oaCertificate-id-1',
        oaCertificateHash: 'oaCertificateHash-1',
      };
      const { fileAssetId: fileAssetUuid, fileType, size, oaCertificateId, oaCertificateHash } = fileMetadata;

      mockFileAssetEntityService.retrieveFileAssetByUuid.mockResolvedValueOnce(mockFileAsset);

      await service.processFileAssset(fileMetadata);

      expect(mockOaCertificateEntityService.saveOaCertificate).toBeCalledWith(
        { id: oaCertificateId, status: OA_CERTIFICATE_STATUS.REVOKED, hash: oaCertificateHash },
        undefined,
      );
      expect(mockFileAssetEntityService.retrieveFileAssetByUuid).toBeCalledWith(fileAssetUuid, undefined);
      expect(mockFileAssetEntityService.updateFileAsset).toBeCalledWith(mockFileAsset.uuid, { status: FILE_STATUS.SCANNING }, undefined);
      expect(mockFileAssetEntityService.updateFileAssetFamilyByParentId).toBeCalledWith(
        mockFileAsset.id,
        { documentType: fileType, size, oaCertificateId },
        undefined,
      );
    });

    it('should not save OA certificate if file is not of type OA', async () => {
      const fileMetadata: FileAssetMetaData = {
        fileName: 'mockFileName.pdf',
        fileAssetId: 'mockFileAsset-uuid-1',
        fileType: FILE_TYPE.PDF,
        size: 1024,
      };
      const { fileAssetId: fileAssetUuid, fileType, size } = fileMetadata;

      mockFileAssetEntityService.retrieveFileAssetByUuid.mockResolvedValueOnce(mockFileAsset);

      await service.processFileAssset(fileMetadata);

      expect(mockOaCertificateEntityService.saveOaCertificate).not.toBeCalled();
      expect(mockFileAssetEntityService.retrieveFileAssetByUuid).toBeCalledWith(fileAssetUuid, undefined);
      expect(mockFileAssetEntityService.updateFileAsset).toBeCalledWith(mockFileAsset.uuid, { status: FILE_STATUS.SCANNING }, undefined);
      expect(mockFileAssetEntityService.updateFileAssetFamilyByParentId).toBeCalledWith(
        mockFileAsset.id,
        { documentType: fileType, size },
        undefined,
      );
    });
  });

  describe('constructFileUploadMoveSession', () => {
    it('should construct the file upload move session properly', () => {
      const { fileAssetInfos } = mockUploadTransferSuccessfullTxnMessage.payload;

      const fileUploadMoveSession: FileUploadMoveSession = {
        type: FILE_SESSION_TYPE.UPLOAD,
        transaction: { id: mockTransaction.uuid, type: TRANSACTION_TYPE.UPLOAD_TRANSFER, creationMethod: TRANSACTION_CREATION_METHOD.API },
        transfers: [
          {
            activityId: mockActivity.uuid,
            owner: { id: mockActivity.user!.uuid, type: mockActivity.user!.type },
            files: [{ ownerFileAssetId: mockFileAsset.uuid, isPasswordEncryptionRequired: true, name: fileAssetInfos[0].fileName }],
          },
        ],
      };

      expect(service.constructFileUploadMoveSession(mockTransaction, mockActivity, fileAssetInfos)).toEqual(fileUploadMoveSession);
    });
  });
});
