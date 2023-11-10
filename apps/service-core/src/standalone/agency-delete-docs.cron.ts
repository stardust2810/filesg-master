import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AgencyDeleteCronModule } from '../modules/features/cron/agency-delete-docs.module';
import { AgencyDeleteDocumentsService } from '../modules/features/cron/agency-delete-docs.service';
import { FileSGConfigModule } from '../modules/setups/config/config.module';
import { validateEnvConfig } from '../modules/setups/config/validate.service';
import { DatabaseModule } from '../modules/setups/database/db.module';
import { DatabaseTransactionModule } from '../modules/setups/database/db-transaction.module';
import { FileSGLoggerModule } from '../modules/setups/logger/logger.module';
import { FileSGRedisModule } from '../modules/setups/redis/redis.module';

// =============================================================================
// Module
// =============================================================================
@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvConfig,
    }),
    FileSGConfigModule,
    FileSGLoggerModule,
    DatabaseModule,
    DatabaseTransactionModule,
    AgencyDeleteCronModule,
    FileSGRedisModule,
  ],
})
class AppModule {}

// =============================================================================
// Functions
// =============================================================================
async function bootstrap() {
  const logger = new Logger('agency-delete-docs cronJob');
  let app: NestExpressApplication | undefined;
  let isError = false;

  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
    app.useLogger(app.get(PinoLogger));
    app.flushLogs();

    const agencyDeleteDocumentsService = app.get(AgencyDeleteDocumentsService);
    // NOTE: File deletion will trigger revocation. To remove if file deletion no longer revokes OA
    await agencyDeleteDocumentsService.agencyDeleteDocuments();
  } catch (err) {
    logger.error(`agency-delete-docs cronJob failed with: ${JSON.stringify(err)}`);
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
