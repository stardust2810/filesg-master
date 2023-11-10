import { Module } from '@nestjs/common';

import { ApplicationTypeNotificationEntityModule } from '../../entities/application-type-notification/application-type-notification.entity.module';
import { NotificationMessageTemplateEntityModule } from '../../entities/notification-message-template/notification-message-template.entity.module';
import { TransactionCustomMessageTemplateEntityModule } from '../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { NotificationModule } from '../notification/notification.module';
import { TransactionModule } from '../transaction/transaction.module';
import { FormSgController } from './formsg.controller';
import { FormSgService } from './formsg.service';
import { FormSgTransactionService } from './formsg-transaction.service';

@Module({
  imports: [
    TransactionModule,
    UserEntityModule,
    ApplicationTypeNotificationEntityModule,
    NotificationMessageTemplateEntityModule,
    TransactionCustomMessageTemplateEntityModule,
    NotificationModule,
  ],
  providers: [FormSgService, FormSgTransactionService],
  controllers: [FormSgController],
})
export class FormSgModule {}
