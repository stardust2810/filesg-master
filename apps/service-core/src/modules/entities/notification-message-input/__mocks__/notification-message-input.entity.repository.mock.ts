import { MockRepository } from '../../../../typings/common.mock';
import { NotificationMessageInputEntityRepository } from '../notification-message-input.entity.repository';
import { createMockNotificationMessageInput } from './notification-message-input.mock';

export const mockNotificationMessageInputEntityRepository: MockRepository<NotificationMessageInputEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockNotificationMessageInput(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
};
