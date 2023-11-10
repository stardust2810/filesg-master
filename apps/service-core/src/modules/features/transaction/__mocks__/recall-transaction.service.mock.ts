import { TRANSACTION_CREATION_METHOD, TRANSACTION_STATUS, TRANSACTION_TYPE } from '@filesg/common';
import { EntityManager } from 'typeorm';

import { Transaction } from '../../../../entities/transaction';
import { RecallTransactionSuccessEmailActivityInfo } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { mockTransactionWithActivityAndFileAssets } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { RecallTransactionService, UserActivityInfo } from '../recall-transaction.service';

export const mockRecallTransactionService: MockService<RecallTransactionService> = {
  recallTransaction: jest.fn(),
  recallTransactionSuccessEmailToAgency: jest.fn(),
};

export class TestRecallTransactionService extends RecallTransactionService {
  public getUserActivityAndValidFileAssets(transaction: Transaction) {
    return super.getUserActivityAndValidFileAssets(transaction);
  }

  public createRecallTransaction(
    parentTransaction: Transaction,
    eserviceUserId: number,
    creationMethod: TRANSACTION_CREATION_METHOD = TRANSACTION_CREATION_METHOD.API,
    entityManager: EntityManager,
  ) {
    return super.createRecallTransaction(parentTransaction, eserviceUserId, creationMethod, entityManager);
  }

  public createRecallActivities(
    transaction: Transaction,
    usersFileAssets: Map<number, UserActivityInfo>,
    eserviceUserId: number,
    entityManager: EntityManager,
  ) {
    return super.createRecallActivities(transaction, usersFileAssets, eserviceUserId, entityManager);
  }

  public updateTransactionsAndActivitiesStatus(parentTransaction: Transaction, entityManager: EntityManager) {
    return super.updateTransactionsAndActivitiesStatus(parentTransaction, entityManager);
  }

  public updateFileAssetStatus(usersFileAssets: Map<number, UserActivityInfo>, entityManager: EntityManager) {
    return super.updateFileAssetStatus(usersFileAssets, entityManager);
  }

  public recallTransactionSuccessEmailToAgency(recallTransactionSuccessEmailActivityInfos: RecallTransactionSuccessEmailActivityInfo[]) {
    return super.recallTransactionSuccessEmailToAgency(recallTransactionSuccessEmailActivityInfos);
  }
}

export const mockRecallTransactionResponse = createMockTransaction({
  id: 2,
  uuid: `mock-recall-transaction-uuid-1`,
  type: TRANSACTION_TYPE.RECALL,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.INIT,
  name: `Recall transaction: ${mockTransactionWithActivityAndFileAssets.uuid}`,
  applicationId: 1,
});
