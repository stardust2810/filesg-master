import { INTEGRATION_TYPE, NOTIFICATION_CHANNEL } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { NotificationMessageTemplate } from '../../../entities/notification-message-template';

@Injectable()
export class NotificationMessageTemplateEntityRepository {
  public constructor(
    @InjectRepository(NotificationMessageTemplate)
    private notificationMessageTemplateRepository: Repository<NotificationMessageTemplate>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(NotificationMessageTemplate) : this.notificationMessageTemplateRepository;
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async findNotificationMessageTemplateByUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: {
        uuid,
      },
    });
  }

  public async findNotificationTemplateByUuidAndAgencyIdAndNotificationChannel(
    uuid: string,
    agencyId: number,
    notificationChannel: NOTIFICATION_CHANNEL,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('notificationMessageTemplate')
      .where('notificationMessageTemplate.uuid = :uuid', { uuid })
      .andWhere('notificationMessageTemplate.notificationChannel = :notificationChannel', { notificationChannel })
      .andWhere('notificationMessageTemplate.agencyId = :agencyId', { agencyId })
      .getOne();
  }

  public async findFormsgNotificationTemplatesByEserviceUserIdAndNotificationChannels(
    eserviceUserId: number,
    notificationChannels: NOTIFICATION_CHANNEL[],
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('notificationMessageTemplate')
      .leftJoin('notificationMessageTemplate.agency', 'agency')
      .leftJoin('agency.eservices', 'eservices')
      .leftJoin('eservices.users', 'users')
      .where('users.id = :eserviceUserId', { eserviceUserId })
      .andWhere('notificationMessageTemplate.integrationType = :integrationType', { integrationType: INTEGRATION_TYPE.FORMSG })
      .andWhere('notificationMessageTemplate.notificationChannel IN (:...notificationChannels)', { notificationChannels })
      .getMany();
  }
}
