import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { ApplicationTypeNotificationCreationModel } from '../../../entities/application-type-notification';
import { ApplicationTypeNotificationEntityRepository } from './application-type-notification.entity.repository';

@Injectable()
export class ApplicationTypeNotificationEntityService {
  private readonly logger = new Logger(ApplicationTypeNotificationEntityService.name);

  constructor(private readonly applicationTypeNotificationEntityRepository: ApplicationTypeNotificationEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildApplicationTypeNotification(applicationTypeNotificationModel: ApplicationTypeNotificationCreationModel) {
    return this.applicationTypeNotificationEntityRepository.getRepository().create({
      ...applicationTypeNotificationModel,
    });
  }

  public async insertApplicationTypeNotifications(
    applicationTypeNotificationModels: ApplicationTypeNotificationCreationModel[],
    entityManager?: EntityManager,
  ) {
    const applicationTypeNotifications = applicationTypeNotificationModels.map((model) => this.buildApplicationTypeNotification(model));
    return await this.applicationTypeNotificationEntityRepository.getRepository(entityManager).insert(applicationTypeNotifications);
  }

  public async saveApplicationTypeNotifications(
    applicationTypeNotificationModels: ApplicationTypeNotificationCreationModel[],
    entityManager?: EntityManager,
  ) {
    const applicationTypeNotifications = applicationTypeNotificationModels.map((model) => this.buildApplicationTypeNotification(model));
    return await this.applicationTypeNotificationEntityRepository.getRepository(entityManager).save(applicationTypeNotifications);
  }

  public async saveApplicationTypeNotification(
    applicationTypeNotificationModel: ApplicationTypeNotificationCreationModel,
    entityManager?: EntityManager,
  ) {
    return (await this.saveApplicationTypeNotifications([applicationTypeNotificationModel], entityManager))[0];
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveNotificationChannelsForApplicationType(applicationTypeId: number) {
    return await this.applicationTypeNotificationEntityRepository.findNotificationChannelsForApplicationType(applicationTypeId);
  }

  public async retrieveNotificationChannelsForApplicationTypeByCodeAndEserviceUserId(applicationTypeCode: string, eserviceUserId: number) {
    return await this.applicationTypeNotificationEntityRepository.findNotificationChannelsForApplicationTypeByCodeAndEserviceUserId(
      applicationTypeCode,
      eserviceUserId,
    );
  }
}
