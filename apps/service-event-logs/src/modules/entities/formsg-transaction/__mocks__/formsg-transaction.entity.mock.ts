import { FormSgTransaction, FormSgTransactionKey } from '../../../../entities/formsg-transaction';
import { MockService } from '../../../../typings/common.mock';
import { generateDdbModelMock } from '../../../../utils/testing';
import { FormSgTransactionEntityService } from '../formsg-transaction.entity.service';

export const mockFormSgTransactionEntityService: MockService<FormSgTransactionEntityService> = {
  createFormSgTransaction: jest.fn(),
  batchPutFormSgTransactions: jest.fn(),
  findFormSgTransaction: jest.fn(),
  findFormSgTransactions: jest.fn(),
  findFormSgTransactionsByTransactionUuid: jest.fn(),
  findFormSgBatchTransactionsByBatchId: jest.fn(),
  updateFormSgTransaction: jest.fn(),
  updateFormSgTransactionByTransactionUuid: jest.fn(),
  deleteFormSgTransaction: jest.fn(),
  deleteFormSgTransactions: jest.fn(),
};
export const mockFormSgTransactionModel = generateDdbModelMock<FormSgTransaction, FormSgTransactionKey>();

export const mockTransactionUuid = 'mock-txn-uuid-1';
export const mockFormSgTransaction = new FormSgTransaction();
export const mockFormSgTransaction2 = new FormSgTransaction();
export const mockFormSgTransactions = [mockFormSgTransaction, mockFormSgTransaction2];
