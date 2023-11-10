import { FILE_FAIL_CATEGORY, FILE_STATUS } from '@filesg/common';
import { RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { FileAsset } from '../../../../entities/file-asset';
import { Transaction } from '../../../../entities/transaction';
import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockFileAsset, mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockEventLogsServiceClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockSqsService } from '../../aws/__mocks__/sqs.service.mock';
import { SqsService } from '../../aws/sqs.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import {
  mockCleanActivityUuid,
  mockCleanFileAssetUuid,
  mockCleanTransaction,
  mockCleanTransactionUuid,
  mockFileSessionId,
  mockScanErrorActivityUuid,
  mockScanErrorFileAssetUuid,
  mockScanErrorTransaction,
  mockScanningActivityUuid,
  mockScanningFileAssetUuid,
  mockScanningTransaction,
  mockVirusActivityUuid,
  mockVirusFileAsset,
  mockVirusFileAssetUuid,
  mockVirusTransaction,
  retrieveActivityWithFileAssetsImplementation,
  retrieveTransactionByFileAssetUuidImplementation,
} from '../__mocks__/post-scan-event.service.mock';
import { PostScanEventService } from '../events/post-scan-event.service';

class TestPostScanEventService extends PostScanEventService {
  public async allCleanHandler(activityUuid: string, transactionUuid: string, fileSessionId: string) {
    super.allCleanHandler(activityUuid, transactionUuid, fileSessionId);
  }

  public async getTransactionScanningStatus(fileAssetUuid: string) {
    return super.getTransactionScanningStatus(fileAssetUuid);
  }

  public async virusOrScanErrorHandler(
    activityUuid: string,
    transaction: Transaction,
    virusFileAssets: FileAsset[],
    scanErrorFileAssets: FileAsset[],
  ) {
    super.virusOrScanErrorHandler(activityUuid, transaction, virusFileAssets, scanErrorFileAssets);
  }

  public async insertRedisForValidation(fileSessionId: string) {
    return super.insertRedisForValidation(fileSessionId);
  }
}

