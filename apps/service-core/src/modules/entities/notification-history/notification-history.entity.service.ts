import { DateRange } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import {
  NotificationHistory,
  NotificationHistoryCreationModel,
  NotificationHistoryyUpdateModel,
} from '../../../entities/notification-history';
import { generateEntityUUID } from '../../../utils/helpers';
import { NotificationHistoryEntityRepository } from './notification-history.entity.repository';

@Injectable()
export class NotificationHistoryEntityService {
  private readonly logger = new Logger(NotificationHistoryEntityService.name);

  constructor(private readonly notificationHistoryEntityRepository: NotificationHistoryEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildNotificationHistory(notificationHistoryModel: NotificationHistoryCreationModel) {
    return this.notificationHistoryEntityRepository.getRepository().create({
      uuid: generateEntityUUID(NotificationHistory.name),
      ...notificationHistoryModel,
    });
  }

  public async insertNotificationHistories(notificationHistoryModels: NotificationHistoryCreationModel[], entityManager?: EntityManager) {
    const notificationHistories = notificationHistoryModels.map((model) => this.buildNotificationHistory(model));
    return await this.notificationHistoryEntityRepository.getRepository(entityManager).insert(notificationHistories);
  }

  public async saveNotificationHistories(notificationHistoryModels: NotificationHistoryCreationModel[], entityManager?: EntityManager) {
    const notificationHistories = notificationHistoryModels.map((model) => this.buildNotificationHistory(model));
    return await this.notificationHistoryEntityRepository.getRepository(entityManager).save(notificationHistories);
  }

  public async saveNotificationHistory(notificationHistoryModel: NotificationHistoryCreationModel, entityManager?: EntityManager) {
    return (await this.saveNotificationHistories([notificationHistoryModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveNotificationHistoryByMessageId(messageId: string, entityManager?: EntityManager) {
    return await this.notificationHistoryEntityRepository.getRepository(entityManager).findOne({ where: { messageId } });
  }

  public async retrieveNonSuccessNotificationHistoryByDateRange(dateRange: DateRange, entityManager?: EntityManager) {
    return await this.notificationHistoryEntityRepository.findNonSuccessNotificationHistoryByDateRange(dateRange, entityManager);
  }

  public async retrieveNonSuccessNotificationHistoriesByIds(ids: number[], entityManager?: EntityManager) {
    return await this.notificationHistoryEntityRepository.findNonSuccessNotificationHistoriesByIds(ids, entityManager);
  }

  public async retrieveNotificationHistoryWithTransactionByMessageId(messageId: string, entityManager?: EntityManager) {
    return await this.notificationHistoryEntityRepository.findNotificationHistoryWithTransactionByMessageId(messageId, entityManager);
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateNotificationHistoryByMessageId(
    messageId: string,
    notificationHistoryUpdateModel: NotificationHistoryyUpdateModel,
    entityManager?: EntityManager,
  ) {
    return await this.notificationHistoryEntityRepository
      .getRepository(entityManager)
      .update({ messageId }, notificationHistoryUpdateModel);
  }
}
