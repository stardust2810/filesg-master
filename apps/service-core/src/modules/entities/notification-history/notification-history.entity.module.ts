import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationHistory } from '../../../entities/notification-history';
import { NotificationHistoryEntityRepository } from './notification-history.entity.repository';
import { NotificationHistoryEntityService } from './notification-history.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationHistory])],
  providers: [NotificationHistoryEntityService, NotificationHistoryEntityRepository],
  exports: [NotificationHistoryEntityService],
})
export class NotificationHistoryEntityModule {}
