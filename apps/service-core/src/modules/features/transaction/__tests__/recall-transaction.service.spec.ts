import { EntityNotFoundException, InputValidationException } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { mockActivity, mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import {
  mockFileAssetEntityService,
  mockTransferredFileAsset,
  mockUploadFileAsset,
} from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import {
  mockTransaction,
  mockTransactionEntityService,
  mockTransactionWithActivityAndFileAssets,
} from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockDeletionService } from '../../deletion/__mocks__/deletion.service.mock';
import { DeletionService } from '../../deletion/deletion.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import { mockRecallTransactionResponse, TestRecallTransactionService } from '../__mocks__/recall-transaction.service.mock';

describe('RecallTransactionService', () => {
  let service: TestRecallTransactionService;

  const eserviceUserId = 1;
  const fileAssetDeleteDetails = [
    {
      activityId: 5,
      activityType: ACTIVITY_TYPE.SEND_RECALL,
      fileAssets: [mockUploadFileAsset],
      transactionId: 2,
      transactionType: TRANSACTION_TYPE.RECALL,
    },
    {
      activityId: 6,
      activityType: ACTIVITY_TYPE.RECEIVE_RECALL,
      fileAssets: [mockTransferredFileAsset],
      transactionId: 2,
      transactionType: TRANSACTION_TYPE.RECALL,
    },
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestRecallTransactionService,
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: DeletionService, useValue: mockDeletionService },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<TestRecallTransactionService>(TestRecallTransactionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('delete service should be called if there are files to be deleted', async () => {
    jest.spyOn(service, 'createRecallTransaction').mockResolvedValue(mockTransaction);
    jest.spyOn(service, 'createRecallActivities').mockResolvedValue([]);
    jest.spyOn(service, 'updateTransactionsAndActivitiesStatus').mockResolvedValue();
    jest.spyOn(service, 'updateTransactionsAndActivitiesStatus').mockResolvedValue();
    jest.spyOn(service, 'updateFileAssetStatus').mockResolvedValue(['1']);

    mockDatabaseTransactionService.startTransaction.mockResolvedValue(mockDatabaseTransaction);
    mockTransactionEntityService.retrieveTransactionByUuidAndUserId.mockResolvedValueOnce(mockTransactionWithActivityAndFileAssets);

    await service.recallTransaction('mock-transaction-001', eserviceUserId, { creationMethod: TRANSACTION_CREATION_METHOD.API });

    expect(mockDeletionService.createFileSessionAndSendDeleteMsg).toBeCalledTimes(1);
  });

  it('email should be sent to agency immediately if there are files to be deleted', async () => {
    jest.spyOn(service, 'createRecallTransaction').mockResolvedValue(mockTransaction);
    jest.spyOn(service, 'createRecallActivities').mockResolvedValue(fileAssetDeleteDetails);
    jest.spyOn(service, 'updateTransactionsAndActivitiesStatus').mockResolvedValue();
    jest.spyOn(service, 'updateTransactionsAndActivitiesStatus').mockResolvedValue();
    jest.spyOn(service, 'updateFileAssetStatus').mockResolvedValue([]);

    mockDatabaseTransactionService.startTransaction.mockResolvedValue(mockDatabaseTransaction);
    mockTransactionEntityService.retrieveTransactionByUuidAndUserId.mockResolvedValueOnce(mockTransactionWithActivityAndFileAssets);

    mockActivityEntityService.retrieveRecallActivitiesDetailsRequiredForEmail.mockResolvedValueOnce([mockActivity]);

    await service.recallTransaction('mock-transaction-002', eserviceUserId, { creationMethod: TRANSACTION_CREATION_METHOD.API });

    expect(mockEmailService.sendRecallSucessEmailToAgency).toBeCalledTimes(1);
  });

  describe('Recall transaction input validation', () => {
    it('should fail if the transaction info was not found', async () => {
      mockTransactionEntityService.retrieveTransactionByUuidAndUserId.mockResolvedValueOnce(null);

      await expect(
        service.recallTransaction('mock-transaction-001', eserviceUserId, { creationMethod: TRANSACTION_CREATION_METHOD.API }),
      ).rejects.toThrowError(EntityNotFoundException);
    });

    it('should fail if the transaction has the wrong type', async () => {
      mockTransactionEntityService.retrieveTransactionByUuidAndUserId.mockResolvedValueOnce({ type: TRANSACTION_TYPE.RECALL });

      await expect(
        service.recallTransaction('mock-transaction-001', eserviceUserId, { creationMethod: TRANSACTION_CREATION_METHOD.API }),
      ).rejects.toThrowError(InputValidationException);
    });

    it('should fail if the transaction does not have a completed status', async () => {
      mockTransactionEntityService.retrieveTransactionByUuidAndUserId.mockResolvedValueOnce({
        type: TRANSACTION_TYPE.RECALL,
        status: TRANSACTION_STATUS.RECALLED,
      });

      await expect(
        service.recallTransaction('mock-transaction-001', eserviceUserId, { creationMethod: TRANSACTION_CREATION_METHOD.API }),
      ).rejects.toThrowError(InputValidationException);
    });
  });

  describe('Grouping file assets to user ids', () => {
    it('should group file assets by user IDs based on transaction data', async () => {
      const mappedFileAssets = service.getUserActivityAndValidFileAssets(mockTransactionWithActivityAndFileAssets);
      expect([...mappedFileAssets.keys()].length).toEqual(2);
      expect([...mappedFileAssets.keys()]).toEqual([1, 2]);
      expect([...mappedFileAssets.get(1)!.fileAssetMap.keys()].length).toEqual(1);
      expect([...mappedFileAssets.get(1)!.fileAssetMap.keys()]).toEqual([1]);
      expect(mappedFileAssets.get(1)!.fileAssetMap.get(1)!.type).toEqual(FILE_ASSET_TYPE.UPLOADED);
      expect([...mappedFileAssets.get(2)!.fileAssetMap.keys()].length).toEqual(1);
      expect([...mappedFileAssets.get(2)!.fileAssetMap.keys()]).toEqual([2]);
      expect(mappedFileAssets.get(2)!.fileAssetMap.get(2)!.type).toEqual(FILE_ASSET_TYPE.TRANSFERRED);
    });

    it('should not return a file asset if its status is `deleted`', async () => {
      const mockTransactionWithActivityAndFileAssetsWithDeletedStatus = JSON.parse(
        JSON.stringify(mockTransactionWithActivityAndFileAssets),
      );

      mockTransactionWithActivityAndFileAssetsWithDeletedStatus.activities.forEach((activity: any) => {
        activity.fileAssets.forEach((fileAsset: any) => {
          fileAsset.status = FILE_STATUS.DELETED;
        });
      });

      const mappedFileAssets = service.getUserActivityAndValidFileAssets(mockTransactionWithActivityAndFileAssetsWithDeletedStatus);
      Array.from(mappedFileAssets.values()).forEach((info) => {
        expect(Array.from(info.fileAssetMap.values()).length).toBe(0);
      });
    });
  });

  describe('Create recall transaction', () => {
    it('should call transaction entity service create transaction function', () => {
      service.createRecallTransaction(
        mockTransactionWithActivityAndFileAssets,
        eserviceUserId,
        TRANSACTION_CREATION_METHOD.API,
        {} as EntityManager,
      );

      expect(mockTransactionEntityService.saveTransaction).toBeCalledWith(
        {
          type: TRANSACTION_TYPE.RECALL,
          status: TRANSACTION_STATUS.INIT,
          name: `Recall transaction: ${mockTransactionWithActivityAndFileAssets.uuid}`,
          userId: eserviceUserId,
          applicationId: mockTransactionWithActivityAndFileAssets.applicationId,
          parentId: mockTransactionWithActivityAndFileAssets.id,
          creationMethod: TRANSACTION_CREATION_METHOD.API,
        },
        {},
      );
    });
  });

  describe('Create recall activites', () => {
    it('createRecallActivities should return fileAssetDeleteDetails', async () => {
      jest.spyOn(mockActivityEntityService, 'saveActivity').mockResolvedValueOnce({ id: 5, type: ACTIVITY_TYPE.SEND_RECALL, userId: 1 });
      jest.spyOn(mockActivityEntityService, 'saveActivity').mockResolvedValue({ id: 6, type: ACTIVITY_TYPE.RECEIVE_RECALL, userId: 2 });

      const usersFileAssets = service.getUserActivityAndValidFileAssets(mockTransactionWithActivityAndFileAssets);
      const fileAssetDeleteDetails = await service.createRecallActivities(
        mockRecallTransactionResponse,
        usersFileAssets,
        eserviceUserId,
        {} as EntityManager,
      );

      expect(mockActivityEntityService.saveActivity).toBeCalledTimes(2);
      expect(fileAssetDeleteDetails).toMatchObject(fileAssetDeleteDetails);
    });
  });

  describe('Update of transaction and activities status', () => {
    it('should call update for transaction and acitivties with correct ids', async () => {
      await service.updateTransactionsAndActivitiesStatus(mockTransactionWithActivityAndFileAssets, {} as EntityManager);
      expect(mockTransactionEntityService.updateTransactions).toBeCalledTimes(1);
      expect(mockActivityEntityService.updateActivities).toBeCalledTimes(1);

      expect(mockTransactionEntityService.updateTransactions).toBeCalledWith([1], { status: TRANSACTION_STATUS.RECALLED }, {});
      expect(mockActivityEntityService.updateActivities).toBeCalledWith([1, 2, 3], { status: ACTIVITY_STATUS.RECALLED }, {});
    });
  });

  describe('Update of file asset status', () => {
    it('should call File Asset Entity Service to update status to PENDING_DELETE', () => {
      const usersFileAssets = service.getUserActivityAndValidFileAssets(mockTransactionWithActivityAndFileAssets);
      service.updateFileAssetStatus(usersFileAssets, {} as EntityManager);

      expect(mockFileAssetEntityService.updateFileAssets).toBeCalledTimes(1);
      expect(mockFileAssetEntityService.updateFileAssets).toBeCalledWith(
        ['mockFileAsset-uuid-1', 'mockFileAsset-uuid-2'],
        { status: FILE_STATUS.PENDING_DELETE },
        {},
      );
    });
  });
});
