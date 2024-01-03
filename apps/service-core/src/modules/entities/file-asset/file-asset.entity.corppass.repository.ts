import { ACTIVATED_FILE_STATUSES, ACTIVITY_TYPE, FILE_ASSET_ACTION, RECIPIENT_ACTIVITY_TYPES } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, SelectQueryBuilder } from 'typeorm';

import { FILE_NOT_DELETED_BY_DATE } from '../../../consts';
import { FileAsset } from '../../../entities/file-asset';
import { FindCorporateRecentViewableFileAssetsInputs } from './interface/file-asset.interface';

@Injectable()
export class CorppassFileAssetEntityRepository {
  public constructor(
    @InjectRepository(FileAsset)
    private fileAssetRepository: Repository<FileAsset>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(FileAsset) : this.fileAssetRepository;
  }

  public async findCorporateFileAssetByUuidAndUserId(
    uuid: string,
    userId: number,
    activityUuid?: string,
    agencyCodes?: string[],
    entityManager?: EntityManager,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.histories', 'histories')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('owner.corporate', 'corporate')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('fileAsset.uuid = :uuid', { uuid })
      .andWhere('fileAsset.ownerId = :userId', { userId })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES }) // Activated instead of viewable, since document page needs to show File was deleted message
      .andWhere('activities.type IN (:...types)', { types: RECIPIENT_ACTIVITY_TYPES });

    if (activityUuid) {
      query.andWhere('activities.uuid = :activityUuid', { activityUuid });
    }

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getOne();
  }

  public async findAccessibleCorporateFileAssetByUuidAndUserId(
    uuid: string,
    userId: number,
    activityUuid?: string,
    agencyCodes?: string[],
    entityManager?: EntityManager,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.histories', 'histories')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('owner.corporate', 'corporate')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('fileAsset.uuid = :uuid', { uuid })
      .andWhere('fileAsset.ownerId = :userId', { userId })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES }) // Activated instead of viewable, since document page needs to show File was deleted message
      .andWhere('activities.type IN (:...types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .andWhere(FILE_NOT_DELETED_BY_DATE);

    if (activityUuid) {
      query.andWhere('activities.uuid = :activityUuid', { activityUuid });
    }

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getOne();
  }

  public async findCorporateActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
    uuids: string[],
    userId: number,
    agencyCodes?: string[],
    activityUuid?: string,
    entityManager?: EntityManager,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('activities.transaction', 'transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('fileAsset.uuid IN (:...uuids)', { uuids })
      .andWhere('activities.type IN (:...types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .andWhere('owner.id = :userId', { userId })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES });

    if (activityUuid) {
      query.andWhere('activities.uuid = :activityUuid', { activityUuid });
    }

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getMany();
  }

  public async findCorporateRecentFileAssets(inputs: FindCorporateRecentViewableFileAssetsInputs, entityManager?: EntityManager) {
    const { ownerId, query, accessibleAgencyCodes, historyActionById } = inputs;
    const { limit } = query;

    const queryBuilder = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .leftJoinAndSelect('fileAsset.histories', 'histories')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoin('activities.transaction', 'transaction')
      .leftJoin('transaction.application', 'application')
      .where('fileAsset.ownerId = :ownerId', { ownerId })
      .addSelect(['transaction.uuid', 'application.externalRefId'])
      .andWhere(FILE_NOT_DELETED_BY_DATE)
      .andWhere('activities.type = :type', { type: ACTIVITY_TYPE.RECEIVE_TRANSFER })
      .andWhere(`histories.actionById = :historyActionById`, { historyActionById })
      .andWhere(`histories.type = :historyType`, { historyType: FILE_ASSET_ACTION.VIEWED })
      .orderBy('histories.lastViewedAt', 'DESC')
      .take(limit);

    this.addFallbackOrder(queryBuilder);

    if (accessibleAgencyCodes) {
      queryBuilder.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes: accessibleAgencyCodes });
    }

    return await queryBuilder.getManyAndCount();
  }

  private addFallbackOrder(query: SelectQueryBuilder<FileAsset>) {
    query.addOrderBy(`fileAsset.name`, 'ASC').addOrderBy(`fileAsset.id`, 'ASC');
  }
}
