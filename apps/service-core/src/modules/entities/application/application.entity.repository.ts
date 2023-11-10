import { ACTIVITY_TYPE, DateRange } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Application } from '../../../entities/application';

@Injectable()
export class ApplicationEntityRepository {
  public constructor(
    @InjectRepository(Application)
    private applicationRepository: Repository<Application>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Application) : this.applicationRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findApplicationByUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).findOne({
      where: {
        uuid,
      },
    });
  }

  public async findApplicationByExternalRefIdAndEserviceIdAndApplicationTypeId(
    externalRefId: string,
    eserviceId: number,
    applicationTypeId: number,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('application.applicationType', 'applicationType')
      .where('application.externalRefId = :externalRefId', { externalRefId })
      .andWhere('eservice.id = :eserviceId', { eserviceId })
      .andWhere('applicationType.id = :applicationTypeId', { applicationTypeId })
      .getOne();
  }

  public async findApplicationByTransactionUuid(transactionUuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('application')
      // eslint-disable-next-line sonarjs/no-duplicate-string
      .leftJoinAndSelect('application.transactions', 'transactions')
      .where('transactions.uuid = :uuid', { uuid: transactionUuid })
      .getOne();
  }

  public async findApplicationsWithTransactionsAndActivitiesByActivityUuidAndActivityTypes(
    activityUuid: string,
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.transactions', 'transactions')
      .leftJoinAndSelect('transactions.activities', 'activities')
      .leftJoinAndSelect('activities.fileAssets', 'fileAssets')
      .leftJoinAndSelect('activities.notificationHistories', 'notificationHistories')
      .where('activities.uuid = :uuid', { uuid: activityUuid })
      .andWhere('activities.type IN (:...types)', { types })
      .getMany();
  }

  public async findApplicationsWithTransactionsAndActivitiesByActivityRecipientInfo(
    recipientInfo: string,
    agencyCode: string,
    { startDate, endDate }: DateRange,
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .leftJoinAndSelect('application.transactions', 'transactions')
      .leftJoinAndSelect('transactions.activities', 'activities')
      .leftJoinAndSelect('activities.fileAssets', 'fileAssets')
      .leftJoinAndSelect('activities.notificationHistories', 'notificationHistories')
      .where('LOWER(activities.recipientInfo) like LOWER(:recipientInfo)', { recipientInfo: `%${recipientInfo}%` })
      .andWhere('activities.type IN (:...types)', { types })
      .andWhere('agency.code = :agencyCode', { agencyCode })
      .andWhere('transactions.createdAt >= :startDate', { startDate })
      .andWhere('transactions.createdAt <= :endDate', { endDate })
      .getMany();
  }

  public async findApplicationWithTransactionsAndActivitiesDetailsByExternalRefId(
    externalRefId: string,
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.transactions', 'transaction')
      .leftJoinAndSelect('transaction.activities', 'activity')
      .leftJoinAndSelect('activity.fileAssets', 'fileAsset')
      .leftJoinAndSelect('activity.notificationHistories', 'notificationHistory')
      .where('application.externalRefId = :externalRefId', { externalRefId })
      .andWhere('activity.type IN (:...types)', { types })
      .getOne();
  }

  public async findApplicationsWithTransactionsAndActivitiesDetailsByIds(
    ids: number[],
    types: ACTIVITY_TYPE[],
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('application')
      .leftJoinAndSelect('application.transactions', 'transaction')
      .leftJoinAndSelect('transaction.activities', 'activity')
      .leftJoinAndSelect('activity.fileAssets', 'fileAsset')
      .leftJoinAndSelect('activity.notificationHistories', 'notificationHistory')
      .where('application.id IN (:...ids)', { ids })
      .andWhere('activity.type IN (:...types)', { types })
      .getMany();
  }
}
