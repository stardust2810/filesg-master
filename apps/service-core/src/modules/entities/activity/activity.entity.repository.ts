/* eslint-disable sonarjs/no-duplicate-string */
import {
  ACTIVATED_FILE_STATUSES,
  ACTIVITY_SORT_BY,
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  VIEWABLE_ACTIVITY_TYPES,
  VIEWABLE_USER_TYPES,
} from '@filesg/common';
import { CompletedActivitiesRequestDto } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOptionsWhere, Repository, UpdateResult } from 'typeorm';

import { Activity, ActivityUpdateModel } from '../../../entities/activity';

export interface ActivityFileInsert {
  activityId: number;
  fileAssetId: number;
}

@Injectable()
export class ActivityEntityRepository {
  public constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(Activity) : this.activityRepository;
  }

  // ===========================================================================
  // Create
  // ===========================================================================
  public async insertActivityFiles(activityFileInserts: ActivityFileInsert[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder()
      .insert()
      .into('activity_file')
      .values(activityFileInserts)
      .execute();
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async findActivityByUuidAndStatusAndTypes(
    uuid: string,
    status: ACTIVITY_STATUS,
    types: ACTIVITY_TYPE[],
    userId?: number,
    entityManager?: EntityManager,
    agencyCodes?: Array<string>,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('activity.acknowledgementTemplate', 'acknowledgementTemplate')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .where('activity.uuid = :uuid', { uuid })
      .andWhere('activity.status = :status', { status })
      .andWhere('activity.type IN(:...types)', { types })
      .andWhere('fileAssets.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES });

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getOne();
  }

  // NOTE: if non completed activities are required, modify this function to do so
  public async findAndCountCompletedActivitiesByUserId(
    userId: number,
    queryOptions: CompletedActivitiesRequestDto = { sortBy: ACTIVITY_SORT_BY.CREATED_AT, asc: true, page: 0, limit: 0, types: [] },
    entityManager?: EntityManager,
  ) {
    const { sortBy, asc, page, limit, types, agencyCodes } = queryOptions;
    const fetchedNumber = (page! - 1) * limit!;

    const query = this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .where('user.id = :userId', { userId })
      .andWhere('activity.status = :status', { status: ACTIVITY_STATUS.COMPLETED })
      .andWhere('activity.type IN(:...types)', { types })
      .andWhere('fileAssets.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES })
      .orderBy(`activity.${sortBy}`, `${asc ? 'ASC' : 'DESC'}`)
      .skip(fetchedNumber)
      .take(limit);

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getManyAndCount();
  }

  public async findActivityUuidsByTransactionUuid(uuid: string, entityManager?: EntityManager) {
    const where: FindOptionsWhere<Activity> = {
      transaction: {
        uuid,
      },
    };

    return await this.getRepository(entityManager).find({
      select: ['uuid'],
      relations: ['transaction'],
      where,
    });
  }

  public async findParentActivityByTransactionUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.parent IS NULL')
      .andWhere('transaction.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findActivityWithParentByUuid(uuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.parent', 'parent')
      .where('activity.uuid = :uuid', { uuid })
      .getOne();
  }

  public async findActivityWithFileAssetsByUuid(uuid: string, entityManager?: EntityManager) {
    const where: FindOptionsWhere<Activity> = {
      uuid,
    };

    return await this.getRepository(entityManager).findOne({
      relations: ['fileAssets'],
      where,
    });
  }

  public async findActivitiesWithUserAndFileAssetsParentByParentIdAndType(
    parentId: string,
    type: ACTIVITY_TYPE,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.parent', 'parent')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .leftJoinAndSelect('fileAssets.parent', 'fileAssetParent')
      .where('parent.uuid = :parentId', { parentId })
      .andWhere('activity.type = :type', { type })
      .getMany();
  }

  public async findActivitiesByTypeAndTransactionUuid(activityType: ACTIVITY_TYPE, transactionUuid: string, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).find({
      where: {
        transaction: { uuid: transactionUuid },
        type: activityType,
      },
      relations: ['transaction', 'user'],
    });
  }

  public async findActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndFileAssetUuidsAndTransactionUuid(
    activityType: ACTIVITY_TYPE,
    fileAssetUuids: string[],
    transactionUuid: string,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.type = :type', { type: activityType })
      .andWhere('transaction.uuid = :uuid', { uuid: transactionUuid })
      .andWhere('fileAssets.uuid IN (:...uuids)', { uuids: fileAssetUuids })
      .andWhere('fileAssets.documentType = :documentType', { documentType: FILE_TYPE.OA })
      .andWhere('fileAssets.status = :status', { status: FILE_STATUS.ACTIVE })
      .getMany();
  }

  public async findActivitiesDetailsRequiredForEmail(ids: number[], type?: ACTIVITY_TYPE, entityManager?: EntityManager): Promise<Activity[]>; // prettier-ignore
  public async findActivitiesDetailsRequiredForEmail(uuids: string[], type?: ACTIVITY_TYPE, entityManager?: EntityManager): Promise<Activity[]>; // prettier-ignore
  public async findActivitiesDetailsRequiredForEmail(identifiers: string[] | number[], type?: ACTIVITY_TYPE, entityManager?: EntityManager): Promise<Activity[]>; // prettier-ignore
  public async findActivitiesDetailsRequiredForEmail(
    identifiers: string[] | number[],
    type: ACTIVITY_TYPE,
    entityManager?: EntityManager,
  ): Promise<Activity[]> {
    const queryBuilder = this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .leftJoinAndSelect('transaction.eserviceWhitelistedUser', 'eserviceWhitelistedUser')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .leftJoinAndSelect('activity.user', 'user')
      .where('activity.type = :type', { type });

    if (typeof identifiers[0] === 'string') {
      queryBuilder.andWhere('activity.uuid IN (:...identifiers)', { identifiers });
    } else {
      queryBuilder.andWhere('activity.id IN (:...identifiers)', { identifiers });
    }

    return await queryBuilder.getMany();
  }

  public async findRecallActivitiesDetailsRequiredForEmail(ids: number[], entityManager?: EntityManager): Promise<Activity[]> {
    return await this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .leftJoinAndSelect('transaction.eserviceWhitelistedUser', 'eserviceWhitelistedUser')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType')
      .leftJoinAndSelect('transaction.parent', 'parentTransaction')
      .leftJoinAndSelect('parentTransaction.activities', 'parentTransactionActivities')
      .leftJoinAndSelect('parentTransactionActivities.fileAssets', 'fileAssets')
      .leftJoinAndSelect('parentTransactionActivities.user', 'user')
      .where('activity.id IN (:...ids)', { ids })
      .andWhere('activity.type = :type', { type: ACTIVITY_TYPE.SEND_RECALL })
      .andWhere('activity.status = :status', { status: ACTIVITY_STATUS.COMPLETED })
      .getMany();
  }

  public async findActivityAcknowledgeDetailsByUuidAndStatusAndTypes(
    uuid: string,
    status: ACTIVITY_STATUS,
    types: ACTIVITY_TYPE[],
    userId: number,
    entityManager?: EntityManager,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .select(['activity.acknowledgedAt', 'activity.isAcknowledgementRequired', 'activity.uuid', 'activity.status', 'activity.type'])
      .where('activity.uuid = :uuid', { uuid })
      .andWhere('activity.status = :status', { status })
      .andWhere('activity.type IN(:...types)', { types });

    if (userId) {
      query.leftJoinAndSelect('activity.user', 'user').andWhere('user.id = :userId', { userId });
    }

    return await query.getOne();
  }

  public async findActivitiesWithTransactionNotificationInputAndTemplateWithIdentifiers(
    identifiers: string[] | number[],
    entityManager?: EntityManager,
  ): Promise<Activity[]> {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('transaction.notificationMessageInputs', 'messageInputs')
      .leftJoinAndSelect('messageInputs.notificationMessageTemplate', 'messageTemplate')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType')
      .leftJoinAndSelect('application.eservice', 'eservice')
      .leftJoinAndSelect('eservice.agency', 'agency')
      .leftJoinAndSelect('activity.user', 'user')
      .leftJoinAndSelect('activity.fileAssets', 'fileAssets')
      .where('activity.type IN(:...activityTypes)', { activityTypes: VIEWABLE_ACTIVITY_TYPES })
      .andWhere('user.type IN(:...userTypes)', { userTypes: VIEWABLE_USER_TYPES });

    if (typeof identifiers[0] === 'string') {
      query.andWhere(`activity.uuid IN(:...uuids)`, { uuids: identifiers });
    } else {
      query.andWhere(`activity.id IN(:...ids)`, { ids: identifiers });
    }

    return await query.getMany();
  }
  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateActivity(uuid: string, dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).update({ uuid }, dataToBeUpdated);
  }

  public async updateActivities(ids:  number[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> //prettier-ignore
  public async updateActivities(uuids: string[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> //prettier-ignore
  public async updateActivities(identifiers: string[] | number[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> //prettier-ignore
  public async updateActivities(identifiers: string[] | number[], dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager) {
    const updateQueryBuilder = this.getRepository(entityManager).createQueryBuilder().update(Activity).set(dataToBeUpdated);

    if (typeof identifiers[0] === 'string') {
      updateQueryBuilder.where('uuid IN (:...identifiers)', { identifiers });
    } else {
      updateQueryBuilder.where('id IN (:...identifiers)', { identifiers });
    }

    return await updateQueryBuilder.execute();
  }

  // ===========================================================================
  // Save
  // ===========================================================================
  public async saveActivity(id: number, dataToBeUpdated: ActivityUpdateModel, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).save({ id, ...dataToBeUpdated });
  }
}
