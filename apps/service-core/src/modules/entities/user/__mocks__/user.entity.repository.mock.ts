import { MockRepository } from '../../../../typings/common.mock';
import { UserEntityRepository } from '../user.entity.repository';

export const mockUserEntityRepository: MockRepository<UserEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    findOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }),
  findUserWithEserviceAndAgencyById: jest.fn(),
  findCountOnboardedCitizenUserTotalAndWithIssuedDocument: jest.fn(),
};
