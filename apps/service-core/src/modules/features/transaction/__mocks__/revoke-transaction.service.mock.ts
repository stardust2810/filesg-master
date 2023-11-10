import { MockService } from '../../../../typings/common.mock';
import { RevokeTransactionService } from '../revoke-transaction.service';

export const mockRevokeTransactionService: MockService<RevokeTransactionService> = {
  createRevokeTransaction: jest.fn(),
};