describe('PostScanEventService', () => {
  let service: TestPostScanEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestPostScanEventService,
        { provide: RedisService, useValue: mockFileSGRedisService },
        { provide: SqsService, useValue: mockSqsService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceClientProvider },
      ],
    }).compile();

    service = module.get<TestPostScanEventService>(TestPostScanEventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('scanSuccessHandler', () => {
    it('should be defined', () => {
      expect(service.scanSuccessHandler).toBeDefined();
    });

    it('to update fileAsset with clean status and calls allCleanHandler if all are clean', async () => {
      jest.spyOn(service, 'getTransactionScanningStatus').mockResolvedValueOnce({
        isScanCompleted: true,
        isAllClean: true,
        virusFileAssets: [],
        scanErrorFileAssets: [],
        meta: {
          uploadActivityUuid: mockCleanActivityUuid,
          transaction: mockCleanTransaction,
        },
      });
      jest.spyOn(service, 'allCleanHandler');
      jest.spyOn(service, 'virusOrScanErrorHandler');

      const insertRedisForValidationSpy = jest.spyOn(service, 'insertRedisForValidation');
      insertRedisForValidationSpy.mockResolvedValueOnce('OK');

      const mockStatus = FILE_STATUS.CLEAN;
      await service.scanSuccessHandler(mockCleanFileAssetUuid);

      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(mockCleanFileAssetUuid, { status: mockStatus });
      expect(insertRedisForValidationSpy).toBeCalledWith(mockFileSessionId);
      expect(service.allCleanHandler).toBeCalledWith(mockCleanActivityUuid, mockCleanTransactionUuid, mockFileSessionId);
      expect(service.virusOrScanErrorHandler).toBeCalledTimes(0);
    });

    it('to update fileAsset with clean status and calls virusOrScanErrorHandler if not all are clean', async () => {
      jest.spyOn(service, 'getTransactionScanningStatus').mockResolvedValueOnce({
        isScanCompleted: true,
        isAllClean: false,
        virusFileAssets: [mockFileAsset],
        scanErrorFileAssets: [],
        meta: {
          uploadActivityUuid: mockVirusActivityUuid,
          transaction: mockVirusTransaction,
        },
      });
      jest.spyOn(service, 'allCleanHandler');
      jest.spyOn(service, 'virusOrScanErrorHandler');
      mockTransactionEntityService.retrieveTransactionWithApplicationDetailsByUuid.mockResolvedValue(mockVirusTransaction);

      const insertRedisForValidationSpy = jest.spyOn(service, 'insertRedisForValidation');
      insertRedisForValidationSpy.mockResolvedValueOnce('OK');

      const mockStatus = FILE_STATUS.CLEAN;
      await service.scanSuccessHandler(mockVirusActivityUuid);

      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(mockVirusActivityUuid, { status: mockStatus });
      expect(insertRedisForValidationSpy).toBeCalledWith(mockFileSessionId);
      expect(service.virusOrScanErrorHandler).toBeCalledWith(mockVirusActivityUuid, mockVirusTransaction, [mockFileAsset], []);
      expect(service.allCleanHandler).toBeCalledTimes(0);
    });

    it('to update fileAsset with clean status and return if scan is not completed', async () => {
      jest.spyOn(service, 'getTransactionScanningStatus').mockResolvedValueOnce({
        isScanCompleted: false,
        isAllClean: undefined,
        virusFileAssets: [],
        scanErrorFileAssets: [],
        meta: {
          uploadActivityUuid: mockCleanActivityUuid,
          transaction: mockCleanTransaction,
        },
      });
      jest.spyOn(service, 'allCleanHandler');
      jest.spyOn(service, 'virusOrScanErrorHandler');

      const mockStatus = FILE_STATUS.CLEAN;
      await service.scanSuccessHandler(mockCleanFileAssetUuid);

      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(mockCleanFileAssetUuid, { status: mockStatus });
      expect(service.allCleanHandler).toBeCalledTimes(0);
      expect(service.virusOrScanErrorHandler).toBeCalledTimes(0);
    });
  });

  describe('scanVirusOrErrorHandler', () => {
    it('should be defined', () => {
      expect(service.scanVirusOrErrorHandler).toBeDefined();
    });

    it('should update fileAsset with failed status & virus fail-category and return if scan is not completed', async () => {
      const mockCleanFileAssetUuid = 'mockFileAsset-uuid-1';
      const mockStatus = FILE_STATUS.FAILED;
      const mockFailCategory = FILE_FAIL_CATEGORY.VIRUS;
      const mockFailReason = 'mock virus message';

      jest.spyOn(service, 'virusOrScanErrorHandler');
      jest.spyOn(service, 'getTransactionScanningStatus').mockResolvedValueOnce({
        isScanCompleted: false,
        isAllClean: undefined,
        virusFileAssets: [],
        scanErrorFileAssets: [],
        meta: {
          uploadActivityUuid: mockVirusActivityUuid,
          transaction: mockVirusTransaction,
        },
      });
      mockTransactionEntityService.retrieveTransactionWithApplicationDetailsByUuid.mockResolvedValue(mockVirusTransaction);

      await service.scanVirusOrErrorHandler(mockCleanFileAssetUuid, mockStatus, mockFailCategory, mockFailReason);

      expect(service.virusOrScanErrorHandler).toBeCalledTimes(0);
      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(mockCleanFileAssetUuid, {
        status: mockStatus,
        failCategory: mockFailCategory,
        failReason: mockFailReason,
      });
    });

    it('should update fileAsset with failed status & virus fail-category', async () => {
      const mockCleanFileAssetUuid = 'mockFileAsset-uuid-1';
      const mockStatus = FILE_STATUS.FAILED;
      const mockFailCategory = FILE_FAIL_CATEGORY.VIRUS;
      const mockFailReason = 'mock virus message';

      jest.spyOn(service, 'virusOrScanErrorHandler');
      jest.spyOn(service, 'getTransactionScanningStatus').mockResolvedValueOnce({
        isScanCompleted: true,
        isAllClean: false,
        virusFileAssets: [mockFileAsset],
        scanErrorFileAssets: [],
        meta: {
          uploadActivityUuid: mockVirusActivityUuid,
          transaction: mockVirusTransaction,
        },
      });
      const insertRedisForValidationSpy = jest.spyOn(service, 'insertRedisForValidation');
      insertRedisForValidationSpy.mockResolvedValueOnce('OK');

      await service.scanVirusOrErrorHandler(mockCleanFileAssetUuid, mockStatus, mockFailCategory, mockFailReason);

      expect(insertRedisForValidationSpy).toBeCalledWith(mockFileSessionId);
      expect(service.virusOrScanErrorHandler).toBeCalledWith(mockVirusActivityUuid, mockVirusTransaction, [mockFileAsset], []);
      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(mockCleanFileAssetUuid, {
        status: mockStatus,
        failCategory: mockFailCategory,
        failReason: mockFailReason,
      });
    });

    it('should update fileAsset with failed status & scanError fail-category', async () => {
      const mockCleanFileAssetUuid = 'mockFileAsset-uuid-1';
      const mockStatus = FILE_STATUS.FAILED;
      const mockFailCategory = FILE_FAIL_CATEGORY.SCAN_ERROR;
      const mockFailReason = 'mock scan error message';

      jest.spyOn(service, 'virusOrScanErrorHandler');
      jest.spyOn(service, 'getTransactionScanningStatus').mockResolvedValueOnce({
        isScanCompleted: true,
        isAllClean: false,
        virusFileAssets: [],
        scanErrorFileAssets: [],
        meta: {
          uploadActivityUuid: mockVirusActivityUuid,
          transaction: mockVirusTransaction,
        },
      });
      const insertRedisForValidationSpy = jest.spyOn(service, 'insertRedisForValidation');
      insertRedisForValidationSpy.mockResolvedValueOnce('OK');

      await service.scanVirusOrErrorHandler(mockCleanFileAssetUuid, mockStatus, mockFailCategory, mockFailReason);

      expect(mockFileAssetEntityService.updateFileAssetStatus).toBeCalledWith(mockCleanFileAssetUuid, {
        status: mockStatus,
        failCategory: mockFailCategory,
        failReason: mockFailReason,
      });
      expect(insertRedisForValidationSpy).toBeCalledWith(mockFileSessionId);
      expect(service.virusOrScanErrorHandler).toBeCalledWith(mockVirusActivityUuid, mockVirusTransaction, [], []);
    });
  });

  describe('getTransactionScanningStatus', () => {
    beforeEach(() => {
      mockActivityEntityService.retrieveActivityWithFileAssetsByUuid.mockImplementation(retrieveActivityWithFileAssetsImplementation);
      mockTransactionEntityService.retrieveTransactionByFileAssetUuid.mockImplementation(retrieveTransactionByFileAssetUuidImplementation);
    });

    it('should be defined', () => {
      expect(service.getTransactionScanningStatus).toBeDefined();
    });

    it('if not all file asset are scanned', async () => {
      const { isScanCompleted, isAllClean, virusFileAssets, meta } = await service.getTransactionScanningStatus(mockScanningFileAssetUuid);

      expect(isScanCompleted).toEqual(false);
      expect(isAllClean).toBeUndefined();
      expect(virusFileAssets).toEqual([]);
      expect(meta).toEqual({
        transaction: mockScanningTransaction,
        uploadActivityUuid: mockScanningActivityUuid,
      });
    });

    it('if scan is complete and all files are clean', async () => {
      const { isScanCompleted, isAllClean, virusFileAssets, meta } = await service.getTransactionScanningStatus(mockCleanFileAssetUuid);

      expect(isScanCompleted).toEqual(true);
      expect(isAllClean).toEqual(true);
      expect(virusFileAssets).toEqual([]);
      expect(meta).toEqual({
        transaction: mockCleanTransaction,
        uploadActivityUuid: mockCleanActivityUuid,
      });
    });

    it('if scan is complete and some virus files', async () => {
      const { isScanCompleted, isAllClean, virusFileAssets, meta } = await service.getTransactionScanningStatus(mockVirusFileAssetUuid);

      expect(isScanCompleted).toEqual(true);
      expect(isAllClean).toEqual(false);
      expect(virusFileAssets).toEqual([mockVirusFileAsset]);
      expect(meta).toEqual({
        transaction: mockVirusTransaction,
        uploadActivityUuid: mockVirusActivityUuid,
      });
    });

    it('if scan is complete and some scan error files', async () => {
      const { isScanCompleted, isAllClean, virusFileAssets, meta } = await service.getTransactionScanningStatus(mockScanErrorFileAssetUuid);

      expect(isScanCompleted).toEqual(true);
      expect(isAllClean).toEqual(false);
      expect(virusFileAssets).toEqual([]);
      expect(meta).toEqual({
        transaction: mockScanErrorTransaction,
        uploadActivityUuid: mockScanErrorActivityUuid,
      });
    });
  });
});
