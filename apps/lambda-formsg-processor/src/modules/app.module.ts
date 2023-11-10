import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FormsgProcessorModule } from './features/formsg-processor/formsg-processor.module';
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
    FormsgProcessorModule,
  ],
})
export class AppModule {}
