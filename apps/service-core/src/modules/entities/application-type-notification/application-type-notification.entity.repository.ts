import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ApplicationTypeNotification } from '../../../entities/application-type-notification';

@Injectable()
export class ApplicationTypeNotificationEntityRepository {
  public constructor(
    @InjectRepository(ApplicationTypeNotification)
    private applicationTypeNotificationRepository: Repository<ApplicationTypeNotification>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(ApplicationTypeNotification) : this.applicationTypeNotificationRepository;
  }

  public async findNotificationChannelsForApplicationType(applicationTypeId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('applicationTypeNotification')
      .where('applicationTypeNotification.applicationTypeId = :applicationTypeId', { applicationTypeId })
      .getMany();
  }

  public async findNotificationChannelsForApplicationTypeByCodeAndEserviceUserId(
    applicationTypeCode: string,
    eserviceUserId: number,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('applicationTypeNotification')
      .leftJoin('applicationTypeNotification.applicationType', 'applicationType')
      .leftJoin('applicationType.eservice', 'eservice')
      .leftJoin('eservice.users', 'users')
      .where('applicationType.code = :applicationTypeCode', { applicationTypeCode })
      .andWhere('users.id = :eserviceUserId', { eserviceUserId })
      .getMany();
  }
}
