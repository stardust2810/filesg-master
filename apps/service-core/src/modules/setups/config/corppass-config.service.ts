import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class CorppassConfigService {
  constructor(private configService: ConfigService<CorppassEnvironmentVariables>) {}

  get serviceId() {
    return this.configService.get('CORPPASS_SERVICE_ID', { infer: true })!;
  }
  get clientId() {
    return this.configService.get('CORPPASS_CLIENT_ID', { infer: true })!;
  }
  get redirectUrl() {
    return this.configService.get('CORPPASS_REDIRECT_URL', { infer: true })!;
  }
  get authUrl() {
    return this.configService.get('CORPPASS_AUTH_URL', { infer: true })!;
  }
  get openIdDiscoveryUrl() {
    return this.configService.get('CORPPASS_OPENID_DISCOVERY_ENDPOINT', { infer: true })!;
  }
  get tokenUrl() {
    return this.configService.get('CORPPASS_TOKEN_URL', { infer: true })!;
  }
  get jwksUrl() {
    return this.configService.get('CORPPASS_JWKS_ENDPOINT', { infer: true })!;
  }
}

export class CorppassEnvironmentVariables {
  @Expose()
  @IsString()
  CORPPASS_SERVICE_ID: string;

  @Expose()
  @IsString()
  CORPPASS_CLIENT_ID: string;

  @Expose()
  @IsString()
  CORPPASS_REDIRECT_URL: string;

  @Expose()
  @IsString()
  CORPPASS_AUTH_URL: string;

  @Expose()
  @IsString()
  CORPPASS_OPENID_DISCOVERY_ENDPOINT: string;

  @Expose()
  @IsString()
  CORPPASS_TOKEN_URL: string;

  @Expose()
  @IsString()
  CORPPASS_JWKS_ENDPOINT: string;
}
