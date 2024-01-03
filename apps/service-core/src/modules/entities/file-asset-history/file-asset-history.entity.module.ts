import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileAssetHistory } from '../../../entities/file-asset-history';
import { FileAssetHistoryEntityCorppassRepository } from './file-asset-history.entity.corppass.repository';
import { CorppassFileAssetHistoryEntityService } from './file-asset-history.entity.corppass.service';
import { FileAssetHistoryEntityRepository } from './file-asset-history.entity.repository';
import { FileAssetHistoryEntityService } from './file-asset-history.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileAssetHistory])],
  providers: [
    FileAssetHistoryEntityService,
    CorppassFileAssetHistoryEntityService,
    FileAssetHistoryEntityRepository,
    FileAssetHistoryEntityCorppassRepository,
  ],
  exports: [FileAssetHistoryEntityService, CorppassFileAssetHistoryEntityService],
})
export class FileAssetHistoryEntityModule {}
