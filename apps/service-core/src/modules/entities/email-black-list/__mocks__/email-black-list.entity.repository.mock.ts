import { MockRepository } from '../../../../typings/common.mock';
import { EmailBlackListEntityRepository } from '../email-black-list.entity.repository';

export const mockEmailBlackListEntityRepository: MockRepository<EmailBlackListEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    findOne: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
  }),
  upsertByEmail: jest.fn(),
};
