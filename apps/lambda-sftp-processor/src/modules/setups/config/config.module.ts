import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AWSConfigService } from './aws-config.service';
import { FileSGConfigService } from './config.service';
import { SliftConfigService } from './slift-config.service';
import { SystemConfigService } from './system-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SystemConfigService, AWSConfigService, FileSGConfigService, SliftConfigService],
  exports: [FileSGConfigService],
})
export class FileSGConfigModule {}
