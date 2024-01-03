import { EntityNotFoundException, getNextPage } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { FileAsset } from '../../../entities/file-asset';
import { CorppassFileAssetEntityRepository } from './file-asset.entity.corppass.repository';
import { FindCorporateRecentViewableFileAssetsInputs } from './interface/file-asset.interface';

@Injectable()
export class CorppassFileAssetEntityService {
  private readonly logger = new Logger(CorppassFileAssetEntityService.name);

  constructor(private readonly corppassFileAssetEntityRepository: CorppassFileAssetEntityRepository) {}

  public async retrieveCorporateFileAssetByUuidAndUserId(
    uuid: string,
    corporateId: number,
    activityUuid?: string,
    agencyCodes?: string[],
    entityManager?: EntityManager,
  ) {
    const fileAsset = await this.corppassFileAssetEntityRepository.findCorporateFileAssetByUuidAndUserId(
      uuid,
      corporateId,
      activityUuid,
      agencyCodes,
      entityManager,
    );

    if (!fileAsset) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', uuid);
    }

    return fileAsset;
  }

  public async retrieveCorporateRecentFileAssets(inputs: FindCorporateRecentViewableFileAssetsInputs, entityManager?: EntityManager) {
    const { query } = inputs;

    // get files by ownerId
    const [fileAssets, count] = await this.corppassFileAssetEntityRepository.findCorporateRecentFileAssets(inputs, entityManager);
    const next = getNextPage(count, query.page!, query.limit!);
    return { fileAssets, count, next };
  }

  public async retrieveAccessibleCorporateFileAssetByUuidAndUserId(
    uuid: string,
    corporateId: number,
    activityUuid?: string,
    agencyCodes?: string[],
    entityManager?: EntityManager,
  ) {
    const fileAsset = await this.corppassFileAssetEntityRepository.findAccessibleCorporateFileAssetByUuidAndUserId(
      uuid,
      corporateId,
      activityUuid,
      agencyCodes,
      entityManager,
    );

    if (!fileAsset) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FILE_SERVICE, FileAsset.name, 'uuid', uuid);
    }

    return fileAsset;
  }

  public async retrieveActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
    uuids: string[],
    userId: number,
    agencyCodes?: string[],
    activityUuid?: string,
    entityManager?: EntityManager,
  ) {
    return await this.corppassFileAssetEntityRepository.findCorporateActivatedFileAssetsWithApplicationTypeByUuidsAndUserId(
      uuids,
      userId,
      agencyCodes,
      activityUuid,
      entityManager,
    );
  }
}
