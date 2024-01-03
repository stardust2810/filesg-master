import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { FileAssetHistoryEntityCorppassRepository } from './file-asset-history.entity.corppass.repository';
import { FileAssetHistoryEntityRepository } from './file-asset-history.entity.repository';
import { FileAssetHistoryEntityService } from './file-asset-history.entity.service';
import { FileAssetHistoryByFileAssetUuidAndOwnerIdDto } from './input/file-asset-history.input';

@Injectable()
export class CorppassFileAssetHistoryEntityService extends FileAssetHistoryEntityService {
  constructor(
    fileAssetHistoryEntityRepository: FileAssetHistoryEntityRepository,
    private readonly fileAssetHistoryEntityCorppassRepository: FileAssetHistoryEntityCorppassRepository,
  ) {
    super(fileAssetHistoryEntityRepository);
  }

  public async retrieveCorporateFileAssetHistoryByFileAssetUuidAndOwnerId(
    query: FileAssetHistoryByFileAssetUuidAndOwnerIdDto,
    entityManager?: EntityManager,
  ) {
    const { page, limit } = query;

    const [fileHistoryList, totalCount] =
      await this.fileAssetHistoryEntityCorppassRepository.findAndCountCorporateFileAssetHistoryByFileAssetUuidAndOwnerId(
        query,
        entityManager,
      );

    const nextPage = totalCount - page! * limit! > 0 ? page! + 1 : null;

    return { fileHistoryList, totalCount, nextPage };
  }
}
