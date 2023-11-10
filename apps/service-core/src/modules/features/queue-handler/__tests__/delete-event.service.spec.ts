import { FilesToDeleteMessageInfo } from '@filesg/backend-common';
import { FILE_ASSET_ACTION } from '@filesg/common';
import { RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';

import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockFileAssetAccessEntityService } from '../../../entities/file-asset-access/__mocks__/file-asset-access.entity.service.mock';
import { FileAssetAccessEntityService } from '../../../entities/file-asset-access/file-asset-access.entity.service';
import { mockFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.service.mock';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { mockOaCertificateEntityService } from '../../../entities/oa-certificate/__mocks__/oa-certificate.entity.service.mock';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { mockNotificationService } from '../../notification/__mocks__/notification.service.mock';
import { EmailService } from '../../notification/email.service';
import { NotificationService } from '../../notification/notification.service';
import { mockRecallTransactionService } from '../../transaction/__mocks__/recall-transaction.service.mock';
import { RecallTransactionService } from '../../transaction/recall-transaction.service';
import {
  MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF,
  MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY,
  MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY,
  MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF,
  MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY,
  MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY,
  MOCK_OA_AND_PDF_ACTIVIES_DELETE_MESSAGES,
  MOCK_OA_ONLY_ACTIVIES_DELETE_MESSAGES,
  MOCK_PDF_ONLY_ACTIVIES_DELETE_MESSAGES,
  MOCK_TRANSACTION_WITH_OA_ONLY,
  MOCK_TRANSACTION_WITH_OA_PDF,
  MOCK_TRANSACTION_WITH_PDF_ONLY,
  OA_AND_PDF_FILE_ASSETS,
  ONLY_OA_FILE_ASSETS,
  ONLY_PDF_FILE_ASSETS,
} from '../__mocks__/delete-event.service.mock';
import { DeleteEventService } from '../events/delete-event.service';
class TestDeleteEventService extends DeleteEventService {
  public groupAndFlattenUpdateDeletedEntities(filesToDeleteMessageInfo: FilesToDeleteMessageInfo[]) {
    return super.groupAndFlattenUpdateDeletedEntities(filesToDeleteMessageInfo);
  }
}
describe('DeleteEventService', () => {
  let service: TestDeleteEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDeleteEventService,
        { provide: SqsService, useValue: mockSqsService },
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
        { provide: FileAssetAccessEntityService, useValue: mockFileAssetAccessEntityService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: RecallTransactionService, useValue: mockRecallTransactionService },
      ],
    }).compile();

    service = module.get<TestDeleteEventService>(TestDeleteEventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('fileDeleteSuccessHandler', () => {
  //   it('should retrieveFileAssetAndCreateDownloadHistory with right params', async () => {

  //   });
  // });

  describe('groupAndFlattenUpdateDeletedEntities', () => {
    it('should return flatten records for oa only transaction', () => {
      expect(service.groupAndFlattenUpdateDeletedEntities(MOCK_OA_ONLY_ACTIVIES_DELETE_MESSAGES)).toEqual({
        transactionIds: new Set([MOCK_TRANSACTION_WITH_OA_ONLY.id]),
        activityFiles: [
          { activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id, fileAssetId: ONLY_OA_FILE_ASSETS[0].id },
          { activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id, fileAssetId: ONLY_OA_FILE_ASSETS[1].id },
        ],
        activityIds: [MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id],
        fileAssetIds: [ONLY_OA_FILE_ASSETS[0].id, ONLY_OA_FILE_ASSETS[1].id],
        toCreateFileAssetHistories: [
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: ONLY_OA_FILE_ASSETS[0].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_OA_FILE_ASSETS[0].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: ONLY_OA_FILE_ASSETS[1].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[1].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_OA_FILE_ASSETS[1].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[1].ownerId,
          },
        ],
        oaCertIdsToExpire: { [`${ONLY_OA_FILE_ASSETS[0].issuerId}`]: new Set([ONLY_OA_FILE_ASSETS[0].oaCertificateId]) },
        activityWithOaIds: [MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id],
      });
    });
    it('should return flatten records for pdf only transaction', () => {
      expect(service.groupAndFlattenUpdateDeletedEntities(MOCK_PDF_ONLY_ACTIVIES_DELETE_MESSAGES)).toEqual({
        transactionIds: new Set([MOCK_TRANSACTION_WITH_PDF_ONLY.id]),
        activityFiles: [
          { activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY.id, fileAssetId: ONLY_PDF_FILE_ASSETS[0].id },
          { activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY.id, fileAssetId: ONLY_PDF_FILE_ASSETS[1].id },
        ],
        activityIds: [MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY.id, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY.id],
        fileAssetIds: [ONLY_PDF_FILE_ASSETS[0].id, ONLY_PDF_FILE_ASSETS[1].id],
        toCreateFileAssetHistories: [
          {
            fileAssetId: ONLY_PDF_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_PDF_FILE_ASSETS[0].issuerId,
            actionToId: ONLY_PDF_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: ONLY_PDF_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_PDF_FILE_ASSETS[1].issuerId,
            actionToId: ONLY_PDF_FILE_ASSETS[1].ownerId,
          },
        ],
        oaCertIdsToExpire: {},
        activityWithOaIds: [],
      });
    });
    it('should return flatten records for single transaction with oa and pdf files', () => {
      expect(service.groupAndFlattenUpdateDeletedEntities(MOCK_OA_AND_PDF_ACTIVIES_DELETE_MESSAGES)).toEqual({
        transactionIds: new Set([MOCK_TRANSACTION_WITH_OA_PDF.id]),
        activityFiles: [
          { activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF.id, fileAssetId: OA_AND_PDF_FILE_ASSETS[0].id },
          { activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF.id, fileAssetId: OA_AND_PDF_FILE_ASSETS[2].id },
          { activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF.id, fileAssetId: OA_AND_PDF_FILE_ASSETS[1].id },
          { activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF.id, fileAssetId: OA_AND_PDF_FILE_ASSETS[3].id },
        ],
        activityIds: [MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF.id, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF.id],
        fileAssetIds: [
          OA_AND_PDF_FILE_ASSETS[0].id,
          OA_AND_PDF_FILE_ASSETS[2].id,
          OA_AND_PDF_FILE_ASSETS[1].id,
          OA_AND_PDF_FILE_ASSETS[3].id,
        ],
        toCreateFileAssetHistories: [
          {
            fileAssetId: OA_AND_PDF_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: OA_AND_PDF_FILE_ASSETS[0].issuerId,
            actionToId: OA_AND_PDF_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: OA_AND_PDF_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: OA_AND_PDF_FILE_ASSETS[0].issuerId,
            actionToId: OA_AND_PDF_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: OA_AND_PDF_FILE_ASSETS[2].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: OA_AND_PDF_FILE_ASSETS[2].issuerId,
            actionToId: OA_AND_PDF_FILE_ASSETS[2].ownerId,
          },
          {
            fileAssetId: OA_AND_PDF_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: OA_AND_PDF_FILE_ASSETS[1].issuerId,
            actionToId: OA_AND_PDF_FILE_ASSETS[1].ownerId,
          },
          {
            fileAssetId: OA_AND_PDF_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: OA_AND_PDF_FILE_ASSETS[1].issuerId,
            actionToId: OA_AND_PDF_FILE_ASSETS[1].ownerId,
          },
          {
            fileAssetId: OA_AND_PDF_FILE_ASSETS[3].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: OA_AND_PDF_FILE_ASSETS[3].issuerId,
            actionToId: OA_AND_PDF_FILE_ASSETS[3].ownerId,
          },
        ],
        oaCertIdsToExpire: { [`${OA_AND_PDF_FILE_ASSETS[0].issuerId}`]: new Set([OA_AND_PDF_FILE_ASSETS[0].oaCertificateId]) },
        activityWithOaIds: [MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_AND_PDF.id, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_AND_PDF.id],
      });
    });
    it('should return flatten records for multiple transactions', () => {
      expect(
        service.groupAndFlattenUpdateDeletedEntities(MOCK_PDF_ONLY_ACTIVIES_DELETE_MESSAGES.concat(MOCK_OA_ONLY_ACTIVIES_DELETE_MESSAGES)),
      ).toEqual({
        transactionIds: new Set([MOCK_TRANSACTION_WITH_PDF_ONLY.id, MOCK_TRANSACTION_WITH_OA_ONLY.id]),
        activityFiles: [
          { activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY.id, fileAssetId: ONLY_PDF_FILE_ASSETS[0].id },
          { activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY.id, fileAssetId: ONLY_PDF_FILE_ASSETS[1].id },
          { activityId: MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id, fileAssetId: ONLY_OA_FILE_ASSETS[0].id },
          { activityId: MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id, fileAssetId: ONLY_OA_FILE_ASSETS[1].id },
        ],
        activityIds: [
          MOCK_ACTIVITY_SEND_TRANSFER_WITH_PDF_ONLY.id,
          MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_PDF_ONLY.id,
          MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id,
          MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id,
        ],
        fileAssetIds: [ONLY_PDF_FILE_ASSETS[0].id, ONLY_PDF_FILE_ASSETS[1].id, ONLY_OA_FILE_ASSETS[0].id, ONLY_OA_FILE_ASSETS[1].id],
        toCreateFileAssetHistories: [
          {
            fileAssetId: ONLY_PDF_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_PDF_FILE_ASSETS[0].issuerId,
            actionToId: ONLY_PDF_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: ONLY_PDF_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_PDF_FILE_ASSETS[1].issuerId,
            actionToId: ONLY_PDF_FILE_ASSETS[1].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: ONLY_OA_FILE_ASSETS[0].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[0].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_OA_FILE_ASSETS[0].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[0].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: ONLY_OA_FILE_ASSETS[1].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[1].ownerId,
          },
          {
            fileAssetId: ONLY_OA_FILE_ASSETS[1].id,
            type: FILE_ASSET_ACTION.DELETE,
            actionById: ONLY_OA_FILE_ASSETS[1].issuerId,
            actionToId: ONLY_OA_FILE_ASSETS[1].ownerId,
          },
        ],
        oaCertIdsToExpire: { [`${ONLY_OA_FILE_ASSETS[0].issuerId}`]: new Set([ONLY_OA_FILE_ASSETS[0].oaCertificateId]) },
        activityWithOaIds: [MOCK_ACTIVITY_SEND_TRANSFER_WITH_OA_ONLY.id, MOCK_ACTIVITY_RECEIVE_TRANSFER_WITH_OA_ONLY.id],
      });
    });
  });
});
