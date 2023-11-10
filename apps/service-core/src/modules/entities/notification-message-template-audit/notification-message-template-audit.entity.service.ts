import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { NotificationMessageTemplateAuditCreationModel } from '../../../entities/notification-message-template-audit';
import { NotificationMessageTemplateAuditEntityRepository } from './notification-message-template-audit.entity.repository';

@Injectable()
export class NotificationMessageTemplateAuditEntityService {
  private readonly logger = new Logger(NotificationMessageTemplateAuditEntityService.name);

  constructor(private readonly notificationMessageTemplateAuditEntityRepository: NotificationMessageTemplateAuditEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildNotificationMessageTemplateAudit(notificationMessageTemplateAuditModel: NotificationMessageTemplateAuditCreationModel) {
    return this.notificationMessageTemplateAuditEntityRepository.getRepository().create({
      ...notificationMessageTemplateAuditModel,
    });
  }

  public async insertNotificationMessageTemplateAudits(
    notificationMessageTemplateAuditModels: NotificationMessageTemplateAuditCreationModel[],
    entityManager?: EntityManager,
  ) {
    const notificationMessageTemplateAudits = notificationMessageTemplateAuditModels.map((model) =>
      this.buildNotificationMessageTemplateAudit(model),
    );
    return await this.notificationMessageTemplateAuditEntityRepository
      .getRepository(entityManager)
      .insert(notificationMessageTemplateAudits);
  }

  public async saveNotificationMessageTemplateAudits(
    notificationMessageTemplateAuditModels: NotificationMessageTemplateAuditCreationModel[],
    entityManager?: EntityManager,
  ) {
    const notificationMessageTemplateAudits = notificationMessageTemplateAuditModels.map((model) =>
      this.buildNotificationMessageTemplateAudit(model),
    );
    return await this.notificationMessageTemplateAuditEntityRepository.getRepository(entityManager).save(notificationMessageTemplateAudits);
  }

  public async saveNotificationMessageTemplateAudit(
    notificationMessageTemplateAuditModel: NotificationMessageTemplateAuditCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveNotificationMessageTemplateAudits([notificationMessageTemplateAuditModel], entityManager))[0];
  }
}
