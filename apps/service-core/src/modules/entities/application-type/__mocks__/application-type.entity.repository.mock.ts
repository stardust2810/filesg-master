import { MockRepository } from '../../../../typings/common.mock';
import { ApplicationTypeEntityRepository } from '../application-type.entity.repository';
import { createMockApplicationType } from './application-type.mock';

export const mockApplicationTypeEntityRepository: MockRepository<ApplicationTypeEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockApplicationType(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
  findApplicationTypeByCodeAndEserviceId: jest.fn(),
  findApplicationTypesAndNotificationChannelsByEserviceUserId: jest.fn(),
};
