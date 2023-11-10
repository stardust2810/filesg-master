import { Module } from '@nestjs/common';

import { AcknowledgementTemplateEntityModule } from '../../entities/acknowledgement-template/acknowledgement-template.entity.module';
import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { ApplicationEntityModule } from '../../entities/application/application.entity.module';
import { ApplicationTypeEntityModule } from '../../entities/application-type/application-type.entity.module';
import { ApplicationTypeNotificationEntityModule } from '../../entities/application-type-notification/application-type-notification.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { FileAssetHistoryEntityModule } from '../../entities/file-asset-history/file-asset-history.entity.module';
import { NotificationMessageInputEntityModule } from '../../entities/notification-message-input/notification-message-input.entity.module';
import { NotificationMessageTemplateEntityModule } from '../../entities/notification-message-template/notification-message-template.entity.module';
import { OaCertificateEntityModule } from '../../entities/oa-certificate/oa-certificate.entity.module';
import { TransactionEntityModule } from '../../entities/transaction/transaction.entity.module';
import { TransactionCustomMessageTemplateEntityModule } from '../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { AuthModule } from '../auth/auth.module';
import { DeletionModule } from '../deletion/deletion.module';
import { EmailModule } from '../email/email.module';
import { NotificationModule } from '../notification/notification.module';
import { FileTransactionService } from './file-transaction.service';
import { FileTransactionV2Service } from './file-transaction.v2.service';
import { RecallTransactionService } from './recall-transaction.service';
import { RecipientService } from './recipient.service';
import { RevokeTransactionService } from './revoke-transaction.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { TransactionV2Controller } from './transaction.v2.controller';
import { TransactionActivityService } from './transaction-activity.service';

@Module({
  imports: [
    UserEntityModule,
    AuthModule,
    ActivityEntityModule,
    FileAssetEntityModule,
    ApplicationEntityModule,
    TransactionEntityModule,
    ApplicationTypeEntityModule,
    FileAssetHistoryEntityModule,
    EmailModule,
    AcknowledgementTemplateEntityModule,
    NotificationModule,
    OaCertificateEntityModule,
    TransactionCustomMessageTemplateEntityModule,
    ApplicationTypeNotificationEntityModule,
    NotificationMessageInputEntityModule,
    NotificationMessageTemplateEntityModule,
    DeletionModule,
  ],
  providers: [
    FileTransactionService,
    RevokeTransactionService,
    RecipientService,
    TransactionActivityService,
    FileTransactionV2Service,
    RecallTransactionService,
    TransactionService,
  ],
  exports: [RecallTransactionService, FileTransactionV2Service],
  controllers: [TransactionController, TransactionV2Controller],
})
export class TransactionModule {}
