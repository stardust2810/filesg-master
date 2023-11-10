import { Test, TestingModule } from '@nestjs/testing';

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
import { mockDatabaseTransactionService } from '../../../setups/database/__mocks__/db-transaction.service.mock';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { mockDeletionService } from '../../deletion/__mocks__/deletion.service.mock';
import { DeletionService } from '../../deletion/deletion.service';
import { mockFileAsset } from '../../file/__mocks__/file.service.mock';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import { AgencyDeleteDocumentsService } from '../agency-delete-docs.service';

describe('AgencyDeleteDocumentsService', () => {
  let service: AgencyDeleteDocumentsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgencyDeleteDocumentsService,
        { provide: EmailService, useValue: mockEmailService },
        { provide: OaCertificateEntityService, useValue: mockOaCertificateEntityService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: FileAssetHistoryEntityService, useValue: mockFileAssetHistoryEntityService },
        { provide: DatabaseTransactionService, useValue: mockDatabaseTransactionService },
        { provide: DeletionService, useValue: mockDeletionService },
      ],
    }).compile();

    service = module.get<AgencyDeleteDocumentsService>(AgencyDeleteDocumentsService);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should not call deletion service when there are not files', async () => {
    mockFileAssetEntityService.retrieveFileAssetsByStatusesAndDeleteAt.mockResolvedValue([]);

    await service.agencyDeleteDocuments();
    expect(mockDeletionService.agencyDeleteFileAssets).not.toBeCalled();
  });

  it('should call deletion service when there are files that should be deleted', async () => {
    mockFileAssetEntityService.retrieveFileAssetsByStatusesAndDeleteAt.mockResolvedValueOnce([mockFileAsset]).mockResolvedValueOnce([]);

    await service.agencyDeleteDocuments();
    expect(mockDeletionService.agencyDeleteFileAssets).toBeCalledWith([mockFileAsset]);
  });
});
