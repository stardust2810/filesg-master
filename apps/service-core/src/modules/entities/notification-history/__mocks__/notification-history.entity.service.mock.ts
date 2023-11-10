import { ACTIVITY_STATUS, ACTIVITY_TYPE, NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '@filesg/common';

import { NotificationHistoryCreationModel } from '../../../../entities/notification-history';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../activity/__mocks__/activity.mock';
import { NotificationHistoryEntityService } from '../notification-history.entity.service';
import { createMockNotificationHistory } from './notification-history.mock';

export const mockActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
});

export const mockNotificationHistoryUuid = 'mockNotificationHistory-uuid-1';
export const mockNotificationHistoryUuid2 = 'mockNotificationHistory-uuid-2';

export const mockNotificationHistoryEntityService: MockService<NotificationHistoryEntityService> = {
  // Create
  buildNotificationHistory: jest.fn(),
  insertNotificationHistories: jest.fn(),
  saveNotificationHistory: jest.fn(),
  saveNotificationHistories: jest.fn(),
  retrieveNotificationHistoryByMessageId: jest.fn(),
  retrieveNonSuccessNotificationHistoriesByIds: jest.fn(),
  retrieveNonSuccessNotificationHistoryByDateRange: jest.fn(),
  retrieveNotificationHistoryWithTransactionByMessageId: jest.fn(),
  updateNotificationHistoryByMessageId: jest.fn(),
};

export const mockNotificationHistory = createMockNotificationHistory({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.SUCCESS,
  activity: mockActivity,
});

export const mockNotificationHistoryModels: NotificationHistoryCreationModel[] = [
  {
    notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
    status: NOTIFICATION_STATUS.SUCCESS,
    activity: mockActivity,
  },
  {
    notificationChannel: NOTIFICATION_CHANNEL.SG_NOTIFY,
    status: NOTIFICATION_STATUS.SUCCESS,
    activity: mockActivity,
  },
];
