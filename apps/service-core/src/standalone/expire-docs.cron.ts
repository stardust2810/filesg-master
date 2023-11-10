import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger as PinoLogger } from 'nestjs-pino';

import { ExpireDocsCronModule } from '../modules/features/cron/expire-docs.module';
import { ExpireDocumentsService } from '../modules/features/cron/expire-docs.service';
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
    ExpireDocsCronModule,
    FileSGRedisModule,
  ],
})
class AppModule {}

// =============================================================================
// Functions
// =============================================================================
async function bootstrap() {
  const logger = new Logger('expire-docs cronJob');
  let app: NestExpressApplication | undefined;
  let isError = false;

  try {
    app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true });
    app.useLogger(app.get(PinoLogger));
    app.flushLogs();

    const expireDocumentsService = app.get(ExpireDocumentsService);
    await expireDocumentsService.expireDocuments();
  } catch (err) {
    logger.error(`expire-docs cronJob failed with: ${JSON.stringify(err)}`);
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
