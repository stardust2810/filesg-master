import { EntityManager } from 'typeorm';

import { MockService } from '../../../../typings/common.mock';
import { DatabaseTransactionService } from '../db-transaction.service';

export const mockDatabaseTransaction = {
  entityManager: 'mockEntityManager' as unknown as EntityManager,
  commit: jest.fn(),
  rollback: jest.fn(),
};
export const mockDatabaseTransactionService: MockService<DatabaseTransactionService> = {
  startTransaction: jest.fn().mockResolvedValue(mockDatabaseTransaction),
};
