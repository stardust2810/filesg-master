import { MockRepository } from '../../../../typings/common.mock';
import { NotificationMessageTemplateAuditEntityRepository } from '../notification-message-template-audit.entity.repository';
import { createMockNotificationMessageTemplateAudit } from './notification-message-template-audit.mock';

export const mockNotificationMessageTemplateAuditEntityRepository: MockRepository<NotificationMessageTemplateAuditEntityRepository> = {
  getRepository: jest.fn().mockReturnValue({
    create: jest
      .fn()
      .mockReturnThis()
      .mockImplementation((arg) => createMockNotificationMessageTemplateAudit(arg)),
    insert: jest.fn().mockReturnThis(),
    save: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
  }),
};
