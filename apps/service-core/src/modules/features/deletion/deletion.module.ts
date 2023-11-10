import { Module } from '@nestjs/common';

import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { TransactionEntityModule } from '../../entities/transaction/transaction.entity.module';
import { DatabaseTransactionModule } from '../../setups/database/db-transaction.module';
import { AwsModule } from '../aws/aws.module';
import { DeletionController } from './deletion.controller';
import { DeletionService } from './deletion.service';

@Module({
  imports: [AwsModule, DatabaseTransactionModule, TransactionEntityModule, ActivityEntityModule, FileAssetEntityModule],
  controllers: [DeletionController],
  providers: [DeletionService],
  exports: [DeletionService],
})
export class DeletionModule {}
