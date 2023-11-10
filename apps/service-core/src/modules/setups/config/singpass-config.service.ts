import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class SingpassConfigService {
  constructor(private configService: ConfigService<SingpassEnvironmentVariables>) {}

  get serviceId() {
    return this.configService.get('SINGPASS_SERVICE_ID', { infer: true })!;
  }
  get clientId() {
    return this.configService.get('SINGPASS_CLIENT_ID', { infer: true })!;
  }
  get redirectUrl() {
    return this.configService.get('SINGPASS_REDIRECT_URL', { infer: true })!;
  }
  get authUrl() {
    return this.configService.get('SINGPASS_AUTH_URL', { infer: true })!;
  }
  get openIdDiscoveryUrl() {
    return this.configService.get('SINGPASS_OPENID_DISCOVERY_ENDPOINT', { infer: true })!;
  }
  get tokenUrl() {
    return this.configService.get('SINGPASS_TOKEN_URL', { infer: true })!;
  }
  get jwksUrl() {
    return this.configService.get('SINGPASS_JWKS_ENDPOINT', { infer: true })!;
  }
}

export class SingpassEnvironmentVariables {
  @Expose()
  @IsString()
  SINGPASS_SERVICE_ID: string;

  @Expose()
  @IsString()
  SINGPASS_CLIENT_ID: string;

  @Expose()
  @IsString()
  SINGPASS_REDIRECT_URL: string;

  @Expose()
  @IsString()
  SINGPASS_AUTH_URL: string;

  @Expose()
  @IsString()
  SINGPASS_OPENID_DISCOVERY_ENDPOINT: string;

  @Expose()
  @IsString()
  SINGPASS_TOKEN_URL: string;

  @Expose()
  @IsString()
  SINGPASS_JWKS_ENDPOINT: string;
}
