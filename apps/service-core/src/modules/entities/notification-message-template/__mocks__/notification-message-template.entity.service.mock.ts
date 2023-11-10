import { NOTIFICATION_CHANNEL, NOTIFICATION_TEMPLATE_TYPE, TemplateUpdateRequest } from '@filesg/common';

import { NotificationMessageTemplateCreationModel } from '../../../../entities/notification-message-template';
import { MockService } from '../../../../typings/common.mock';
import { createMockApplicationType } from '../../application-type/__mocks__/application-type.mock';
import { createMockApplicationTypeNotification } from '../../application-type-notification/__mocks__/application-type-notification.mock';
import { NotificationMessageTemplateEntityService } from '../notification-message-template.entity.service';
import { createMockNotificationMessageTemplate } from './notification-message-template.mock';

const mockApplicationType = createMockApplicationType({
  id: 1,
  uuid: 'applicationType-uuid-1',
  name: 'Long Term Visit Pass',
  code: 'LTVP',
});

const mockApplicationTypeNotification = createMockApplicationTypeNotification({
  id: 1,
  applicationType: mockApplicationType,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

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
  version: 1,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockNotificationMessageTemplateModels: NotificationMessageTemplateCreationModel[] = [
  {
    name: 'mock name 1',
    template: ['mock-template-1'],
    type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
    version: 1,
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  },
  {
    name: 'mock name 2',
    template: ['mock-template-2'],
    type: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
    version: 1,
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  },
];

export const mockNotificationMessageTemplateUpdateRequest: TemplateUpdateRequest = {
  uuid: 'mock-uuid-1',
  template: ['mock-template'],
};
