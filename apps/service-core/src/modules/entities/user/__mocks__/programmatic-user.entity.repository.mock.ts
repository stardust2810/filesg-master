import { MockRepository } from '../../../../typings/common.mock';
import { ProgrammaticUserEntityRepository } from '../programmatic-user.entity.repository';
import { createMockProgrammaticUser } from './user.mock';

export const mockProgrammaticUserEntityRepository: MockRepository<ProgrammaticUserEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockProgrammaticUser(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }),
  findByEServiceUuid: jest.fn(),
  findAllEservicesProgrammaticUsersByUserId: jest.fn(),
};
