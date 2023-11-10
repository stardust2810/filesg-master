import { MockRepository } from '../../../../typings/common.mock';
import { TransactionCustomMessageTemplateEntityRepository } from '../transaction-custom-message-template.entity.repository';
import { createMockTransactionCustomMessageTemplate } from './transaction-custom-message-template.mock';

export const mockTransactionCustomMessageTemplateEntityRepository: MockRepository<TransactionCustomMessageTemplateEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockTransactionCustomMessageTemplate(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
  findTransactionCustomMessageTemplate: jest.fn(),
  findFormsgTransactionCustomMessageTemplatesByEserviceUserId: jest.fn(),
  updateTransactionCustomMessageTemplate: jest.fn(),
};
