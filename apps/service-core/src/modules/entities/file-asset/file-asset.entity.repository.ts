/* eslint-disable sonarjs/no-duplicate-string */
import {
  ACTIVATED_FILE_STATUSES,
  ACTIVITY_TYPE,
  CustomPropertyMap,
  DateRange,
  FILE_ASSET_ACTION,
  FILE_ASSET_SORT_BY,
  FILE_STATUS,
  FILE_TYPE,
  normalizeCustomPropertyMap,
  RECIPIENT_ACTIVITY_TYPES,
  VIEWABLE_FILE_STATUSES,
} from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Equal,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Repository,
  SelectQueryBuilder,
  UpdateResult,
} from 'typeorm';

import { FILE_NOT_DELETED_BY_DATE } from '../../../consts';
import {
  AllFileAssetsFromCitizenRequestDto,
  AllFileAssetsFromCorporateRequestDto,
  AllFileAssetUuidsRequestDto,
} from '../../../dtos/file/request';
import { FileAsset, FileAssetUpdateModel } from '../../../entities/file-asset';
import { DocumentStatisticsReportAgencyIssuedFileAssetRawQueryResult, FILE_ASSET_TYPE } from '../../../typings/common';
import {
  FindAndCountCorporateViewableFileAssetsInputs,
  FindAndCountRecentFileAssetsInputs,
  FindAndCountViewableFileAssetsInputs,
} from './interface/file-asset.interface';

@Injectable()
export class FileAssetEntityRepository {
  public constructor(
    @InjectRepository(FileAsset)
    private fileAssetRepository: Repository<FileAsset>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(FileAsset) : this.fileAssetRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================

  // ---------------------------------------------------------------------------
  // Individual File Asset
  // ---------------------------------------------------------------------------

  public async findFileAssetByUuidAndUserUuid(
    uuid: string,
    userUuid: string,
    agencyCodes?: string[],
    statuses?: FILE_STATUS[],
    entityManager?: EntityManager,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('fileAsset.uuid = :uuid', { uuid })
      .andWhere('owner.uuid = :userUuid', { userUuid });

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    if (statuses) {
      query.andWhere('fileAsset.status IN (:...statuses)', { statuses });
    }

    return await query.getOne();
  }

  public async findFileAssetByUuidAndUserId(uuid: string, userId: number, activityUuid?: string, entityManager?: EntityManager) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .where('fileAsset.uuid = :uuid', { uuid })
      .andWhere('fileAsset.ownerId = :userId', { userId });

    if (activityUuid) {
      query.leftJoinAndSelect('fileAsset.activities', 'activities').andWhere('activities.uuid = :activityUuid', { activityUuid });
    }

    return await query.getOne();
  }

