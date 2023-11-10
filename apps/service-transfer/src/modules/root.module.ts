/* eslint-disable no-sparse-arrays */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './features/auth/auth.module';
import { AWSModule } from './features/aws/aws.module';
import { FileDownloadModule } from './features/file-download/file-download.module';
import { FileMoveModule } from './features/file-move/file-move.module';
import { FileUploadModule } from './features/file-upload/file-upload.module';
import { OaDocumentModule } from './features/oa-document/oa-document.module';
import { FileSGConfigModule } from './setups/config/config.module';
import { validateEnvConfig } from './setups/config/validate.service';
import { HealthCheckModule } from './setups/health-check/health-check.module';
import { InterceptorModule } from './setups/interceptor/interceptor.module';
import { FileSGLoggerModule } from './setups/logger/logger.module';

// Any new modules please add here.
export const nonDatabaseModules = [
  ConfigModule.forRoot({
    validate: validateEnvConfig,
  }),
  FileSGConfigModule,
  AuthModule,
  FileSGLoggerModule,
  InterceptorModule,
  AWSModule,
  FileUploadModule,
  FileMoveModule,
  OaDocumentModule,
  HealthCheckModule,
  FileDownloadModule,
];

@Module({
  imports: [...nonDatabaseModules],
})
export class RootModule {}
