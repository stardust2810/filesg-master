import { MockRepository } from '../../../../typings/common.mock';
import { CitizenUserEntityRepository } from '../citizen-user.entity.repository';
import { createMockCitizenUser } from './user.mock';

export const mockCitizenUserEntityRepository: MockRepository<CitizenUserEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockCitizenUser(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }),
};
