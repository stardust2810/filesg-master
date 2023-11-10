import { NOTIFICATION_CHANNEL } from '@filesg/common';

import { ApplicationTypeCreationModel } from '../../../../entities/application-type';
import { MockService } from '../../../../typings/common.mock';
import { ApplicationTypeEntityService } from '../application-type.entity.service';
import { createMockApplicationType } from './application-type.mock';

export const mockApplicationTypeEntityService: MockService<ApplicationTypeEntityService> = {
  // Create
  buildApplicationType: jest.fn(),
  insertApplicationTypes: jest.fn(),
  saveApplicationType: jest.fn(),
  saveApplicationTypes: jest.fn(),

  // Read
  retrieveApplicationTypesByCodes: jest.fn(),
  retrieveApplicationTypeByCodeAndEserviceId: jest.fn(),
  retrieveApplicationTypeAndNotificationChannelsByEserviceUserId: jest.fn(),
};

export const mockApplicationTypeUuid = 'mockApplicationType-uuid-1';
export const mockApplicationTypeUuid2 = 'mockApplicationType-uuid-2';

export const mockApplicationType = createMockApplicationType({
  name: 'Netflix Pass',
  code: 'NP',
});

export const mockApplicationTypeModels: ApplicationTypeCreationModel[] = [
  {
    name: 'Netflix Pass',
    code: 'NP',
  },
  {
    name: 'Disney Plus Pass',
    code: 'DPP',
  },
];

export const mockApplicationTypeWithNotificationChannels = [
  {
    code: 'SFI',
    applicationTypeNotifications: [
      { notificationChannel: NOTIFICATION_CHANNEL.EMAIL },
      { notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY },
    ],
  },
];
