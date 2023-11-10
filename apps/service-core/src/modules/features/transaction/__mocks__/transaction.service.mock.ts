import { MockService } from '../../../../typings/common.mock';
import { TransactionService } from '../transaction.service';

export const mockTransactionService: MockService<TransactionService> = {
  retrieveTransactionStatus: jest.fn(),
};
