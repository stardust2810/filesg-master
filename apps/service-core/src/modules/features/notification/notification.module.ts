import { Module } from '@nestjs/common';

import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { EmailEntityModule } from '../../entities/email/email.entity.module';
import { NotificationHistoryEntityModule } from '../../entities/notification-history/notification-history.entity.module';
import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { AwsModule } from '../aws/aws.module';
import { EmailModule } from '../email/email.module';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { SgNotifyProvider } from './sg-notify.provider';
import { SgNotifyService } from './sg-notify.service';

@Module({
  providers: [NotificationService, EmailService, SgNotifyService, SgNotifyProvider],
  exports: [NotificationService, EmailService, SgNotifyService],
  imports: [ActivityEntityModule, AwsModule, EmailModule, NotificationHistoryEntityModule, EmailEntityModule, ApiClientModule],
})
export class NotificationModule {}
