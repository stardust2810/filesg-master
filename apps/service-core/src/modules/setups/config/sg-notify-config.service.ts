import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class SgNotifyConfigService {
  constructor(private configService: ConfigService<SgNotifyEnvironmentVariables>) {}

  get clientId() {
    return this.configService.get('SG_NOTIFY_CLIENT_ID', { infer: true })!;
  }

  get clientSecret() {
    return this.configService.get('SG_NOTIFY_CLIENT_SECRET', { infer: true })!;
  }

  get apiEndpoint() {
    return this.configService.get('SG_NOTIFY_API_ENDPOINT', { infer: true })!;
  }

  get jwksEndpoint() {
    return this.configService.get('SG_NOTIFY_JWKS_ENDPOINT', { infer: true })!;
  }
}

export class SgNotifyEnvironmentVariables {
  @Expose()
  @IsString()
  SG_NOTIFY_CLIENT_ID: string;

  @Expose()
  @IsString()
  SG_NOTIFY_CLIENT_SECRET: string;

  @Expose()
  @IsString()
  SG_NOTIFY_API_ENDPOINT: string;

  @Expose()
  @IsString()
  SG_NOTIFY_JWKS_ENDPOINT: string;
}
