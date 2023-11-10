import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsModule } from './features/aws/aws.module';
import { ScanResultProcessorModule } from './features/scan-result-processor/scan-result-processor.module';
import { FileSGConfigModule } from './setups/config/config.module';
import { validateEnvConfig } from './setups/config/validate.service';
import { FileSGLoggerModule } from './setups/logger/logger.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateEnvConfig,
    }),
    FileSGConfigModule,
    AwsModule,
    FileSGLoggerModule,
    ScanResultProcessorModule,
  ],
})
export class AppModule {}