  public async findCorppassFileAssetByUuidAndUserId(
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

  public async findActivatedFileAssetByUuidAndUserId(uuid: string, userId: number, entityManager?: EntityManager) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('fileAsset.histories', 'histories')
      .leftJoin('activities.transaction', 'transaction')
      .leftJoin('transaction.application', 'application')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .addSelect(['transaction.uuid', 'application.externalRefId'])
      .where('fileAsset.uuid = :uuid', { uuid })
      .andWhere('activities.type IN (:...types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .andWhere('owner.id = :userId', { userId })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES }); // Activated instead of viewable, since document page needs to show File was deleted message

    return await query.getOne();
  }

  public async findAccessibleFileAssetByUuidAndUserId(uuid: string, userId: number, entityManager?: EntityManager) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('fileAsset.histories', 'histories')
      .leftJoin('activities.transaction', 'transaction')
      .leftJoin('transaction.application', 'application')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .addSelect(['transaction.uuid', 'application.externalRefId'])
      .where('fileAsset.uuid = :uuid', { uuid })
      .andWhere('activities.type IN (:...types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .andWhere('owner.id = :userId', { userId })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: ACTIVATED_FILE_STATUSES })
      .andWhere(FILE_NOT_DELETED_BY_DATE);

    return await query.getOne();
  }

  public async findActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
    uuids: string[],
    userId: number,
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

    return await query.getMany();
  }
  // ---------------------------------------------------------------------------
  // Multiple File Assets
  // ---------------------------------------------------------------------------
  public async findFileAssetsByUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager).createQueryBuilder('fileAsset').where('uuid IN (:...uuids)', { uuids }).getMany();
  }

  public async findFileAssetsByUuidsWithAgencyInfo(uuids: string[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('activities.transaction', 'transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType')
      .where('fileAsset.uuid IN (:...uuids)', { uuids })
      .getMany();
  }

  public async findDownloadableFileAssetsByUuidsAndUserUuid(
    uuids: string[],
    userUuid: string,
    activityUuid?: string,
    agencyCodes?: string[],
    entityManager?: EntityManager,
  ) {
    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.issuer', 'issuer')
      .leftJoinAndSelect('fileAsset.activities', 'activities')
      .leftJoinAndSelect('issuer.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('fileAsset.uuid IN(:...uuids)', { uuids })
      .andWhere('activities.type IN (:...types)', { types: RECIPIENT_ACTIVITY_TYPES })
      .andWhere('owner.uuid = :userUuid', { userUuid })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: VIEWABLE_FILE_STATUSES })
      .andWhere(FILE_NOT_DELETED_BY_DATE);

    if (activityUuid) {
      query.andWhere('activities.uuid = :activityUuid', { activityUuid });
    }

    if (agencyCodes) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getMany();
  }

  public async findFileAssetsWithParentAndOaCertificateByUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.parent', 'parent')
      .leftJoinAndSelect('fileAsset.oaCertificate', 'oaCertificate')
      .where('fileAsset.uuid IN (:...uuids)', { uuids })
      .getMany();
  }

  public async findAndCountRecentViewableFileAssets(inputs: FindAndCountRecentFileAssetsInputs, entityManager?: EntityManager) {
    const { ownerId, limit } = inputs;

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
      .andWhere(`histories.type = :historyType`, { historyType: FILE_ASSET_ACTION.VIEWED })
      .orderBy('histories.lastViewedAt', 'DESC')
      .take(limit);

    this.addFallbackOrder(queryBuilder);

    return await queryBuilder.getManyAndCount();
  }

  public async findAndCountViewableFileAssets(inputs: FindAndCountViewableFileAssetsInputs, entityManager?: EntityManager) {
    const queryBuilder = this.constructViewableFileAssetsQueryBuilder(inputs, entityManager);
    return await queryBuilder.getManyAndCount();
  }

  public async findAndCountCorporateViewableFileAssets(
    inputs: FindAndCountCorporateViewableFileAssetsInputs,
    entityManager?: EntityManager,
  ) {
    const queryBuilder = this.constructViewableFileAssetsQueryBuilder(inputs, entityManager);
    queryBuilder.leftJoinAndSelect('owner.corporate', 'corporate');

    const { historyActionById } = inputs;

    if (historyActionById) {
      queryBuilder.andWhere(`histories.actionById = :historyActionById`, { historyActionById });
    }

    return await queryBuilder.getManyAndCount();
  }

  public async findViewableFileAssetsByStatusAndUserUuid(
    userUuid: string,
    queryOptions: AllFileAssetUuidsRequestDto,
    entityManager?: EntityManager,
  ) {
    const { sortBy, asc, statuses, agencyCodes } = queryOptions;

    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .select('fileAsset.uuid')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .where('owner.uuid = :userUuid', { userUuid })
      .andWhere('fileAsset.status IN(:...statuses)', { statuses })
      .andWhere(FILE_NOT_DELETED_BY_DATE)
      .orderBy(`fileAsset.${sortBy}`, `${asc ? 'ASC' : 'DESC'}`);

    this.addFallbackOrder(query);

    if (agencyCodes) {
      query
        .leftJoinAndSelect('fileAsset.issuer', 'issuer')
        .leftJoinAndSelect('issuer.eservices', 'eservices')
        .leftJoinAndSelect('eservices.agency', 'agency')
        .andWhere('agency.code IN (:agencyCodes)', { agencyCodes });
    }

    return await query.getMany();
  }

  public async findViewableFileAssetsByStatusAndCorporateUen(
    corporateUen: string,
    queryOptions: AllFileAssetUuidsRequestDto,
    entityManager?: EntityManager,
  ) {
    const { sortBy, asc, statuses, agencyCodes } = queryOptions;

    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .select('fileAsset.uuid')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('owner.corporate', 'corporate')
      .where('corporate.uen = :corporateUen', { corporateUen })
      .andWhere('fileAsset.status IN(:...statuses)', { statuses })
      .andWhere(FILE_NOT_DELETED_BY_DATE)
      .orderBy(`fileAsset.${sortBy}`, `${asc ? 'ASC' : 'DESC'}`);

    this.addFallbackOrder(query);

    if (agencyCodes) {
      query
        .leftJoinAndSelect('fileAsset.issuer', 'issuer')
        .leftJoinAndSelect('issuer.eservices', 'eservices')
        .leftJoinAndSelect('eservices.agency', 'agency')
        .andWhere('agency.code IN (:agencyCodes)', { agencyCodes });
    }

    return await query.getMany();
  }

  public async findFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid(
    status: FILE_STATUS,
    documentType: FILE_TYPE,
    activityType: ACTIVITY_TYPE,
    transactionUuid: string,
    entityManager?: EntityManager,
  ) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoin('fileAsset.activities', 'activities')
      .leftJoin('activities.transaction', 'transaction')
      .where('fileAsset.status = :status', { status })
      .andWhere('fileAsset.documentType = :documentType', { documentType })
      .andWhere('activities.type = :type', { type: activityType })
      .andWhere('transaction.uuid = :uuid', { uuid: transactionUuid })
      .getMany();
  }

  public async findFileAssetsByStatusAndExpireAt(
    status: FILE_STATUS,
    expireAt: Date,
    expireAtOperator: typeof MoreThan | typeof MoreThanOrEqual | typeof Equal | typeof LessThanOrEqual | typeof LessThan,
    take: number,
    entityManager?: EntityManager,
  ) {
    const fileAssets: FileAsset[] = [];

    const fileAssetQuery = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.activities', 'activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType');

    const parentFileAssets = await fileAssetQuery
      .where({
        status,
        expireAt: expireAtOperator(expireAt),
        parentId: IsNull(),
      })
      .take(take)
      .getMany();

    //FIXME: To get all parentIds and use IN Query instead of loop to query the data one-by-one
    for await (const parentAsset of parentFileAssets) {
      fileAssets.push(parentAsset);
      const childAssets = await fileAssetQuery
        .where({
          status,
          expireAt: expireAtOperator(expireAt),
          parentId: parentAsset.id,
        })
        .getMany();
      fileAssets.push(...childAssets);
    }

    return fileAssets;
  }

  public async findFileAssetsByStatusesAndDeleteAt(
    statuses: FILE_STATUS[],
    deleteAt: Date,
    deleteAtOperator: typeof MoreThan | typeof MoreThanOrEqual | typeof Equal | typeof LessThanOrEqual | typeof LessThan,
    take: number,
    entityManager?: EntityManager,
  ) {
    const fileAssets: FileAsset[] = [];

    const fileAssetQuery = this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .leftJoinAndSelect('fileAsset.owner', 'owner')
      .leftJoinAndSelect('fileAsset.activities', 'activity')
      .leftJoinAndSelect('activity.transaction', 'transaction')
      .leftJoinAndSelect('transaction.application', 'application')
      .leftJoinAndSelect('application.applicationType', 'applicationType');

    const parentFileAssets = await fileAssetQuery
      .where({
        deleteAt: deleteAtOperator(deleteAt),
        status: In(statuses),
        parentId: IsNull(),
      })
      .take(take)
      .getMany();

    //FIXME: To get all parentIds and use IN Query instead of loop to query the data one-by-one
    for await (const parentAsset of parentFileAssets) {
      fileAssets.push(parentAsset);
      const childAssets = await fileAssetQuery
        .where({
          deleteAt: deleteAtOperator(deleteAt),
          status: In(statuses),
          parentId: parentAsset.id,
        })
        .getMany();
      fileAssets.push(...childAssets);
    }

    return fileAssets;
  }

  public async findAllChildrenUsingParentUuids(uuids: string[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .select(['fileAsset.uuid'])
      .leftJoin('fileAsset.parent', 'parent')
      .where('parent.uuid IN (:...uuids)', { uuids })
      .getMany();
  }

  // FIXME: explain this query, see performance
  public async findCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses(
    queryOptions: DateRange,
    entityManager?: EntityManager,
  ) {
    const { startDate, endDate } = queryOptions;

    const sumQueryList = ACTIVATED_FILE_STATUSES.map((status) => `SUM(IF(fileAsset.status = '${status}', 1, 0)) AS ${status}`);

    const query = await this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .select(`agency.name AS agency, applicationType.name AS applicationType, ${sumQueryList.join(', ')}`)
      .leftJoin('fileAsset.activities', 'activities')
      .leftJoin('activities.transaction', 'transaction')
      .leftJoin('transaction.application', 'application')
      .leftJoin('application.applicationType', 'applicationType')
      .leftJoin('application.eservice', 'eservice')
      .leftJoin('eservice.agency', 'agency')
      .groupBy('agency.name')
      .addGroupBy('applicationType.name')
      .orderBy('agency.name')
      .addOrderBy('applicationType.name')
      .where('fileAsset.status IN (:statuses)', { statuses: ACTIVATED_FILE_STATUSES })
      .andWhere('fileAsset.type = :type', { type: FILE_ASSET_TYPE.TRANSFERRED })
      .andWhere('activities.type = :activityType', { activityType: ACTIVITY_TYPE.RECEIVE_TRANSFER });

    if (startDate) {
      query.andWhere({ createdAt: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      query.andWhere({ createdAt: LessThanOrEqual(endDate) });
    }

    return query.getRawMany<DocumentStatisticsReportAgencyIssuedFileAssetRawQueryResult>();
  }

  // FIXME: explain this query, see performance
  public async findCountAccessedAgencyIssuedFileAssets(queryOptions: DateRange, entityManager?: EntityManager) {
    const { startDate, endDate } = queryOptions;

    const query = await this.getRepository(entityManager)
      .createQueryBuilder('fileAsset')
      .select('agency.name AS agency, applicationType.name AS applicationType, COUNT(histories.lastViewedAt) AS count')
      .leftJoin('fileAsset.activities', 'activities')
      .leftJoin('fileAsset.histories', 'histories')
      .leftJoin('activities.transaction', 'transaction')
      .leftJoin('transaction.application', 'application')
      .leftJoin('application.applicationType', 'applicationType')
      .leftJoin('application.eservice', 'eservice')
      .leftJoin('eservice.agency', 'agency')
      .groupBy('agency.name')
      .addGroupBy('applicationType.name')
      .where('fileAsset.status IN (:statuses)', { statuses: ACTIVATED_FILE_STATUSES })
      .andWhere('fileAsset.type = :type', { type: FILE_ASSET_TYPE.TRANSFERRED })
      .andWhere('activities.type = :activityType', { activityType: ACTIVITY_TYPE.RECEIVE_TRANSFER })
      .andWhere('histories.lastViewedAt IS NOT NULL');

    if (startDate) {
      query.andWhere({ createdAt: MoreThanOrEqual(startDate) });
    }

    if (endDate) {
      query.andWhere({ createdAt: LessThanOrEqual(endDate) });
    }

    return query.getRawMany<{ agency: string; applicationType: string; count: string }>();
  }

  public async findFileAssetUsingFileAssetUuidAndUserId(fileAssetUuids: string[], userId: number, eserviceUserUuid: string) {
    return await this.getRepository()
      .createQueryBuilder('fileAsset')
      .leftJoin('fileAsset.activities', 'activities')
      .leftJoin('fileAsset.issuer', 'issuer')
      .select(['fileAsset.uuid', 'fileAsset.name', 'activities.isAcknowledgementRequired', 'activities.acknowledgedAt'])
      .where('fileAsset.uuid IN (:...fileAssetUuids)', { fileAssetUuids })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: VIEWABLE_FILE_STATUSES })
      .andWhere('fileAsset.ownerId = :userId', { userId })
      .andWhere('issuer.uuid = :eserviceUserUuid', { eserviceUserUuid })
      .andWhere('activities.type = :type', { type: ACTIVITY_TYPE.RECEIVE_TRANSFER })
      .getMany();
  }

  public async findAgencyFileAssetByRecipientFileAssetUuidAndEserviceUserUuid(fileAssetUuids: string[], eserviceUserUuid: string) {
    return await this.getRepository()
      .createQueryBuilder('fileAsset')
      .leftJoin('fileAsset.parent', 'parentFileAsset')
      .leftJoin('fileAsset.issuer', 'issuer')
      .leftJoin('parentFileAsset.owner', 'parentFileAssetOwner')
      .select(['fileAsset.uuid', 'fileAsset.name', 'fileAsset.parent', 'parentFileAsset.uuid', 'parentFileAsset.name'])
      .where('fileAsset.uuid IN (:...fileAssetUuids)', { fileAssetUuids })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: VIEWABLE_FILE_STATUSES })
      .andWhere('issuer.uuid = :eserviceUserUuid', { eserviceUserUuid })
      .getMany();
  }
  // =============================================================================
  // Update
  // =============================================================================

  public async updateFileAsset(uuid: string, dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager) {
    return await this.getRepository(entityManager).createQueryBuilder().update(FileAsset).set(dataToBeUpdated).where({ uuid }).execute();
  }

  public async updateFileAssets(uuids: string[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateFileAssets(ids: number[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateFileAssets(identifiers: string[] | number[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateFileAssets(identifiers: string[] | number[], dataToBeUpdated: FileAssetUpdateModel, entityManager?: EntityManager) {
    const updateQueryBuilder = this.getRepository(entityManager).createQueryBuilder().update(FileAsset).set(dataToBeUpdated);

    if (typeof identifiers[0] === 'string') {
      updateQueryBuilder.where('uuid IN (:...identifiers)', { identifiers });
    } else {
      updateQueryBuilder.where('id IN (:...identifiers)', { identifiers });
    }

    return await updateQueryBuilder.execute();
  }

  public async updateFileAssetFamilyByParentId(
    parentFileAssetId: number,
    dataToBeUpdated: FileAssetUpdateModel,
    entityManager?: EntityManager,
  ): Promise<UpdateResult> {
    return this.getRepository(entityManager)
      .createQueryBuilder()
      .update(FileAsset)
      .set(dataToBeUpdated)
      .where('id = :parentFileAssetId', { parentFileAssetId })
      .orWhere('parentId = :parentFileAssetId', { parentFileAssetId })
      .execute();
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private addFallbackOrder(query: SelectQueryBuilder<FileAsset>) {
    query.addOrderBy(`fileAsset.name`, 'ASC').addOrderBy(`fileAsset.id`, 'ASC');
  }

  private constructViewableFileAssetsQueryBuilder(
    { ownerId, query, agencyId }: FindAndCountViewableFileAssetsInputs,
    entityManager?: EntityManager,
  ) {
    const { sortBy, asc, page, limit, statuses, ignoreNull, externalRefId, metadata } = query;
    const fetchedNumber = (page! - 1) * limit!;

    const customPropertyMap: CustomPropertyMap = {
      lastViewedAt: {
        path: 'histories.lastViewedAt',
        filterOnly: false,
        ignoreNull: ignoreNull && sortBy === FILE_ASSET_SORT_BY.LAST_VIEWED_AT,
      },
    };

    const isCustomProperty = Object.keys(customPropertyMap).includes(sortBy);
    const propertyUsed = isCustomProperty ? customPropertyMap[sortBy].path : `fileAsset.${sortBy}`;

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
      .andWhere('fileAsset.status IN(:...statuses)', { statuses: statuses })
      .orderBy(propertyUsed, asc ? 'ASC' : 'DESC')
      .skip(fetchedNumber)
      .take(limit);

    this.addFallbackOrder(queryBuilder);

    if (agencyId) {
      queryBuilder.andWhere('eservices.agencyId = :agencyId', { agencyId });
    }

    normalizeCustomPropertyMap<FileAsset>(queryBuilder, customPropertyMap);

    if (ignoreNull && !isCustomProperty) {
      queryBuilder.andWhere(`${propertyUsed} IS NOT NULL`);
    }

    if (externalRefId) {
      queryBuilder.andWhere(`application.externalRefId = :externalRefId`, { externalRefId });
    }

    if (metadata) {
      for (const key in metadata) {
        const valueToSearch = typeof metadata[key] === 'string' ? `'${metadata[key]}'` : metadata[key];
        queryBuilder.andWhere(`JSON_EXTRACT(fileAsset.metadata, '$.${key}') = ${valueToSearch}`);
      }
    }

    const { agencyCodes } = query as AllFileAssetsFromCitizenRequestDto | AllFileAssetsFromCorporateRequestDto;

    if (agencyCodes) {
      queryBuilder.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return queryBuilder;
  }
}
