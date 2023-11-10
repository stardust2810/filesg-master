import { Injectable } from '@nestjs/common';

import { AgencyClientConfigService } from './agency-client-config.service';
import { ApexConfigService } from './apex-config.service';
import { AuthConfigService } from './auth-config.service';
import { AWSConfigService } from './aws-config.service';
import { CorppassConfigService } from './corppass-config.service';
import { DatabaseConfigService } from './database-config.service';
import { FormSgConfigService } from './formsg-config.service';
import { HttpAgentConfigService } from './http-agent-config.service';
import { MyinfoConfigService } from './myinfo-config.service';
import { NonSingpassAuthConfigService } from './non-singpass-auth-config.service';
import { NotificationConfigService } from './notification-config.service';
import { OaConfigService } from './oa-config.service';
import { OtpConfigService } from './otp-config.service';
import { RedisConfigService } from './redis-config.service';
import { SessionConfigService } from './session-config.service';
import { SgNotifyConfigService } from './sg-notify-config.service';
import { SingpassConfigService } from './singpass-config.service';
import { SystemConfigService } from './system-config.service';

@Injectable()
export class FileSGConfigService {
  constructor(
    private redisConfigService: RedisConfigService,
    private authConfigService: AuthConfigService,
    private nonSingpassAuthConfigService: NonSingpassAuthConfigService,
    private otpConfigService: OtpConfigService,
    private systemConfigService: SystemConfigService,
    private singpassConfigService: SingpassConfigService,
    private myinfoConfigService: MyinfoConfigService,
    private awsConfigService: AWSConfigService,
    private databaseConfigService: DatabaseConfigService,
    private notificationConfigService: NotificationConfigService,
    private sessionConfigService: SessionConfigService,
    private agencyConfigService: AgencyClientConfigService,
    private oaConfigService: OaConfigService,
    private sgNotifyConfigService: SgNotifyConfigService,
    private apexConfigService: ApexConfigService,
    private httpAgentConfigService: HttpAgentConfigService,
    private formSgConfigService: FormSgConfigService,
    private corppassConfigService: CorppassConfigService,
  ) {}

  get redisConfig() {
    return this.redisConfigService;
  }
  get authConfig() {
    return this.authConfigService;
  }
  get nonSingpassAuthConfig() {
    return this.nonSingpassAuthConfigService;
  }
  get otpConfig() {
    return this.otpConfigService;
  }
  get systemConfig() {
    return this.systemConfigService;
  }
  get singpassConfig() {
    return this.singpassConfigService;
  }
  get myinfoConfig() {
    return this.myinfoConfigService;
  }
  get awsConfig() {
    return this.awsConfigService;
  }
  get databaseConfig() {
    return this.databaseConfigService;
  }
  get notificationConfig() {
    return this.notificationConfigService;
  }
  get sessionConfig() {
    return this.sessionConfigService;
  }
  get agencyConfig() {
    return this.agencyConfigService;
  }
  get oaConfig() {
    return this.oaConfigService;
  }
  get sgNotifyConfig() {
    return this.sgNotifyConfigService;
  }
  get apexConfig() {
    return this.apexConfigService;
  }
  get httpAgentConfig() {
    return this.httpAgentConfigService;
  }
  get formSgConfig() {
    return this.formSgConfigService;
  }
  get corppassConfig() {
    return this.corppassConfigService;
  }
}
