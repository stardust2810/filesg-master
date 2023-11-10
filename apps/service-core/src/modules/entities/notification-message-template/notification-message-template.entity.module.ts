import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationMessageTemplate } from '../../../entities/notification-message-template';
import { NotificationMessageTemplateEntityRepository } from './notification-message-template.entity.repository';
import { NotificationMessageTemplateEntityService } from './notification-message-template.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationMessageTemplate])],
  providers: [NotificationMessageTemplateEntityService, NotificationMessageTemplateEntityRepository],
  exports: [NotificationMessageTemplateEntityService],
})
export class NotificationMessageTemplateEntityModule {}
