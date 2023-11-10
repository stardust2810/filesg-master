import { Module } from '@nestjs/common';

import { NotificationHistoryEntityModule } from '../../entities/notification-history/notification-history.entity.module';
import { NotificationModule } from '../notification/notification.module';
import { NotificationFailureReportingService } from './notification-failure-reporting.service';

@Module({
  imports: [NotificationHistoryEntityModule, NotificationModule],
  providers: [NotificationFailureReportingService],
})
export class NotificationFailureReportingModule {}
