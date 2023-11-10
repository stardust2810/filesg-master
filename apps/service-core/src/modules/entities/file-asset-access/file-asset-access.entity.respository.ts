import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { FileAssetAccess } from '../../../entities/file-asset-access';

@Injectable()
export class FileAssetAccessEntityRepository {
  public constructor(@InjectRepository(FileAssetAccess) private fileAssetAccessRepository: Repository<FileAssetAccess>) {}

  public getRepository(entityManager?: EntityManager) {
    return entityManager ? entityManager.getRepository(FileAssetAccess) : this.fileAssetAccessRepository;
  }

  // ===========================================================================
  // Retrieve
  // ===========================================================================
  public async findTokenUsingFileAssetId(fileAssetId: number, entityManager?: EntityManager) {
    // Currenly setting to get only one as we are only generating one token per file
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAssetAccess')
      .where('fileAssetId = :fileAssetId', { fileAssetId })
      .getOne();
  }

  public async verifyTokenBelongsToFileAssetId(token: string, fileAssetId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAssetAccess')
      .where('fileAssetId = :fileAssetId', { fileAssetId })
      .andWhere('token = :token', { token })
      .getOne();
  }

  // ===========================================================================
  // Delete
  // ===========================================================================
  public async deleteTokenUsingFileAssetId(fileAssetId: number, entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAssetAccess')
      .delete()
      .where('fileAssetId = :fileAssetId', { fileAssetId })
      .execute();
  }

  public async deleteTokensUsingFileAssetIds(fileAssetIds: number[], entityManager?: EntityManager) {
    return await this.getRepository(entityManager)
      .createQueryBuilder('fileAssetAccess')
      .delete()
      .where('fileAssetId IN (:...fileAssetIds)', { fileAssetIds })
      .execute();
  }
}
