import { Test, TestingModule } from '@nestjs/testing';

import { FileAsset } from '../../../../entities/file-asset';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
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
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { mockNotificationService } from '../../notification/__mocks__/notification.service.mock';
import { EmailService } from '../../notification/email.service';
import { NotificationService } from '../../notification/notification.service';
import {
  MOCK_APPLICATION_1,
  MOCK_OA_CERT_UUID_1,
  MOCK_OA_CERT_UUID_2,
  MOCK_TRANSACTION_1,
  MOCK_TRANSACTION_2,
  MULTIPLE_TRANSACTIONS_MULTIPLE_FILES,
  SINGLE_TRANSACTION_SINGLE_FILE,
} from '../__mocks__/expire-docs.service.mock';
import { ExpireDocumentsService } from '../expire-docs.service';

class TestExpireDocumentsService extends ExpireDocumentsService {
  public groupAndFlattenExpiringFileAssets(fileAssets: FileAsset[]) {
    return super.groupAndFlattenExpiringFileAssets(fileAssets);
  }
}

describe('ExpireDocumentsService', () => {
  let service: TestExpireDocumentsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestExpireDocumentsService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    }).compile();

    service = module.get<TestExpireDocumentsService>(TestExpireDocumentsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('groupAndFlattenExpiringFileAssets', () => {
    it('Files in single transaction is expiring (1 recipient)', () => {
      expect(service.groupAndFlattenExpiringFileAssets(SINGLE_TRANSACTION_SINGLE_FILE)).toEqual({
        '3001': {
          application: MOCK_APPLICATION_1,
          issuanceTransaction: MOCK_TRANSACTION_1,
          issuerFileAssetIds: [5001],
          recipients: {
            '4': {
              activityRecipientInfo: {
                name: 'John',
                dob: '1980-01-01',
                mobile: '+659876532',
                email: 'myemail@myemail.com',
                failedAttempts: 0,
              },
              fileAssetId: [5002],
            },
          },
          oaCertIdToExpire: [MOCK_OA_CERT_UUID_1],
          allFileAssetIds: [5001, 5002],
          toCreatefileAssetHistories: [
            { fileAssetId: 5001, type: 'expire', actionById: 3, actionToId: 3 },
            { fileAssetId: 5002, type: 'expire', actionById: 3, actionToId: 4 },
          ],
        },
      });
    });

    it('Files in multiple transaction is expiring (multiple recipients)', () => {
      expect(service.groupAndFlattenExpiringFileAssets(MULTIPLE_TRANSACTIONS_MULTIPLE_FILES)).toEqual({
        '3001': {
          application: MOCK_APPLICATION_1,
          issuanceTransaction: MOCK_TRANSACTION_1,
          issuerFileAssetIds: [5001],
          recipients: {
            '4': {
              activityRecipientInfo: {
                name: 'John',
                dob: '1980-01-01',
                mobile: '+659876532',
                email: 'myemail@myemail.com',
                failedAttempts: 0,
              },
              fileAssetId: [5002],
            },
          },
          oaCertIdToExpire: [MOCK_OA_CERT_UUID_1],
          allFileAssetIds: [5001, 5002],
          toCreatefileAssetHistories: [
            { fileAssetId: 5001, type: 'expire', actionById: 3, actionToId: 3 },
            { fileAssetId: 5002, type: 'expire', actionById: 3, actionToId: 4 },
          ],
        },
        '3002': {
          application: MOCK_APPLICATION_1,
          issuanceTransaction: MOCK_TRANSACTION_2,
          issuerFileAssetIds: [5003],
          recipients: {
            '4': {
              activityRecipientInfo: {
                name: 'John',
                dob: '1980-01-01',
                mobile: '+659876532',
                email: 'myemail@myemail.com',
                failedAttempts: 0,
              },
              fileAssetId: [5004],
            },
            '5': {
              activityRecipientInfo: {
                name: 'Kopi Ma',
                dob: '1985-01-01',
                mobile: '+6512345678',
                email: 'myemail2@myemail.com',
                failedAttempts: 0,
              },
              fileAssetId: [5005],
            },
          },
          oaCertIdToExpire: [MOCK_OA_CERT_UUID_2],
          allFileAssetIds: [5003, 5004, 5005],
          toCreatefileAssetHistories: [
            { fileAssetId: 5003, type: 'expire', actionById: 3, actionToId: 3 },
            { fileAssetId: 5004, type: 'expire', actionById: 3, actionToId: 4 },
            { fileAssetId: 5005, type: 'expire', actionById: 3, actionToId: 5 },
          ],
        },
      });
    });
  });
});
