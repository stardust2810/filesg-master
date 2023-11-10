import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, DEFAULT_HISTORY_TYPE, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { FILE_NOT_DELETED_BY_DATE } from '../../../consts';
import { FileAssetHistoryRequestDto } from '../../../dtos/file/request';
import { FileAssetHistory } from '../../../entities/file-asset-history';

@Injectable()
export class FileAssetHistoryEntityRepository {
  public constructor(
    @InjectRepository(FileAssetHistory)
    private fileAssetHistoryRepository: Repository<FileAssetHistory>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(FileAssetHistory) : this.fileAssetHistoryRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findFileAssetHistory(
    criteria: FindOneOptions<FileAssetHistory>,
    opts?: ServiceMethodThrowOptions,
  ): Promise<FileAssetHistory>;
  public async findFileAssetHistory(
    criteria: FindOneOptions<FileAssetHistory>,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<FileAssetHistory | null>;
  public async findFileAssetHistory(criteria: FindOneOptions<FileAssetHistory>, opts: ServiceMethodOptions = { toThrow: true }) {
    const fileAssetHistory = await this.fileAssetHistoryRepository.findOne(criteria);

    if (!fileAssetHistory && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_ASSET_HISTORY_SERVICE, FileAssetHistory.name, 'criteria', `${criteria}`);
    }

    return fileAssetHistory;
  }

  public async findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId(
    fileAssetUuid: string,
    ownerId: number,
    queryOptions: FileAssetHistoryRequestDto,
    activityUuid?: string,
    entityManager?: EntityManager,
  ) {
    const { page, limit, type } = queryOptions;

    if (!page) {
      queryOptions.page = 0;
    }

    if (!limit) {
      queryOptions.limit = 0;
    }

    const fetchedNumber = (page! - 1) * limit!;

    const query = this.getRepository(entityManager)
      .createQueryBuilder('fileAssetHistory')
      .leftJoinAndSelect('fileAssetHistory.actionBy', 'user')
      .leftJoinAndSelect('fileAssetHistory.fileAsset', 'fileAsset')
      .leftJoinAndSelect('fileAsset.oaCertificate', 'oaCertificate')
      .leftJoinAndSelect('user.eservices', 'eservices')
      .leftJoinAndSelect('eservices.agency', 'agency')
      .where('fileAsset.uuid = :fileAssetUuid', { fileAssetUuid })
      .andWhere('fileAsset.ownerId = :ownerId', { ownerId })
      .andWhere({ type: In(type ?? DEFAULT_HISTORY_TYPE) })
      .andWhere('fileAsset.status IN (:...statuses)', { statuses: VIEWABLE_FILE_STATUSES })
      .andWhere(FILE_NOT_DELETED_BY_DATE.map((condition) => ({ fileAsset: condition })))
      .orderBy('fileAssetHistory.createdAt', 'DESC')
      .skip(fetchedNumber)
      .take(limit);

    if (activityUuid) {
      query.leftJoinAndSelect('fileAsset.activities', 'activities').andWhere('activities.uuid = :activityUuid', { activityUuid });
    }

    return await query.getManyAndCount();
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateFileAssetHistory(
    criteria: FindOptionsWhere<FileAssetHistory>,
    dataToBeUpdated: QueryDeepPartialEntity<FileAssetHistory>,
  ): Promise<UpdateResult> {
    return this.fileAssetHistoryRepository.update(criteria, dataToBeUpdated);
  }
}
