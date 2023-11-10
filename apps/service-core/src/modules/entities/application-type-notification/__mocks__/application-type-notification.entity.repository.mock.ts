import { MockRepository } from '../../../../typings/common.mock';
import { ApplicationTypeNotificationEntityRepository } from '../application-type-notification.entity.repository';
import { createMockApplicationTypeNotification } from './application-type-notification.mock';

export const mockApplicationTypeNotificationEntityRepository: MockRepository<ApplicationTypeNotificationEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockApplicationTypeNotification(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
  findNotificationChannelsForApplicationType: jest.fn(),
  findNotificationChannelsForApplicationTypeByCodeAndEserviceUserId: jest.fn(),
};
