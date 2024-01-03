import { DEFAULT_HISTORY_TYPE, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isEmpty } from 'lodash';
import { EntityManager, In, Repository } from 'typeorm';

import { FILE_NOT_DELETED_BY_DATE } from '../../../consts';
import { FileAssetHistory } from '../../../entities/file-asset-history';
import { FileAssetHistoryByFileAssetUuidAndOwnerIdDto } from './input/file-asset-history.input';

@Injectable()
export class FileAssetHistoryEntityCorppassRepository {
  public constructor(
    @InjectRepository(FileAssetHistory)
    private fileAssetHistoryRepository: Repository<FileAssetHistory>,
  ) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(FileAssetHistory) : this.fileAssetHistoryRepository;
  }

  public async findAndCountCorporateFileAssetHistoryByFileAssetUuidAndOwnerId(
    queryOptions: FileAssetHistoryByFileAssetUuidAndOwnerIdDto,
    entityManager?: EntityManager,
  ) {
    const { page, limit, type, fileAssetUuid, ownerId, activityUuid, agencyCodes } = queryOptions;

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

    if (!isEmpty(agencyCodes)) {
      query.andWhere('agency.code IN (:...agencyCodes)', { agencyCodes });
    }

    return await query.getManyAndCount();
  }
}
