import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileAssetAccess } from '../../../entities/file-asset-access';
import { FileAssetAccessEntityRepository } from './file-asset-access.entity.respository';
import { FileAssetAccessEntityService } from './file-asset-access.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileAssetAccess])],
  providers: [FileAssetAccessEntityService, FileAssetAccessEntityRepository],
  exports: [FileAssetAccessEntityService],
})
export class FileAssetAccessEntityModule {}
