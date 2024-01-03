import { Test, TestingModule } from '@nestjs/testing';

import { mockTransactionActivityService } from '../__mocks__/transaction-activity.service.mock';
import { CorppassTransactionController } from '../transaction.corppass.controller';
import { TransactionActivityService } from '../transaction-activity.service';

describe('CorppassTransactionController', () => {
  let controller: CorppassTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorppassTransactionController],
      providers: [{ provide: TransactionActivityService, useValue: mockTransactionActivityService }],
    }).compile();

    controller = module.get<CorppassTransactionController>(CorppassTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('retrieveCorppassActivities', () => {
    it('should be defined', () => {
      expect(controller.retrieveCorppassActivities).toBeDefined();
    });
  });

  describe('retrieveCorppassActivityDetails', () => {
    it('should be defined', () => {
      expect(controller.retrieveCorppassActivityDetails).toBeDefined();
    });
  });
});
