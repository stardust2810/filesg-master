import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockNotificationMessageInput } from '../../../entities/notification-message-input/__mocks__/notification-message-input.mock';
import { createMockNotificationMessageTemplate } from '../../../entities/notification-message-template/__mocks__/notification-message-template.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { NotificationService } from '../notification.service';

export const mockNotificationService: MockService<NotificationService> = {
  processNotifications: jest.fn(),
};

export const mockTransaction = createMockTransaction({
  name: 'mockTransaction',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockTransactionWithoutNotificationMessageInputs = createMockTransaction({
  name: 'mockTransaction',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

const mockLegacyTransaction = createMockTransaction({
  name: 'mockTransaction',
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  customAgencyMessage: {
    email: ['Mock email custom agency message'],
    transaction: ['Mock email custom agency message'],
  },
});

const mockNotficationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockTemplateName',
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  template: ['Mock template'],
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockSgNotifyNotificationMessageInput = createMockNotificationMessageInput({
  notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  notificationMessageTemplate: mockNotficationMessageTemplate,
  transaction: mockTransaction,
  templateInput: {
    mock: 'templateInput',
  },
  templateVersion: 1,
});
mockTransaction.notificationMessageInputs = [mockSgNotifyNotificationMessageInput];

export const mockActivity = createMockActivity({
  id: 1,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockTransaction,
});

export const mockActivityWithoutNotificationMessageInputs = createMockActivity({
  id: 2,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockTransactionWithoutNotificationMessageInputs,
});

export const mockActivityWithLegacyTransaction = createMockActivity({
  id: 3,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockLegacyTransaction,
});
