import 'mysql2'; // force nx to bundle mysql2 lib in the build

import { TypeOrmModule } from '@nestjs/typeorm';

import { AcknowledgementTemplate } from '../../../entities/acknowledgement-template';
import { Activity } from '../../../entities/activity';
import { Agency } from '../../../entities/agency';
import { Application } from '../../../entities/application';
import { ApplicationType } from '../../../entities/application-type';
import { ApplicationTypeNotification } from '../../../entities/application-type-notification';
import { AuditEvent } from '../../../entities/audit-event';
import { Corporate } from '../../../entities/corporate';
import { CorporateUser } from '../../../entities/corporate-user';
import { Email } from '../../../entities/email';
import { EmailBlackList } from '../../../entities/email-black-list';
import { Eservice } from '../../../entities/eservice';
import { EserviceWhitelistedUser } from '../../../entities/eservice-whitelisted-user';
import { FileAsset } from '../../../entities/file-asset';
import { FileAssetAccess } from '../../../entities/file-asset-access';
import { FileAssetHistory } from '../../../entities/file-asset-history';
import { NotificationHistory } from '../../../entities/notification-history';
import { NotificationMessageInput } from '../../../entities/notification-message-input';
import { NotificationMessageTemplate } from '../../../entities/notification-message-template';
import { NotificationMessageTemplateAudit } from '../../../entities/notification-message-template-audit';
import { OACertificate } from '../../../entities/oa-certificate';
import { Transaction } from '../../../entities/transaction';
import { TransactionCustomMessageTemplate } from '../../../entities/transaction-custom-message-template';
import {
  AgencyUser,
  CitizenUser,
  CorporateBaseUser,
  CorporateUserBaseUser,
  EserviceUser,
  ProgrammaticUser,
  User,
} from '../../../entities/user';
import { DatabasePoolOptions } from '../../../typings/common';
import { FileSGConfigModule } from '../config/config.module';
import { FileSGConfigService } from '../config/config.service';

const entities = [
  AuditEvent,
  Agency,
  Eservice,
  User,
  AgencyUser,
  CitizenUser,
  ProgrammaticUser,
  EserviceUser,
  CorporateBaseUser,
  Corporate,
  CorporateUserBaseUser,
  CorporateUser,
  Application,
  FileAsset,
  FileAssetHistory,
  Transaction,
  Activity,
  OACertificate,
  Email,
  EmailBlackList,
  ApplicationType,
  AcknowledgementTemplate,
  FileAssetAccess,
  ApplicationTypeNotification,
  NotificationHistory,
  NotificationMessageTemplate,
  NotificationMessageTemplateAudit,
  NotificationMessageInput,
  TransactionCustomMessageTemplate,
  EserviceWhitelistedUser,
];

export const DatabaseModule = TypeOrmModule.forRootAsync({
  imports: [FileSGConfigModule],
  inject: [FileSGConfigService],
  useFactory: (configService: FileSGConfigService) => {
    const {
      host,
      port,
      username,
      password,
      name: database,
      migrationsRun,
      retryAttempts,
      logging,
      poolWaitForConnections,
      poolConnectionLimit,
      poolQueueLimit,
    } = configService.databaseConfig;

    const poolOptions: DatabasePoolOptions = {
      connectionLimit: poolConnectionLimit,
      waitForConnections: poolWaitForConnections,
      queueLimit: poolQueueLimit,
    };

    return {
      type: 'mysql',
      host,
      port,
      username,
      password,
      database,
      timezone: 'local',
      entities,
      migrationsRun, // migration will be manually ran by the pipeline
      retryAttempts,
      logging,
      extra: poolOptions,
    };
  },
});
