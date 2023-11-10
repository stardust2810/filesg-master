import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class ApexConfigService {
  constructor(private configService: ConfigService<ApexEnvironmentVariables>) {}

  get apexJwksPrivateKey() {
    return this.configService.get('JWKS_SIG_APEX_PRIVATEKEY_EC', { infer: true })!;
  }

  get apexIntranetApiKey() {
    return this.configService.get('APEX_INTRANET_API_KEY', { infer: true })!;
  }

  get apexIntranetUrl() {
    return this.configService.get('APEX_INT_URL', { infer: true })!;
  }

  get apexJwksKeyId() {
    return this.configService.get('APEX_JWKS_KEY_ID', { infer: true })!;
  }
}

export class ApexEnvironmentVariables {
  @Expose()
  @IsString()
  JWKS_SIG_APEX_PRIVATEKEY_EC: string;

  @Expose()
  @IsString()
  APEX_INTRANET_API_KEY: string;

  @Expose()
  @IsString()
  APEX_INT_URL: string;

  @Expose()
  @IsString()
  APEX_JWKS_KEY_ID: string;
}
