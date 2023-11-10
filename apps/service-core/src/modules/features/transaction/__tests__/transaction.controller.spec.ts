import { Test, TestingModule } from '@nestjs/testing';

import { mockActivityEntityService } from '../../../entities/activity/__mocks__/activity.entity.service.mock';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileTransactionService } from '../__mocks__/file-transaction.service.mock';
import { mockRecipientService } from '../__mocks__/recipient.service.mock';
import { mockRevokeTransactionService } from '../__mocks__/revoke-transaction.service.mock';
import { mockTransactionService } from '../__mocks__/transaction.service.mock';
import { mockTransactionActivityService } from '../__mocks__/transaction-activity.service.mock';
import { FileTransactionService } from '../file-transaction.service';
import { RecipientService } from '../recipient.service';
import { RevokeTransactionService } from '../revoke-transaction.service';
import { TransactionController } from '../transaction.controller';
import { TransactionService } from '../transaction.service';
import { TransactionActivityService } from '../transaction-activity.service';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: RevokeTransactionService, useValue: mockRevokeTransactionService },
        { provide: ActivityEntityService, useValue: mockActivityEntityService },
        { provide: FileTransactionService, useValue: mockFileTransactionService },
        { provide: TransactionService, useValue: mockTransactionService },
        { provide: RecipientService, useValue: mockRecipientService },
        { provide: TransactionActivityService, useValue: mockTransactionActivityService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFileTransactionForProgrammaticUser', () => {
    it('should be defined', () => {
      expect(controller.createFileTransactionForProgrammaticUser).toBeDefined();
    });
  });
});
