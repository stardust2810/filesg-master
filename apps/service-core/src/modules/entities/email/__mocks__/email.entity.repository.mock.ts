import { MockRepository } from '../../../../typings/common.mock';
import { EmailEntityRepository } from '../email.entity.repository';
import { createMockEmail } from './email.mock';

export const mockEmailEntityRepository: MockRepository<EmailEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockEmail(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }),
  findEmailByAwsMessageId: jest.fn(),
  findEmailWithTransactionInfoByAwsMessageId: jest.fn(),
  findEmailRecordByActivityID: jest.fn(),
};
