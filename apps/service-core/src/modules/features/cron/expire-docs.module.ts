import { Module } from '@nestjs/common';

import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { FileAssetHistoryEntityModule } from '../../entities/file-asset-history/file-asset-history.entity.module';
import { OaCertificateEntityModule } from '../../entities/oa-certificate/oa-certificate.entity.module';
import { TransactionEntityModule } from '../../entities/transaction/transaction.entity.module';
import { DatabaseTransactionModule } from '../../setups/database/db-transaction.module';
import { NotificationModule } from '../notification/notification.module';
import { ExpireDocumentsService } from './expire-docs.service';

@Module({
  imports: [
    ActivityEntityModule,
    TransactionEntityModule,
    DatabaseTransactionModule,
    FileAssetEntityModule,
    FileAssetHistoryEntityModule,
    OaCertificateEntityModule,
    NotificationModule,
  ],
  providers: [ExpireDocumentsService],
})
export class ExpireDocsCronModule {}
