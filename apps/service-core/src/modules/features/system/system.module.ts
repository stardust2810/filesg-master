import { ZipperModule } from '@filesg/zipper';
import { Module } from '@nestjs/common';

import { AcknowledgementTemplateEntityModule } from '../../entities/acknowledgement-template/acknowledgement-template.entity.module';
import { ActivityEntityModule } from '../../entities/activity/activity.entity.module';
import { AgencyEntityModule } from '../../entities/agency/agency.entity.module';
import { ApplicationEntityModule } from '../../entities/application/application.entity.module';
import { ApplicationTypeEntityModule } from '../../entities/application-type/application-type.entity.module';
import { ApplicationTypeNotificationEntityModule } from '../../entities/application-type-notification/application-type-notification.entity.module';
import { AuditEventEntityModule } from '../../entities/audit-event/audit-event.entity.module';
import { EmailBlackListEntityModule } from '../../entities/email-black-list/email-black-list.entity.module';
import { EserviceEntityModule } from '../../entities/eservice/eservice.entity.module';
import { EserviceWhitelistedUserEntityModule } from '../../entities/eservice-whitelisted-user/eservice-whitelisted-user.entity.module';
import { FileAssetEntityModule } from '../../entities/file-asset/file-asset.entity.module';
import { NotificationMessageTemplateEntityModule } from '../../entities/notification-message-template/notification-message-template.entity.module';
import { NotificationMessageTemplateAuditEntityModule } from '../../entities/notification-message-template-audit/notification-message-template-audit.entity.module';
import { TransactionEntityModule } from '../../entities/transaction/transaction.entity.module';
import { TransactionCustomMessageTemplateEntityModule } from '../../entities/transaction-custom-message-template/transaction-custom-message-template.entity.module';
import { UserEntityModule } from '../../entities/user/user.entity.module';
import { NotificationModule } from '../notification/notification.module';
import { AgencyOnboardingService } from './agency-onboarding.service';
import { ReportingService } from './reporting.service';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [
    AuditEventEntityModule,
    ActivityEntityModule,
    EmailBlackListEntityModule,
    UserEntityModule,
    AgencyEntityModule,
    EserviceWhitelistedUserEntityModule,
    FileAssetEntityModule,
    ApplicationTypeEntityModule,
    EserviceEntityModule,
    AcknowledgementTemplateEntityModule,
    NotificationMessageTemplateEntityModule,
    NotificationMessageTemplateAuditEntityModule,
    TransactionEntityModule,
    ZipperModule,
    NotificationModule,
    TransactionCustomMessageTemplateEntityModule,
    ApplicationTypeNotificationEntityModule,
    ApplicationEntityModule,
  ],
  providers: [AgencyOnboardingService, ReportingService, SystemService],
  controllers: [SystemController],
})
export class SystemModule {}
