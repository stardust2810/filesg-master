import { MockRepository } from '../../../../typings/common.mock';
import { TransactionEntityRepository } from '../transaction.entity.repository';
import { createMockTransaction } from './transaction.mock';

export const mockTransactionEntityRepository: MockRepository<TransactionEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockTransaction(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }),
  findTransactionWithActivitiesAndOwnersByUuidAndActivityType: jest.fn(),
  findTransactionByFileAssetUuid: jest.fn(),
  findTransactionWithApplicationAndEServiceAndAgencyByUuid: jest.fn(),
  findTransactionsByFileAssetUuids: jest.fn(),
  findPartialTransactionWithStatusInfoByUuidAndUserId: jest.fn(),
  findTransactionsUsingEserviceIds: jest.fn(),
  updateTransaction: jest.fn(),
  updateTransactions: jest.fn(),
  findTransactionAndChildrenUsingUuidAndUserId: jest.fn(),
};
