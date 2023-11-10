import { ApplicationTypeNotification, ApplicationTypeNotificationCreationModel } from '../../../../entities/application-type-notification';
import { TestCreationModel } from '../../../../typings/common.mock';

export const createMockApplicationTypeNotification = (args: TestCreationModel<ApplicationTypeNotificationCreationModel>) => {
  const applicationTypeNotification = new ApplicationTypeNotification();

  args.id && (applicationTypeNotification.id = args.id);
  applicationTypeNotification.notificationChannel = args.notificationChannel;
  applicationTypeNotification.applicationType = args.applicationType;

  return applicationTypeNotification;
};
