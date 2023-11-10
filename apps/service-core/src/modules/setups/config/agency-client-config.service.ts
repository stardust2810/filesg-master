import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class AgencyClientConfigService {
  constructor(private configService: ConfigService<AgencyEnvironmentVariables>) {}

  get myIcaDologinUrl() {
    return this.configService.get('AGENCY_CLIENT_MYICA_DOLOGIN_URL', { infer: true })!;
  }

  get mccApiUrl() {
    return this.configService.get('AGENCY_CLIENT_MCC_API_URL', { infer: true })!;
  }

  get cirisMmbsSystemId() {
    return this.configService.get('CIRIS_MMBS_SYSTEM_ID', { infer: true })!;
  }

  get cirisMmbsSystemPw() {
    return this.configService.get('CIRIS_MMBS_SYSTEM_PW', { infer: true })!;
  }
}

export class AgencyEnvironmentVariables {
  @Expose()
  @IsString()
  AGENCY_CLIENT_MYICA_DOLOGIN_URL: string;

  @Expose()
  @IsString()
  AGENCY_CLIENT_MCC_API_URL: string;

  @Expose()
  @IsString()
  CIRIS_MMBS_SYSTEM_ID: string;

  @Expose()
  @IsString()
  CIRIS_MMBS_SYSTEM_PW: string;
}
