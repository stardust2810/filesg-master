import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsConfigService } from './aws-config.service';
import { FileSGConfigService } from './config.service';
import { RedisConfigService } from './redis-config.service';
import { SystemConfigService } from './system-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileSGConfigService, SystemConfigService, RedisConfigService, AwsConfigService],
  exports: [FileSGConfigService],
})
export class FileSGConfigModule {}
