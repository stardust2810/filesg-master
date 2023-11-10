import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AgencyClientConfigService } from './agency-client-config.service';
import { ApexConfigService } from './apex-config.service';
import { AuthConfigService } from './auth-config.service';
import { AWSConfigService } from './aws-config.service';
import { FileSGConfigService } from './config.service';
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

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisConfigService,
    AuthConfigService,
    OtpConfigService,
    SystemConfigService,
    SingpassConfigService,
    MyinfoConfigService,
    AWSConfigService,
    DatabaseConfigService,
    FileSGConfigService,
    NotificationConfigService,
    NonSingpassAuthConfigService,
    SessionConfigService,
    AgencyClientConfigService,
    OaConfigService,
    SgNotifyConfigService,
    ApexConfigService,
    HttpAgentConfigService,
    FormSgConfigService,
    CorppassConfigService,
  ],
  exports: [FileSGConfigService],
})
export class FileSGConfigModule {}
