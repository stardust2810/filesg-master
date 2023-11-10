import { Module } from '@nestjs/common';

import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { EmailBlackListEntityModule } from '../../entities/email-black-list/email-black-list.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { FileAssetAccessEntityModule } from '../../entities/file-asset-access/file-asset-access.entity.module';
import { FileAssetHistoryEntityModule } from '../../entities/file-asset-history/file-asset-history.entity.module';
import { NotificationHistoryEntityModule } from '../../entities/notification-history/notification-history.entity.module';
import { OaCertificateEntityModule } from '../../entities/oa-certificate/oa-certificate.entity.module';
import { TransactionEntityModule } from '../../entities/transaction/transaction.entity.module';
import { ApiClientModule } from '../../setups/api-client/api-client.module';
import { DatabaseTransactionModule } from '../../setups/database/db-transaction.module';
import { AwsModule } from '../aws/aws.module';
import { DeletionModule } from '../deletion/deletion.module';
import { NotificationModule } from '../notification/notification.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CoreEventsQueueHandlerService } from './core-events-queue-handler.service';
import { DeleteEventService } from './events/delete-event.service';
import { DownloadEventService } from './events/download-event.service';
import { TransactionalEmailHandlerService } from './events/email-type-handlers/transactional-email-handler.service';
import { FormSgEventService } from './events/formsg-event.service';
import { MoveEventService } from './events/move-event.service';
import { PostScanEventService } from './events/post-scan-event.service';
import { UploadEventService } from './events/upload-event.service';
import { SesNotificationQueueHandlerService } from './ses-notification-queue-handler.service';

@Module({
  imports: [
    AwsModule,
    FileAssetEntityModule,
    FileAssetHistoryEntityModule,
    DatabaseTransactionModule,
    EmailBlackListEntityModule,
    TransactionEntityModule,
    ActivityEntityModule,
    OaCertificateEntityModule,
    DeletionModule,
    FileAssetAccessEntityModule,
    NotificationModule,
    NotificationHistoryEntityModule,
    OaCertificateEntityModule,
    ApiClientModule,
    TransactionModule,
  ],
  providers: [
    CoreEventsQueueHandlerService,
    UploadEventService,
    PostScanEventService,
    MoveEventService,
    DownloadEventService,
    SesNotificationQueueHandlerService,
    TransactionalEmailHandlerService,
    DeleteEventService,
    FormSgEventService,
  ],
})
export class QueueHandlerModule {}
