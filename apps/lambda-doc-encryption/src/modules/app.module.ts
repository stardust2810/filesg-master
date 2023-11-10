import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DocEncryptionModule } from './features/doc-encryption/doc-encryption.module';
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
    DocEncryptionModule,
  ],
})
export class AppModule {}
