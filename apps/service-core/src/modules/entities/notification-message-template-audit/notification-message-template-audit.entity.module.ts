import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationMessageTemplateAudit } from '../../../entities/notification-message-template-audit';
import { NotificationMessageTemplateAuditEntityRepository } from './notification-message-template-audit.entity.repository';
import { NotificationMessageTemplateAuditEntityService } from './notification-message-template-audit.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationMessageTemplateAudit])],
  providers: [NotificationMessageTemplateAuditEntityService, NotificationMessageTemplateAuditEntityRepository],
  exports: [NotificationMessageTemplateAuditEntityService],
})
export class NotificationMessageTemplateAuditEntityModule {}
