import { NOTIFICATION_CHANNEL, NOTIFICATION_TEMPLATE_TYPE, NotificationTemplateUpdateRequest } from '@filesg/common';

import { NotificationMessageTemplateCreationModel } from '../../../../entities/notification-message-template';
import { MockService } from '../../../../typings/common.mock';
import { NotificationMessageTemplateEntityService } from '../notification-message-template.entity.service';
import { createMockNotificationMessageTemplate } from './notification-message-template.mock';

export const mockNotificationMessageTemplateUuid = 'mockNotificationMessageTemplate-uuid-1';
export const mockNotificationMessageTemplateUuid2 = 'mockNotificationMessageTemplate-uuid-2';

export const mockNotificationMessageTemplateEntityService: MockService<NotificationMessageTemplateEntityService> = {
  // Create
  buildNotificationMessageTemplate: jest.fn(),
  insertNotificationMessageTemplates: jest.fn(),
  saveNotificationMessageTemplate: jest.fn(),
  saveNotificationMessageTemplates: jest.fn(),
  // Read
  retrieveNotificationMessageTemplateByUuid: jest.fn(),
  retrieveNotificationTemplateUsingUuidAgencyIdAndNotificationChannel: jest.fn(),
  retrieveFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels: jest.fn(),
  // Update
  updateNotificationMessageTemplate: jest.fn(),
};

export const mockNotificationMessageTemplate = createMockNotificationMessageTemplate({
  uuid: 'mock-uuid-1',
  name: 'mock name 1',
  template: ['mock-template'],
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockNotificationMessageTemplateModels: NotificationMessageTemplateCreationModel[] = [
  {
    name: 'mock name 1',
    template: ['mock-template-1'],
    type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  },
  {
    name: 'mock name 2',
    template: ['mock-template-2'],
    type: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  },
];

export const mockNotificationMessageTemplateUpdateRequest: NotificationTemplateUpdateRequest = {
  uuid: 'mock-uuid-1',
  template: ['mock-template'],
};
