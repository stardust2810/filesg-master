import { NOTIFICATION_CHANNEL, NOTIFICATION_TEMPLATE_TYPE } from '@filesg/common';

import { NotificationMessageTemplateAuditCreationModel } from '../../../../entities/notification-message-template-audit';
import { MockService } from '../../../../typings/common.mock';
import { createMockNotificationMessageTemplate } from '../../notification-message-template/__mocks__/notification-message-template.mock';
import { NotificationMessageTemplateAuditEntityService } from '../notification-message-template-audit.entity.service';
import { createMockNotificationMessageTemplateAudit } from './notification-message-template-audit.mock';

const mockNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mock name 1',
  template: [],
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockNotificationMessageTemplateAuditEntityService: MockService<NotificationMessageTemplateAuditEntityService> = {
  // Create
  buildNotificationMessageTemplateAudit: jest.fn(),
  insertNotificationMessageTemplateAudits: jest.fn(),
  saveNotificationMessageTemplateAudit: jest.fn(),
  saveNotificationMessageTemplateAudits: jest.fn(),
};

export const mockNotificationMessageTemplateAudit = createMockNotificationMessageTemplateAudit({
  id: 1,
  notificationMessageTemplate: mockNotificationMessageTemplate,
  template: ['mock-template'],
  version: 1,
});

export const mockNotificationMessageTemplateAuditModels: NotificationMessageTemplateAuditCreationModel[] = [
  {
    notificationMessageTemplate: mockNotificationMessageTemplate,
    template: ['mock-template'],
    version: 1,
  },
  {
    notificationMessageTemplate: mockNotificationMessageTemplate,
    template: ['mock-template'],
    version: 2,
  },
];
