import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationTypeNotification } from '../../../entities/application-type-notification';
import { ApplicationTypeNotificationEntityRepository } from './application-type-notification.entity.repository';
import { ApplicationTypeNotificationEntityService } from './application-type-notification.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([ApplicationTypeNotification])],
  providers: [ApplicationTypeNotificationEntityService, ApplicationTypeNotificationEntityRepository],
  exports: [ApplicationTypeNotificationEntityService],
})
export class ApplicationTypeNotificationEntityModule {}
