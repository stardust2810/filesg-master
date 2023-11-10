import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsConfigService } from './aws-config.service';
import { FileSGConfigService } from './config.service';
import { SystemConfigService } from './system-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileSGConfigService, SystemConfigService, AwsConfigService],
  exports: [FileSGConfigService],
})
export class FileSGConfigModule {}
