import { MockRepository } from '../../../../../typings/common.mock';
import { CorporateUserEntityRepository } from '../../corporate-user/corporate-user.entity.repository';

export const mockCorporateUserEntityRepository: MockRepository<CorporateUserEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest.fn(),
    insert: jest.fn(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
    update: jest.fn(),
  }),
};
