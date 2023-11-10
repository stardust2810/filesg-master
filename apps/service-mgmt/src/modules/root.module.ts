import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';

import { FileDownloadModule } from './features/file-download/file-download.module';
import { FileUploadAuthModule } from './features/file-upload-auth/file-upload-auth.module';
import { TransferInfoModule } from './features/transfer-info/transfer-info.module';
import { FileSGConfigModule } from './setups/config/config.module';
import { validateEnvConfig } from './setups/config/validate.service';
import { HealthCheckModule } from './setups/health-check/health-check.module';
import { InterceptorModule } from './setups/interceptor/interceptor.module';
import { FileSGLoggerModule } from './setups/logger/logger.module';
import { FileSGRedisModule } from './setups/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvConfig,
    }),
    FileSGConfigModule,
    FileSGRedisModule,
    FileSGLoggerModule,
    InterceptorModule,
    TerminusModule,
    TransferInfoModule,
    HealthCheckModule,
    FileDownloadModule,
    FileUploadAuthModule,
  ],
})
export class RootModule {}
