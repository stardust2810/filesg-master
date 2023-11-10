/* eslint-disable sonarjs/no-duplicate-string */
import { ACTIVITY_TYPE, DateRange, PaginationOptions, RECIPIENT_ACTIVITY_TYPES } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, UpdateResult } from 'typeorm';

import { Transaction, TransactionUpdateModel } from '../../../entities/transaction';

@Injectable()
export class TransactionEntityRepository {
  public constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Transaction) : this.transactionRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findTransactionWithActivitiesAndOwnersByUuidAndActivityType(
    uuid: string,
    activityType: ACTIVITY_TYPE,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.activities', 'activities')
      .leftJoinAndSelect('activities.user', 'user')
      .where('transaction.uuid = :uuid', { uuid })
      .andWhere('activities.type = :activityType', { activityType })
      .getOne();
  }

  public async findTransactionByFileAssetUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('transaction.activities', 'activities')
      .leftJoinAndSelect('activities.fileAssets', 'fileAssets')
      .where('fileAssets.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findTransactionWithApplicationAndEServiceAndAgencyByUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .where({ uuid })
      .getOne();
  }

  public async findTransactionsByFileAssetUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.activities', 'activities')
      .leftJoinAndSelect('activities.fileAssets', 'fileAssets')
      .where('fileAssets.uuid  IN(:...uuids)', { uuids })
      .getMany();
  }

  public async findPartialTransactionWithStatusInfoByUuidAndUserId(
    uuid: string,
    userId: number,
    entityManager?: EntityManager,
  ): Promise<Transaction | null> {
    return await this.getRepository(entityManager)
      .createQueryBuilder('transaction')
      .select([
        'transaction.status',
        'transaction.type',
        'transaction.updatedAt',
        'activities.uuid',
        'fileAssets.name',
        'fileAssets.status',
        'fileAssets.failReason',
        'fileAssets.failCategory',
      ])
      .leftJoin('transaction.activities', 'activities')
      .leftJoin('activities.fileAssets', 'fileAssets')
      .where({ uuid })
      .andWhere('transaction.userId = :userId', { userId })
      .andWhere('activities.type IN (:types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .getOne();
  }

  public async findTransactionsUsingEserviceIds(
    eserviceIds: number[],
    { startDate, endDate, limit, page }: DateRange & PaginationOptions = { limit: 25, page: 1 },
    entityManager?: EntityManager,
  ) {
    const fetchedNumber = (page! - 1) * limit!;
    const query = this.getRepository(entityManager)
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('transaction.activities', 'activities')
      .leftJoinAndSelect('activities.fileAssets', 'fileAssets')
      .leftJoin('transaction.user', 'user')
      .leftJoin('user.eservices', 'eservices')
      .where('eservices.id IN(:...eserviceIds)', { eserviceIds })
      .skip(fetchedNumber)
      .take(limit);

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    return await query.getManyAndCount();
  }

  public async findTransactionAndChildrenUsingUuidAndUserId(uuid: string, userId: number) {
    return await this.getRepository()
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.children', 'children')
      .leftJoinAndSelect('children.activities', 'childrenActivities')
      .leftJoinAndSelect('transaction.activities', 'activities')
      .leftJoinAndSelect('activities.fileAssets', 'fileAssets')
      .leftJoinAndSelect('fileAssets.owner', 'owner')
      .where({ uuid, userId })
      .getOne();
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateTransaction(id: number, dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransaction(uuid: string, dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransaction(dentifier: string | number, dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransaction(identifier: string | number, dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager) {
    const updateQueryBuilder = this.getRepository(entityManager).createQueryBuilder().update(Transaction).set(dataToBeUpdated);

    if (typeof identifier === 'string') {
      updateQueryBuilder.where({ uuid: identifier });
    } else {
      updateQueryBuilder.where({ id: identifier });
    }

    return await updateQueryBuilder.execute();
  }

  public async updateTransactions(ids: number[], dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransactions(uuids: string[], dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransactions(dentifiers: string[] | number[], dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransactions(
    identifiers: string[] | number[],
    dataToBeUpdated: TransactionUpdateModel,
    entityManager?: EntityManager,
  ) {
    const updateQueryBuilder = this.getRepository(entityManager).createQueryBuilder().update(Transaction).set(dataToBeUpdated);

    if (typeof identifiers[0] === 'string') {
      updateQueryBuilder.where('uuid IN (:...identifiers)', { identifiers });
    } else {
      updateQueryBuilder.where('id IN (:...identifiers)', { identifiers });
    }

    return await updateQueryBuilder.execute();
  }
}
