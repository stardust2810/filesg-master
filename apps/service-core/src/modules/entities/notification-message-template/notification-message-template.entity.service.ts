import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, NOTIFICATION_CHANNEL } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import {
  NotificationMessageTemplate,
  NotificationMessageTemplateCreationModel,
  NotificationMessageTemplateUpdateModel,
} from '../../../entities/notification-message-template';
import { generateEntityUUID } from '../../../utils/helpers';
import { NotificationMessageTemplateEntityRepository } from './notification-message-template.entity.repository';

@Injectable()
export class NotificationMessageTemplateEntityService {
  private readonly logger = new Logger(NotificationMessageTemplateEntityService.name);

  constructor(private readonly notificationMessageTemplateEntityRepository: NotificationMessageTemplateEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildNotificationMessageTemplate(notificationMessageTemplateModel: NotificationMessageTemplateCreationModel) {
    return this.notificationMessageTemplateEntityRepository.getRepository().create({
      uuid: generateEntityUUID(NotificationMessageTemplate.name),
      ...notificationMessageTemplateModel,
    });
  }

  public async insertNotificationMessageTemplates(
    notificationMessageTemplateModels: NotificationMessageTemplateCreationModel[],
    entityManager?: EntityManager,
  ) {
    const notificationMessageTemplates = notificationMessageTemplateModels.map((model) => this.buildNotificationMessageTemplate(model));
    return await this.notificationMessageTemplateEntityRepository.getRepository(entityManager).insert(notificationMessageTemplates);
  }

  public async saveNotificationMessageTemplates(
    notificationMessageTemplateModels: NotificationMessageTemplateCreationModel[],
    entityManager?: EntityManager,
  ) {
    const notificationMessageTemplates = notificationMessageTemplateModels.map((model) => this.buildNotificationMessageTemplate(model));
    return await this.notificationMessageTemplateEntityRepository.getRepository(entityManager).save(notificationMessageTemplates);
  }

  public async saveNotificationMessageTemplate(
    notificationMessageTemplateModel: NotificationMessageTemplateCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveNotificationMessageTemplates([notificationMessageTemplateModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveNotificationMessageTemplateByUuid(
    uuid: string,
    opts?: ServiceMethodThrowOptions,
  ): Promise<NotificationMessageTemplate>;
  public async retrieveNotificationMessageTemplateByUuid(
    uuid: string,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<NotificationMessageTemplate | null>;
  public async retrieveNotificationMessageTemplateByUuid(uuid: string, opts: ServiceMethodOptions = { toThrow: true }) {
    const notificationMessageTemplate = await this.notificationMessageTemplateEntityRepository.findNotificationMessageTemplateByUuid(
      uuid,
      opts.entityManager,
    );

    if (!notificationMessageTemplate && opts.toThrow) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.AGENCY_ONBOARDING_SERVICE,
        NotificationMessageTemplate.name,
        'uuid',
        `${uuid}`,
      );
    }

    return notificationMessageTemplate;
  }

  public async retrieveNotificationTemplateUsingUuidAgencyIdAndNotificationChannel(
    uuid: string,
    agencyId: number,
    notificationChannel: NOTIFICATION_CHANNEL,
    entityManager?: EntityManager,
  ) {
    return await this.notificationMessageTemplateEntityRepository.findNotificationTemplateByUuidAndAgencyIdAndNotificationChannel(
      uuid,
      agencyId,
      notificationChannel,
      entityManager,
    );
  }

  public async retrieveFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels(
    eserviceUserId: number,
    notificationChannels: NOTIFICATION_CHANNEL[],
    entityManager?: EntityManager,
  ) {
    return await this.notificationMessageTemplateEntityRepository.findFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels(
      eserviceUserId,
      notificationChannels,
      entityManager,
    );
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateNotificationMessageTemplate(
    uuid: string,
    notificationMessageTemplateModel: NotificationMessageTemplateUpdateModel,
    entitytManager?: EntityManager,
  ) {
    return await this.notificationMessageTemplateEntityRepository
      .getRepository(entitytManager)
      .update({ uuid }, notificationMessageTemplateModel);
  }
}
