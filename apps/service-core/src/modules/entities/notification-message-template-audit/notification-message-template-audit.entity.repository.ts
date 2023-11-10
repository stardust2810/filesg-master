import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { NotificationMessageTemplateAudit } from '../../../entities/notification-message-template-audit';

@Injectable()
export class NotificationMessageTemplateAuditEntityRepository {
  public constructor(
    @InjectRepository(NotificationMessageTemplateAudit)
    private notificationMessageTemplateAuditRepository: Repository<NotificationMessageTemplateAudit>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(NotificationMessageTemplateAudit) : this.notificationMessageTemplateAuditRepository;
  }
}
