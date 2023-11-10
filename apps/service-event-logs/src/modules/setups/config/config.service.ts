import { Injectable } from '@nestjs/common';

import { AwsConfigService } from './aws-config.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class FileSGConfigService {
  constructor(private systemConfigService: SystemConfigService, private awsConfigService: AwsConfigService) {}

  get systemConfig() {
    return this.systemConfigService;
  }

  get awsConfig() {
    return this.awsConfigService;
  }
}
