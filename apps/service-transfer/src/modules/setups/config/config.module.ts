import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AwsConfigService } from './aws-config.service';
import { FileSGConfigService } from './config.service';
import { HttpAgentConfigService } from './http-agent-config.service';
import { JwtConfigService } from './jwt-config.service';
import { OAConfigService } from './oa-config.service';
import { SystemConfigService } from './system-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [FileSGConfigService, SystemConfigService, JwtConfigService, AwsConfigService, OAConfigService, HttpAgentConfigService],
  exports: [FileSGConfigService],
})
export class FileSGConfigModule {}
