import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthConfigService } from './auth-config.service';
import { AWSConfigService } from './aws-config.service';
import { FileSGConfigService } from './config.service';
import { FormSGConfigService } from './formsg-config.service';
import { SystemConfigService } from './system-config.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [SystemConfigService, AWSConfigService, FileSGConfigService, AuthConfigService, FormSGConfigService],
  exports: [FileSGConfigService],
})
export class FileSGConfigModule {}
