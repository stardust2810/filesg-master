import { MockRepository } from '../../../../typings/common.mock';
import { NotificationMessageTemplateEntityRepository } from '../notification-message-template.entity.repository';
import { createMockNotificationMessageTemplate } from './notification-message-template.mock';

export const mockNotificationMessageTemplateEntityRepository: MockRepository<NotificationMessageTemplateEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockNotificationMessageTemplate(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
  findNotificationMessageTemplateByUuid: jest.fn(),
  findFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels: jest.fn(),
  findNotificationTemplateByUuidAndAgencyIdAndNotificationChannel: jest.fn(),
};
