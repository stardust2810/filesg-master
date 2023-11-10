import 'dotenv/config';

import { FEATURE_TOGGLE } from '@filesg/common';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { AgencyClientModule } from './features/agency-client/agency-client.module';
import { AuditEventModule } from './features/audit-event/audit-event.module';
import { AuthModule } from './features/auth/auth.module';
import { AwsModule } from './features/aws/aws.module';
import { DeletionModule } from './features/deletion/deletion.module';
import { EmailModule } from './features/email/email.module';
import { FileModule } from './features/file/file.module';
import { FormSgModule } from './features/formsg/formsg.module';
import { MockAuthModule } from './features/mock-auth/mock-auth.module';
import { NonSingpassVerificationModule } from './features/non-singpass-verification/non-singpass-verification.module';
import { NotificationModule } from './features/notification/notification.module';
import { OpenAttestationModule } from './features/open-attestation/open-attestation.module';
import { OtpModule } from './features/otp/otp.module';
import { QueueHandlerModule } from './features/queue-handler/queue-handler.module';
import { SystemModule } from './features/system/system.module';
import { TransactionModule } from './features/transaction/transaction.module';
import { UserModule } from './features/user/user.module';
import { UserContactUpdateModule } from './features/user-contact-update/user-contact-update.module';
import { FileSGConfigModule } from './setups/config/config.module';
import { validateEnvConfig } from './setups/config/validate.service';
import { DatabaseModule } from './setups/database/db.module';
import { DatabaseTransactionModule } from './setups/database/db-transaction.module';
import { GuardModule } from './setups/guard/guard.module';
import { HealthCheckModule } from './setups/health-check/health-check.module';
import { InterceptorModule } from './setups/interceptor/interceptor.module';
import { FileSGLoggerModule } from './setups/logger/logger.module';
import { FileSGRedisModule } from './setups/redis/redis.module';
import { ThirdPartyApiMockModule } from './setups/third-party-api-mock/third-party-api-mock.module';

// This is so that we can use in SwaggerDocModule without needing to add module on both sides
// Any new modules please add here.
export const nonDatabaseModules = [
  ConfigModule.forRoot({
    validate: validateEnvConfig,
  }),
  FileSGConfigModule,
  AuthModule,
  TransactionModule,
  FileModule,
  AwsModule,
  FileSGLoggerModule,
  FileSGRedisModule,
  InterceptorModule,
  UserModule,
  OtpModule,
  OpenAttestationModule,
  TerminusModule,
  HealthCheckModule,
  GuardModule,
  QueueHandlerModule,
  EmailModule,
  NonSingpassVerificationModule,
  AgencyClientModule,
  UserContactUpdateModule,
  SystemModule,
  ThirdPartyApiMockModule,
  DeletionModule,
  NotificationModule,
  AuditEventModule,
  FormSgModule,
];

if (process.env.TOGGLE_MOCK_AUTH === FEATURE_TOGGLE.ON) {
  nonDatabaseModules.push(MockAuthModule);
}

@Module({
  imports: [...nonDatabaseModules, DatabaseModule, DatabaseTransactionModule],
})
export class RootModule {}
