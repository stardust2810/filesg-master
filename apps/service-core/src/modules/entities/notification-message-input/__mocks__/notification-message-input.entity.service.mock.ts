import {
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { NotificationMessageInputCreationModel } from '../../../../entities/notification-message-input';
import { MockService } from '../../../../typings/common.mock';
import { createMockNotificationMessageTemplate } from '../../notification-message-template/__mocks__/notification-message-template.mock';
import { createMockTransaction } from '../../transaction/__mocks__/transaction.mock';
import { NotificationMessageInputEntityService } from '../notification-message-input.entity.service';
import { createMockNotificationMessageInput } from './notification-message-input.mock';

const mockNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mock name 1',
  template: [],
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

const mockTransaction = createMockTransaction({
  name: 'transaction-1',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockNotificationMessageInputUuid = 'mockNotificationMessageInput-uuid-1';
export const mockNotificationMessageInputUuid2 = 'mockNotificationMessageInput-uuid-2';

export const mockNotificationMessageInputEntityService: MockService<NotificationMessageInputEntityService> = {
  // Create
  buildNotificationMessageInput: jest.fn(),
  insertNotificationMessageInputs: jest.fn(),
  saveNotificationMessageInput: jest.fn(),
  saveNotificationMessageInputs: jest.fn(),
};

export const mockNotificationMessageInput = createMockNotificationMessageInput({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  notificationMessageTemplate: mockNotificationMessageTemplate,
  templateInput: null,
  templateVersion: 1,
  transaction: mockTransaction,
});

export const mockNotificationMessageInputModels: NotificationMessageInputCreationModel[] = [
  {
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
    notificationMessageTemplate: mockNotificationMessageTemplate,
    templateInput: null,
    templateVersion: 1,
    transaction: mockTransaction,
  },
  {
    notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
    notificationMessageTemplate: mockNotificationMessageTemplate,
    templateInput: null,
    templateVersion: 1,
    transaction: mockTransaction,
  },
];
