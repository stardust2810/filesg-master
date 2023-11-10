import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileAsset } from '../../../entities/file-asset';
import { FileAssetEntityRepository } from './file-asset.entity.repository';
import { FileAssetEntityService } from './file-asset.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileAsset])],
  providers: [FileAssetEntityService, FileAssetEntityRepository],
  exports: [FileAssetEntityService],
})
export class FileAssetEntityModule {}
