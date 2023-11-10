import { Activity } from '../../../entities/activity';
import { NotificationMessageInput } from '../../../entities/notification-message-input';
import { NotificationTypeOptions } from '../../../typings/common';

export abstract class BaseNotificationService {
  abstract sendNotification(
    activity: Activity,
    notificationMessageInput: NotificationMessageInput | null, //TODO: nullable for legacy email sending
    notificationOptions?: NotificationTypeOptions,
  ): Promise<void>;
}
