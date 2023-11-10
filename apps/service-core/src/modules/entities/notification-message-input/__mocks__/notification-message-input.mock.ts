import { NotificationMessageInput, NotificationMessageInputCreationModel } from '../../../../entities/notification-message-input';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockNotificationMessageInput = (args: TestCreationModel<NotificationMessageInputCreationModel>) => {
  const notificationMessageInput = new NotificationMessageInput();

  args.id && (notificationMessageInput.id = args.id);
  args.uuid && (notificationMessageInput.uuid = args.uuid);
  notificationMessageInput.notificationChannel = args.notificationChannel;
  notificationMessageInput.notificationMessageTemplate = args.notificationMessageTemplate;
  notificationMessageInput.templateInput = args.templateInput;
  notificationMessageInput.transaction = args.transaction;
  notificationMessageInput.templateVersion = args.templateVersion;

  return notificationMessageInput;
};
