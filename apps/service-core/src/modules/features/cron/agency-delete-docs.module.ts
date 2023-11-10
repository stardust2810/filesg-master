import { Module } from '@nestjs/common';

import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { DeletionModule } from '../deletion/deletion.module';
import { AgencyDeleteDocumentsService } from './agency-delete-docs.service';

@Module({
  imports: [FileAssetEntityModule, DeletionModule],
  providers: [AgencyDeleteDocumentsService],
})
export class AgencyDeleteCronModule {}
