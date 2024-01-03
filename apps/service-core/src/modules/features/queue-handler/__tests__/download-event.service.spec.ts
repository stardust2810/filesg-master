import { FILE_ASSET_ACTION } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EntityManager } from 'typeorm';

import { mockAuditEventEntityService } from '../../../entities/audit-event/__mocks__/audit-event.entity.service.mock';
import { AuditEventEntityService } from '../../../entities/audit-event/audit-event.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockFileAssetHistoryEntityService } from '../../../entities/file-asset-history/__mocks__/file-asset-history.entity.service.mock';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { mockDatabaseTransaction, mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import {
  mockFileAsset1,
  mockFileAsset2,
  mockFileAssetHistoryCreationModel1,
  mockMessage,
  TestDownloadEventService,
} from '../__mocks__/download-event.service.mock';

describe('DownloadEventService', () => {
  let service: TestDownloadEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestDownloadEventService,
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: AuditEventEntityService, useValue: mockAuditEventEntityService },
      ],
    }).compile();

    service = module.get<TestDownloadEventService>(TestDownloadEventService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fileDownloadedHandler', () => {
    it('should retrieveFileAssetAndCreateDownloadHistory with right params', async () => {
      const { entityManager } = mockDatabaseTransaction;
      const mockFileAssetIds = mockMessage.payload.fileAssetIds;

      const retrieveFileAssetAndCreateDownloadHistorySpy = jest.spyOn(service, 'retrieveFileAssetAndCreateDownloadHistory');
      retrieveFileAssetAndCreateDownloadHistorySpy.mockReturnThis();

      await service.fileDownloadedHandler(mockMessage);

      expect(retrieveFileAssetAndCreateDownloadHistorySpy).toBeCalledTimes(mockFileAssetIds.length);
      mockFileAssetIds.forEach((id) => expect(retrieveFileAssetAndCreateDownloadHistorySpy).toBeCalledWith(id, entityManager));
    });
  });

  describe('retrieveFileAssetAndCreateDownloadHistory', () => {
    it('should retrieve file asset with fileAssetId, and create file asset history', async () => {
      const mockFileAssetIds = mockMessage.payload.fileAssetIds;
      const mockFileAssets = [mockFileAsset1, mockFileAsset2];
      const { entityManager } = mockDatabaseTransaction;

      mockFileAssetEntityService.retrieveFileAssetByUuid.mockResolvedValueOnce(mockFileAssets[0]);

      await service.retrieveFileAssetAndCreateDownloadHistory(mockFileAssetIds[0], entityManager as unknown as EntityManager);

      expect(mockFileAssetEntityService.retrieveFileAssetByUuid).toHaveBeenCalledWith(mockFileAssetIds[0], entityManager);
      expect(mockFileAssetHistoryEntityService.saveFileAssetHistory).toHaveBeenCalledWith(
        { type: FILE_ASSET_ACTION.DOWNLOADED, fileAsset: mockFileAssetHistoryCreationModel1.fileAsset },
        entityManager,
      );
    });
  });
});
