import { NOTIFICATION_CHANNEL } from '@filesg/common';

import { ApplicationTypeNotificationCreationModel } from '../../../../entities/application-type-notification';
import { MockService } from '../../../../typings/common.mock';
import { createMockApplicationType } from '../../application-type/__mocks__/application-type.mock';
import { ApplicationTypeNotificationEntityService } from '../application-type-notification.entity.service';
import { createMockApplicationTypeNotification } from './application-type-notification.mock';

const mockApplicationType = createMockApplicationType({
  id: 1,
  uuid: 'applicationType-uuid-1',
  name: 'Long Term Visit Pass',
  code: 'LTVP',
});

export const mockApplicationTypeNotificationEntityService: MockService<ApplicationTypeNotificationEntityService> = {
  // Create
  buildApplicationTypeNotification: jest.fn(),
  insertApplicationTypeNotifications: jest.fn(),
  saveApplicationTypeNotification: jest.fn(),
  saveApplicationTypeNotifications: jest.fn(),
  // Read
  retrieveNotificationChannelsForApplicationType: jest.fn(),
  retrieveNotificationChannelsForApplicationTypeByCodeAndEserviceUserId: jest.fn(),
};

export const mockApplicationTypeNotification = createMockApplicationTypeNotification({
  id: 1,
  applicationType: mockApplicationType,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockApplicationTypeNotificationModels: ApplicationTypeNotificationCreationModel[] = [
  {
    applicationType: mockApplicationType,
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  },
  {
    applicationType: mockApplicationType,
    notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  },
];
