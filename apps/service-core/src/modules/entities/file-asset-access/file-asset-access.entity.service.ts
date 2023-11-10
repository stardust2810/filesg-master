import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { FileAssetAccess, FileAssetAccessCreationModel } from '../../../entities/file-asset-access';
import { FileAssetAccessEntityRepository } from './file-asset-access.entity.respository';

@Injectable()
export class FileAssetAccessEntityService {
  constructor(private readonly fileAssetAccessEntityRepository: FileAssetAccessEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildFileAssetAccess(fileAssetHistoryModel: FileAssetAccessCreationModel) {
    return this.fileAssetAccessEntityRepository.getRepository().create(fileAssetHistoryModel);
  }

  //create insert
  public async insertFileAssetAccess(fileAssetHistoryModel: FileAssetAccessCreationModel, entityManager?: EntityManager) {
    const fileAssetAccessRecord = this.buildFileAssetAccess(fileAssetHistoryModel);
    return await this.fileAssetAccessEntityRepository.getRepository(entityManager).insert(fileAssetAccessRecord);
  }

  public async saveFileAssetAccess(fileAssetHistoryModel: FileAssetAccessCreationModel, entityManager?: EntityManager) {
    const fileAssetAccessRecord = this.buildFileAssetAccess(fileAssetHistoryModel);
    return await this.fileAssetAccessEntityRepository.getRepository(entityManager).save(fileAssetAccessRecord);
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async retrieveTokenUsingFileAssetId(fileAssetId: number, entityManager?: EntityManager) {
    return await this.fileAssetAccessEntityRepository.findTokenUsingFileAssetId(fileAssetId, entityManager);
  }

  public async verifyTokenBelongsToFileAssetId(token: string, fileAssetId: number, entityManager?: EntityManager) {
    const fileAccessRecord = await this.fileAssetAccessEntityRepository.verifyTokenBelongsToFileAssetId(token, fileAssetId, entityManager);
    if (!fileAccessRecord) {
      throw new EntityNotFoundException(
        COMPONENT_ERROR_CODE.FILE_ASSET_ACCESS_SERVICE,
        FileAssetAccess.name,
        'token&fileAssetId',
        JSON.stringify({ token, fileAssetId }),
      );
    }
    return fileAccessRecord;
  }
  // ===========================================================================
  // Delete
  // ===========================================================================
  public async deleteTokenUsingFileAssetId(fileAssetId: number, entityManager?: EntityManager) {
    return await this.fileAssetAccessEntityRepository.deleteTokenUsingFileAssetId(fileAssetId, entityManager);
  }

  public async deleteTokensUsingFileAssetIds(fileAssetIds: number[], entityManager?: EntityManager) {
    return await this.fileAssetAccessEntityRepository.deleteTokensUsingFileAssetIds(fileAssetIds, entityManager);
  }
}
