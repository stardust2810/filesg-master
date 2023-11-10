import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { NotificationMessageInput } from '../../../entities/notification-message-input';

@Injectable()
export class NotificationMessageInputEntityRepository {
  public constructor(
    @InjectRepository(NotificationMessageInput)
    private notificationMessageInputRepository: Repository<NotificationMessageInput>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(NotificationMessageInput) : this.notificationMessageInputRepository;
  }
}
