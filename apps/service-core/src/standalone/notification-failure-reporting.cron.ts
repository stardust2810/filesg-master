import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';

import { NotificationFailureReportingModule } from '../modules/features/cron/notification-failure-reporting.module';
import { NotificationFailureReportingService } from '../modules/features/cron/notification-failure-reporting.service';
import { FileSGConfigModule } from '../modules/setups/config/config.module';
import { validateEnvConfig } from '../modules/setups/config/validate.service';
import { DatabaseModule } from '../modules/setups/database/db.module';
import { DatabaseTransactionModule } from '../modules/setups/database/db-transaction.module';
import { FileSGLoggerModule } from '../modules/setups/logger/logger.module';
import { FileSGRedisModule } from '../modules/setups/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvConfig,
    }),
    FileSGConfigModule,
    FileSGLoggerModule,
    DatabaseModule,
    DatabaseTransactionModule,
    FileSGRedisModule,
    NotificationFailureReportingModule,
  ],
})
class AppModule {}

// =============================================================================
// Functions
// =============================================================================
async function bootstrap() {
  const logger = new Logger('notification-failure-reporting cronJob');
  let app: NestExpressApplication | undefined;
  let isError = false;

  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
    app.useLogger(app.get(PinoLogger));
    app.flushLogs();

    const notificationFailureReportingService = app.get(NotificationFailureReportingService);
    await notificationFailureReportingService.generateNotificationFailureReport();
  } catch (err) {
    logger.error(`Failed with: ${JSON.stringify(err)}`);
    isError = true;
  } finally {
    await app?.close();

    if (isError) {
      process.exit(1);
    }
    process.exit(0);
  }
}

// =============================================================================
// Main
// =============================================================================
bootstrap();
