import {
  NotificationMessageTemplateAudit,
  NotificationMessageTemplateAuditCreationModel,
} from '../../../../entities/notification-message-template-audit';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockNotificationMessageTemplateAudit = (args: TestCreationModel<NotificationMessageTemplateAuditCreationModel>) => {
  const notificationMessageTemplateAudit = new NotificationMessageTemplateAudit();

  args.id && (notificationMessageTemplateAudit.id = args.id);
  notificationMessageTemplateAudit.template = args.template;
  notificationMessageTemplateAudit.version = args.version;
  notificationMessageTemplateAudit.externalTemplateId = args.externalTemplateId ?? null;
  notificationMessageTemplateAudit.notificationMessageTemplate = args.notificationMessageTemplate;

  return notificationMessageTemplateAudit;
};
