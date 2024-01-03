import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileAsset } from '../../../entities/file-asset';
import { CorppassFileAssetEntityService } from './file-asset.entity.corpass.service';
import { CorppassFileAssetEntityRepository } from './file-asset.entity.corppass.repository';
import { FileAssetEntityRepository } from './file-asset.entity.repository';
import { FileAssetEntityService } from './file-asset.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileAsset])],
  providers: [FileAssetEntityService, CorppassFileAssetEntityService, FileAssetEntityRepository, CorppassFileAssetEntityRepository],
  exports: [FileAssetEntityService, CorppassFileAssetEntityService],
})
export class FileAssetEntityModule {}
