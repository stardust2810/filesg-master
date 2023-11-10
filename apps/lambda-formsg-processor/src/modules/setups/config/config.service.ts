import { Injectable } from '@nestjs/common';

import { AuthConfigService } from './auth-config.service';
import { AWSConfigService } from './aws-config.service';
import { FormSGConfigService } from './formsg-config.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class FileSGConfigService {
  constructor(
    private systemConfigService: SystemConfigService,
    private awsConfigService: AWSConfigService,
    private authConfigService: AuthConfigService,
    private formSGConfigService: FormSGConfigService,
  ) {}

  get systemConfig() {
    return this.systemConfigService;
  }

  get awsConfig() {
    return this.awsConfigService;
  }

  get authConfig() {
    return this.authConfigService;
  }

  get formSGConfig() {
    return this.formSGConfigService;
  }
}
