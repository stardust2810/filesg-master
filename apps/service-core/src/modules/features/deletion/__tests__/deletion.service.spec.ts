import { RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { Activity } from '../../../../entities/activity';
import { Application } from '../../../../entities/application';
import { FileAsset } from '../../../../entities/file-asset';
import { Transaction } from '../../../../entities/transaction';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import {
  MOCK_ACTIVITY_RECEIVE_DELETE,
  MOCK_ACTIVITY_RECEIVE_TRANSFER_1,
  MOCK_ACTIVITY_TRIGGER_DELETE,
  MOCK_APPLICATION_1,
  MOCK_DELETION_TRANSACTION,
  MOCK_FILE_ASSET_1_AGENCY,
  MOCK_FILE_ASSET_1_RECIPIENT,
  MOCK_TRANSACTION_1,
  SINGLE_TRANSACTION_SINGLE_FILE,
} from '../__mocks__/deletion.service.mock';
import { DeletionService, FileAssetDeleteDetails, GroupedDeleteFileAssetsTransaction, OwnerId } from '../deletion.service';

class TestDeletionService extends DeletionService {
  public groupDeleteFileAssetsByTransactionId(fileAssets: FileAsset[]) {
    return super.groupDeleteFileAssetsByTransactionId(fileAssets);
  }
  public createDeleteEntities(groupedDeleteFileAssetApplication: GroupedDeleteFileAssetsTransaction, entityManager: EntityManager) {
    return super.createDeleteEntities(groupedDeleteFileAssetApplication, entityManager);
  }
  public createDeleteTransaction(application: Application, issuanceTransaction: Transaction, entityManager: EntityManager) {
    return super.createDeleteTransaction(application, issuanceTransaction, entityManager);
  }

  public createDeleteActivities(
    deleteTransactionId: number,
    issuanceTransaction: Transaction,
    receiveTransferActivities: Activity[],
    entityManager: EntityManager,
  ) {
    return super.createDeleteActivities(deleteTransactionId, issuanceTransaction, receiveTransferActivities, entityManager);
  }

  public transformDeleteActivityDetails(
    transaction: Transaction,
    issuerFileAssets: FileAsset[],
    deleteActivities: Activity[],
    recipientFileAssetsMap: Record<OwnerId, FileAsset[]>,
  ) {
    return super.transformDeleteActivityDetails(transaction, issuerFileAssets, deleteActivities, recipientFileAssetsMap);
  }
}
describe('DeletionService', () => {
  let service: TestDeletionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDeletionService,
        { provide: SqsService, useValue: mockSqsService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
      ],
    }).compile();

    service = module.get<TestDeletionService>(TestDeletionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('groupAndFlattenExpiringFileAssets', () => {
    it('should group file assets by transactionId', () => {
      expect(service.groupDeleteFileAssetsByTransactionId(SINGLE_TRANSACTION_SINGLE_FILE)).toEqual({
        '3001': {
          application: MOCK_APPLICATION_1,
          issuanceTransaction: MOCK_TRANSACTION_1,
          receiveTransferActivitiesMap: {
            [MOCK_ACTIVITY_RECEIVE_TRANSFER_1.id]: MOCK_ACTIVITY_RECEIVE_TRANSFER_1,
          },
          issuerFileAssets: [MOCK_FILE_ASSET_1_AGENCY],
          recipientFileAssets: [MOCK_FILE_ASSET_1_RECIPIENT],
          recipientFileAssetsMap: {
            [MOCK_FILE_ASSET_1_RECIPIENT.ownerId]: [MOCK_FILE_ASSET_1_RECIPIENT],
          },
        },
      });
    });
  });

  const MockFlattenedFileAssetsForTransaction: GroupedDeleteFileAssetsTransaction = {
    application: MOCK_APPLICATION_1,
    issuanceTransaction: MOCK_TRANSACTION_1,
    receiveTransferActivitiesMap: {
      [MOCK_ACTIVITY_RECEIVE_TRANSFER_1.id]: MOCK_ACTIVITY_RECEIVE_TRANSFER_1,
    },
    issuerFileAssets: [MOCK_FILE_ASSET_1_AGENCY],
    recipientFileAssets: [MOCK_FILE_ASSET_1_RECIPIENT],
    recipientFileAssetsMap: {
      [MOCK_FILE_ASSET_1_RECIPIENT.ownerId]: [MOCK_FILE_ASSET_1_RECIPIENT],
    },
  };
  describe('createDeleteEntities', () => {
    it('should call the respective functions with correct inputs', async () => {
      jest.spyOn(service, 'createDeleteTransaction').mockResolvedValueOnce(MOCK_DELETION_TRANSACTION);
      jest.spyOn(service, 'createDeleteActivities').mockResolvedValueOnce([MOCK_ACTIVITY_TRIGGER_DELETE, MOCK_ACTIVITY_RECEIVE_DELETE]);
      jest
        .spyOn(service, 'transformDeleteActivityDetails')
        .mockReturnValue([
          { transformDeleteActivityDetails: 'test will be covered in another test suite' },
        ] as unknown as FileAssetDeleteDetails[]);

      await service.createDeleteEntities(MockFlattenedFileAssetsForTransaction, {} as EntityManager);
      expect(service.createDeleteTransaction).toBeCalledWith(MOCK_APPLICATION_1, MOCK_TRANSACTION_1, {});
      expect(service.createDeleteActivities).toBeCalledWith(
        MOCK_DELETION_TRANSACTION.id,
        MOCK_TRANSACTION_1,
        [MOCK_ACTIVITY_RECEIVE_TRANSFER_1],
        {},
      );
      expect(service.transformDeleteActivityDetails).toBeCalledWith(
        MOCK_DELETION_TRANSACTION,
        [MOCK_FILE_ASSET_1_AGENCY],
        [MOCK_ACTIVITY_TRIGGER_DELETE, MOCK_ACTIVITY_RECEIVE_DELETE],
        {
          [MOCK_FILE_ASSET_1_RECIPIENT.ownerId]: [MOCK_FILE_ASSET_1_RECIPIENT],
        },
      );
    });
  });

  describe('transformDeleteActivityDetails', () => {
    it('should return the transformed delete activities details', () => {
      const res = service.transformDeleteActivityDetails(
        MOCK_DELETION_TRANSACTION,
        [MOCK_FILE_ASSET_1_AGENCY],
        [MOCK_ACTIVITY_TRIGGER_DELETE, MOCK_ACTIVITY_RECEIVE_DELETE],
        {
          [MOCK_FILE_ASSET_1_RECIPIENT.ownerId]: [MOCK_FILE_ASSET_1_RECIPIENT],
        },
      );
      expect(res).toStrictEqual([
        {
          transactionId: MOCK_DELETION_TRANSACTION.id,
          transactionType: MOCK_DELETION_TRANSACTION.type,
          activityId: MOCK_ACTIVITY_TRIGGER_DELETE.id,
          activityType: MOCK_ACTIVITY_TRIGGER_DELETE.type,
          fileAssets: [MOCK_FILE_ASSET_1_AGENCY],
        },
        {
          transactionId: MOCK_DELETION_TRANSACTION.id,
          transactionType: MOCK_DELETION_TRANSACTION.type,
          activityId: MOCK_ACTIVITY_RECEIVE_DELETE.id,
          activityType: MOCK_ACTIVITY_RECEIVE_DELETE.type,
          fileAssets: [MOCK_FILE_ASSET_1_RECIPIENT],
        },
      ]);
    });
  });
});
