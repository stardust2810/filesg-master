import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { ApplicationType } from '../../../entities/application-type';

@Injectable()
export class ApplicationTypeEntityRepository {
  public constructor(
    @InjectRepository(ApplicationType)
    private applicationTypeRepository: Repository<ApplicationType>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(ApplicationType) : this.applicationTypeRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findApplicationTypeByCodeAndEserviceId(code: string, eserviceId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('applicationType')
      .where('applicationType.code = :code', { code })
      .andWhere('applicationType.eserviceId = :eserviceId', { eserviceId })
      .getOne();
  }

  public async findApplicationTypesAndNotificationChannelsByEserviceUserId(eserviceUserId: number) {
    return await this.getRepository()
      .createQueryBuilder('applicationType')
      .leftJoin('applicationType.applicationTypeNotifications', 'applicationTypeNotifications')
      .leftJoin('applicationType.eservice', 'eservice')
      .leftJoin('eservice.users', 'users')
      .select(['applicationType.code', 'applicationTypeNotifications.notificationChannel'])
      .where('users.id = :eserviceUserId', { eserviceUserId })
      .getMany();
  }
}
