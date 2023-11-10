import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FileAssetHistory } from '../../../entities/file-asset-history';
import { FileAssetHistoryEntityRepository } from './file-asset-history.entity.repository';
import { FileAssetHistoryEntityService } from './file-asset-history.entity.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileAssetHistory])],
  providers: [FileAssetHistoryEntityService, FileAssetHistoryEntityRepository],
  exports: [FileAssetHistoryEntityService],
})
export class FileAssetHistoryEntityModule {}
