import { Injectable } from '@nestjs/common';

import { AwsConfigService } from './aws-config.service';
import { RedisConfigService } from './redis-config.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class FileSGConfigService {
  constructor(
    private systemConfigService: SystemConfigService,
    private redisConfigService: RedisConfigService,
    private awsConfigService: AwsConfigService,
  ) {}

  get systemConfig() {
    return this.systemConfigService;
  }

  get redisConfig() {
    return this.redisConfigService;
  }

  get awsConfig() {
    return this.awsConfigService;
  }
}
