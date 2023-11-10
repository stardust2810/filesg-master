import { MockRepository } from '../../../../typings/common.mock';
import { EserviceUserEntityRepository } from '../eservice-user.entity.repository';
import { createMockEserviceUser } from './user.mock';

export const mockEserviceUserEntityRepository: MockRepository<EserviceUserEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockEserviceUser(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
  }),
  findEserviceUserByActiveWhitelistEmail: jest.fn(),
  findEserviceUsersWithAgencyAndEserviceByWhitelistedEmails: jest.fn(),
  findEserviceUserWithWhitelistedEmailsByAgencyCodeAndEserviceName: jest.fn(),
};
