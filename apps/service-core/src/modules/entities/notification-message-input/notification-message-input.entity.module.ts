import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationMessageInput } from '../../../entities/notification-message-input';
import { NotificationMessageInputEntityRepository } from './notification-message-input.entity.repository';
import { NotificationMessageInputEntityService } from './notification-message-input.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationMessageInput])],
  providers: [NotificationMessageInputEntityService, NotificationMessageInputEntityRepository],
  exports: [NotificationMessageInputEntityService],
})
export class NotificationMessageInputEntityModule {}
