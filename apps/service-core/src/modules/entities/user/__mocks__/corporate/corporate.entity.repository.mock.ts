import { MockRepository } from '../../../../../typings/common.mock';
import { CorporateEntityRepository } from '../../corporate/corporate.entity.repository';

export const mockCorporateEntityRepository: MockRepository<CorporateEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest.fn(),
    insert: jest.fn(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn(),
  }),
};
