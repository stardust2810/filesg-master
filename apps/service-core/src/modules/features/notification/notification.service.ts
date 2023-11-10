import { NOTIFICATION_CHANNEL } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { NotificationTypeOptions } from '../../../typings/common';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { EmailService } from './email.service';
import { BaseNotificationService } from './notification.class';
import { SgNotifyService } from './sg-notify.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private notificationServiceMap = {} as Record<NOTIFICATION_CHANNEL, BaseNotificationService>;

  constructor(
    private readonly emailService: EmailService,
    private readonly sgNotifyService: SgNotifyService,
    private readonly activityEntityService: ActivityEntityService,
  ) {
    this.notificationServiceMap[NOTIFICATION_CHANNEL.EMAIL] = this.emailService;
    this.notificationServiceMap[NOTIFICATION_CHANNEL.SG_NOTIFY] = this.sgNotifyService;
  }

  public async processNotifications(activityIdentifiers: string[] | number[], notificationTypeOptions?: NotificationTypeOptions) {
    this.logger.log(`[NotificationService] Processing notification(s)`);
    try {
      const activities = await this.activityEntityService.retrieveActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers(
        activityIdentifiers,
      );

      const notificationPromises: Promise<void>[] = [];

      activities.forEach((activity) => {
        this.logger.log(`[NotificationService] Sending notification(s) for activity: ${activity.uuid}`);

        const { transaction } = activity;

        //TODO: Legacy transactions do not have notification inputs / templates (E.g. ICA), only email with message saved in customAgencyMessage.email
        if (transaction?.customAgencyMessage?.email) {
          return notificationPromises.push(
            this.notificationServiceMap[NOTIFICATION_CHANNEL.EMAIL].sendNotification(activity, null, notificationTypeOptions),
          );
        }

        const { notificationMessageInputs } = transaction!;

        if (!notificationMessageInputs || notificationMessageInputs.length === 0) {
          this.logger.log(`[NotificationService] No notification to send for ${activity.uuid}`);
          return;
        }

        notificationMessageInputs.forEach((notificationMessageInput) => {
          const { notificationChannel } = notificationMessageInput;
          notificationPromises.push(
            this.notificationServiceMap[notificationChannel].sendNotification(activity, notificationMessageInput, notificationTypeOptions),
          );
        });
      });

      await Promise.allSettled(notificationPromises);
      this.logger.log(`[NotificationService] Completed processing`);
    } catch (error) {
      this.logger.log((error as Error).message);
    }
  }
}
