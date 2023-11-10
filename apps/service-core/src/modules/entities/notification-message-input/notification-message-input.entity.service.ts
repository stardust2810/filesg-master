import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { NotificationMessageInput, NotificationMessageInputCreationModel } from '../../../entities/notification-message-input';
import { generateEntityUUID } from '../../../utils/helpers';
import { NotificationMessageInputEntityRepository } from './notification-message-input.entity.repository';

@Injectable()
export class NotificationMessageInputEntityService {
  private readonly logger = new Logger(NotificationMessageInputEntityService.name);

  constructor(private readonly notificationMessageInputEntityRepository: NotificationMessageInputEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildNotificationMessageInput(notificationMessageInputModel: NotificationMessageInputCreationModel) {
    return this.notificationMessageInputEntityRepository.getRepository().create({
      uuid: generateEntityUUID(NotificationMessageInput.name),
      ...notificationMessageInputModel,
    });
  }

  public async insertNotificationMessageInputs(
    notificationMessageInputModels: NotificationMessageInputCreationModel[],
    entityManager?: EntityManager,
  ) {
    const notificationMessageInputs = notificationMessageInputModels.map((model) => this.buildNotificationMessageInput(model));
    return await this.notificationMessageInputEntityRepository.getRepository(entityManager).insert(notificationMessageInputs);
  }

  public async saveNotificationMessageInputs(
    notificationMessageInputModels: NotificationMessageInputCreationModel[],
    entityManager?: EntityManager,
  ) {
    const notificationMessageInputs = notificationMessageInputModels.map((model) => this.buildNotificationMessageInput(model));
    return await this.notificationMessageInputEntityRepository.getRepository(entityManager).save(notificationMessageInputs);
  }

  public async saveNotificationMessageInput(
    notificationMessageInputModel: NotificationMessageInputCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveNotificationMessageInputs([notificationMessageInputModel], entityManager))[0];
  }
}
