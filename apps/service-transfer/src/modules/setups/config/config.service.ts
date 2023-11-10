import { Injectable } from '@nestjs/common';

import { AwsConfigService } from './aws-config.service';
import { HttpAgentConfigService } from './http-agent-config.service';
import { JwtConfigService } from './jwt-config.service';
import { OAConfigService } from './oa-config.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class FileSGConfigService {
  constructor(
    private systemConfigService: SystemConfigService,
    private jwtConfigService: JwtConfigService,
    private awsConfigService: AwsConfigService,
    private oaConfigService: OAConfigService,
    private httpAgentConfigService: HttpAgentConfigService,
  ) {}

  get systemConfig() {
    return this.systemConfigService;
  }

  get jwtConfig() {
    return this.jwtConfigService;
  }

  get awsConfig() {
    return this.awsConfigService;
  }

  get oaConfig() {
    return this.oaConfigService;
  }

  get httpAgentConfig() {
    return this.httpAgentConfigService;
  }
}
