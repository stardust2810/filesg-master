import { NotificationMessageTemplate, NotificationMessageTemplateCreationModel } from '../../../../entities/notification-message-template';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockNotificationMessageTemplate = (args: TestCreationModel<NotificationMessageTemplateCreationModel>) => {
  const notificationMessageTemplate = new NotificationMessageTemplate();

  args.id && (notificationMessageTemplate.id = args.id);
  args.uuid && (notificationMessageTemplate.uuid = args.uuid);
  notificationMessageTemplate.name = args.name;
  notificationMessageTemplate.template = args.template;
  notificationMessageTemplate.version = args.version;
  args.requiredFields && (notificationMessageTemplate.requiredFields = args.requiredFields);
  notificationMessageTemplate.type = args.type;
  notificationMessageTemplate.notificationChannel = args.notificationChannel;
  args.integrationType && (notificationMessageTemplate.integrationType = args.integrationType);
  notificationMessageTemplate.audits = args.audits;
  args.externalTemplateId && (notificationMessageTemplate.externalTemplateId = args.externalTemplateId);
  notificationMessageTemplate.notificationMessageInputs = args.notificationMessageInputs;
  notificationMessageTemplate.agency = args.agency;

  return notificationMessageTemplate;
};
