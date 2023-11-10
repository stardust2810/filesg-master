import { NotificationHistory, NotificationHistoryCreationModel } from '../../../../entities/notification-history';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockNotificationHistory = (args: TestCreationModel<NotificationHistoryCreationModel>) => {
  const notificationHistory = new NotificationHistory();

  args.id && (notificationHistory.id = args.id);
  args.uuid && (notificationHistory.uuid = args.uuid);
  notificationHistory.notificationChannel = args.notificationChannel;
  notificationHistory.status = args.status;
  notificationHistory.activity = args.activity;

  return notificationHistory;
};
