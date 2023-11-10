import { Test, TestingModule } from '@nestjs/testing';

import { mockFileTransactionV2Service } from '../__mocks__/file-transaction.v2.service.mock';
import { mockRecallTransactionService } from '../__mocks__/recall-transaction.service.mock';
import { FileTransactionV2Service } from '../file-transaction.v2.service';
import { RecallTransactionService } from '../recall-transaction.service';
import { TransactionV2Controller } from '../transaction.v2.controller';

describe('TransactionController', () => {
  let controller: TransactionV2Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionV2Controller],
      providers: [
        { provide: FileTransactionV2Service, useValue: mockFileTransactionV2Service },
        { provide: RecallTransactionService, useValue: mockRecallTransactionService },
      ],
    }).compile();

    controller = module.get<TransactionV2Controller>(TransactionV2Controller);
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
