import { FILE_ASSET_ACTION } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { EntityManager, Equal } from 'typeorm';

import { FileAssetHistoryRequestDto } from '../../../dtos/file/request';
import { FileAssetHistory, FileAssetHistoryCreationModel } from '../../../entities/file-asset-history';
import { generateEntityUUID } from '../../../utils/helpers';
import { FileAssetHistoryEntityRepository } from './file-asset-history.entity.repository';

@Injectable()
export class FileAssetHistoryEntityService {
  constructor(private readonly fileAssetHistoryEntityRepository: FileAssetHistoryEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildFileAssetHistory(fileAssetHistoryModel: FileAssetHistoryCreationModel) {
    return this.fileAssetHistoryEntityRepository.getRepository().create({
      uuid: generateEntityUUID(FileAssetHistory.name),
      ...fileAssetHistoryModel,
    });
  }

  public async insertFileAssetHistories(fileAssetHistoryModels: FileAssetHistoryCreationModel[], entityManager?: EntityManager) {
    const fileHistories = fileAssetHistoryModels.map((model) => this.buildFileAssetHistory(model));
    return await this.fileAssetHistoryEntityRepository.getRepository(entityManager).insert(fileHistories);
  }

  public async insertFileAssetHistory(fileAssetHistoryModel: FileAssetHistoryCreationModel, entityManager?: EntityManager) {
    const fileHistory = this.buildFileAssetHistory(fileAssetHistoryModel);
    return await this.fileAssetHistoryEntityRepository.getRepository(entityManager).insert(fileHistory);
  }

  public async saveFileAssetHistories(fileAssetHistoryModels: FileAssetHistoryCreationModel[], entityManager?: EntityManager) {
    const fileHistories = fileAssetHistoryModels.map((model) => this.buildFileAssetHistory(model));
    return await this.fileAssetHistoryEntityRepository.getRepository(entityManager).save(fileHistories);
  }

  public async saveFileAssetHistory(fileAssetHistoryModel: FileAssetHistoryCreationModel, entityManager?: EntityManager) {
    return (await this.saveFileAssetHistories([fileAssetHistoryModel], entityManager))[0];
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveFileAssetHistoryByFileAssetUuidAndOwnerId(
    fileAssetUuid: string,
    ownerId: number,
    query: FileAssetHistoryRequestDto,
    activityUuid?: string,
    entityManager?: EntityManager,
  ) {
    const { page, limit } = query;

    const [fileHistoryList, totalCount] = await this.fileAssetHistoryEntityRepository.findAndCountFileAssetHistoryByFileAssetUuidAndOwnerId(
      fileAssetUuid,
      ownerId,
      query,
      activityUuid,
      entityManager,
    );

    const nextPage = totalCount - page! * limit! > 0 ? page! + 1 : null;

    return { fileHistoryList, totalCount, nextPage };
  }

  // ===========================================================================
  // Upsert
  // ===========================================================================
  public async upsertLastViewedAt(userId: number, fileAssetId: number) {
    const lastViewedAt = new Date();

    const entry = await this.fileAssetHistoryEntityRepository.findFileAssetHistory(
      { where: { fileAssetId, type: Equal(FILE_ASSET_ACTION.VIEWED), actionById: Equal(userId) } },
      { toThrow: false },
    );

    entry
      ? await this.fileAssetHistoryEntityRepository.updateFileAssetHistory({ id: entry.id }, { lastViewedAt })
      : await this.insertFileAssetHistory({
          type: FILE_ASSET_ACTION.VIEWED,
          actionById: userId,
          fileAssetId,
          lastViewedAt,
        });
  }
}
