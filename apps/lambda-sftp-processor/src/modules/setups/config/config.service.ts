import { Injectable } from '@nestjs/common';

import { AWSConfigService } from './aws-config.service';
import { SliftConfigService } from './slift-config.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class FileSGConfigService {
  constructor(
    private systemConfigService: SystemConfigService,
    private awsConfigService: AWSConfigService,
    private sliftConfigService: SliftConfigService,
  ) {}

  get systemConfig() {
    return this.systemConfigService;
  }
  get awsConfig() {
    return this.awsConfigService;
  }

  get sliftConfig() {
    return this.sliftConfigService;
  }
}
