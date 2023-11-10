import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { SftpProcessorModule } from './features/sftp-processor/sftp-processor.module';
import { FileSGConfigModule } from './setups/config/config.module';
import { validateEnvConfig } from './setups/config/validate.service';
import { FileSGLoggerModule } from './setups/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvConfig,
    }),
    FileSGConfigModule,
    FileSGLoggerModule,
    SftpProcessorModule,
  ],
})
export class AppModule {}
