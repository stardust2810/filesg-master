import { DateRange, NOTIFICATION_STATUS } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { NotificationHistory } from '../../../entities/notification-history';

@Injectable()
export class NotificationHistoryEntityRepository {
  public constructor(
    @InjectRepository(NotificationHistory)
    private notificationHistoryRepository: Repository<NotificationHistory>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(NotificationHistory) : this.notificationHistoryRepository;
  }

  public async findNonSuccessNotificationHistoriesByIds(ids: number[], entityManager?: EntityManager) {
    return await this.buildCustomNotificationHistoryQuery(entityManager).andWhere('notificationHistory.id IN(:...ids)', { ids }).getMany();
  }

  public async findNonSuccessNotificationHistoryByDateRange({ startDate, endDate }: DateRange, entityManager?: EntityManager) {
    return await this.buildCustomNotificationHistoryQuery(entityManager)
      .andWhere('notificationHistory.createdAt >= :startDate', { startDate })
      .andWhere('notificationHistory.createdAt < :endDate', { endDate })
      .getMany();
  }

  public async findNotificationHistoryWithTransactionByMessageId(messageId: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('notificationHistory')
      .leftJoinAndSelect('notificationHistory.activity', 'activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('activity.user', 'user')
      .andWhere('notificationHistory.messageId = :messageId', { messageId })
      .getOne();
  }

  private buildCustomNotificationHistoryQuery(entityManager?: EntityManager) {
    const fieldsToSelect = [
      'notificationHistory.id',
      'notificationHistory.notificationChannel',
      'notificationHistory.status',
      'notificationHistory.statusDetails',
      'notificationHistory.createdAt',
      'activity.uuid',
      'activity.recipientInfo',
      'transaction.type',
      'application.externalRefId',
      'applicationType.code',
      'eservice.emails',
      'eservice.name',
      'agency.name',
      'agency.code',
    ];

    return this.getRepository(entityManager)
      .createQueryBuilder('notificationHistory')
      .leftJoin('notificationHistory.activity', 'activity')
      .leftJoin('activity.transaction', 'transaction')
      .leftJoin('transaction.application', 'application')
      .leftJoin('application.eservice', 'eservice')
      .leftJoin('application.applicationType', 'applicationType')
      .leftJoin('eservice.agency', 'agency')
      .select(fieldsToSelect)
      .where('notificationHistory.status != :status', { status: NOTIFICATION_STATUS.SUCCESS });
  }
}
