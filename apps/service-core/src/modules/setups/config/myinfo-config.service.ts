import { EnvType } from '@govtechsg/singpass-myinfo-oidc-helper/dist/myinfo';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class MyinfoConfigService {
  constructor(private configService: ConfigService<MyinfoEnvironmentVariables>) {}

  get appId() {
    return this.configService.get('MYINFO_APP_ID', { infer: true })!;
  }
  get appSecret() {
    return this.configService.get('MYINFO_APP_SCT', { infer: true })!;
  }
  get privateKey() {
    return this.configService.get('MYINFO_PRIVATE_KEY', { infer: true })!.replace(/\\n/g, '\n');
  }
  get verificationCert() {
    return this.configService.get('MYINFO_VERIFICATION_CERT', { infer: true })!.replace(/\\n/g, '\n');
  }
  get authoriseUrl() {
    return this.configService.get('MYINFO_AUTHORISE_URL', { infer: true })!;
  }
  get tokenUrl() {
    return this.configService.get('MYINFO_TOKEN_URL', { infer: true })!;
  }
  get personUrl() {
    return this.configService.get('MYINFO_PERSON_URL', { infer: true })!;
  }
  get personBasicUrl() {
    return this.configService.get('MYINFO_PERSON_BASIC_URL', { infer: true })!;
  }
  get attributes() {
    return this.configService.get('MYINFO_USER_ATTRIBUTES', { infer: true })!;
  }
  get environment() {
    return this.configService.get('MYINFO_API_ENVIRONMENT', { infer: true })!;
  }
}

export class MyinfoEnvironmentVariables {
  @Expose()
  @IsString()
  MYINFO_APP_ID: string;

  @Expose()
  @IsString()
  MYINFO_APP_SCT: string;

  @Expose()
  @IsString()
  MYINFO_PRIVATE_KEY: string;

  @Expose()
  @IsString()
  MYINFO_VERIFICATION_CERT: string;

  @Expose()
  @IsString()
  MYINFO_AUTHORISE_URL: string;

  @Expose()
  @IsString()
  MYINFO_TOKEN_URL: string;

  @Expose()
  @IsString()
  MYINFO_PERSON_URL: string;

  @Expose()
  @IsString()
  MYINFO_PERSON_BASIC_URL: string;

  @Expose()
  @Transform(({ value }) => value.split(','))
  MYINFO_USER_ATTRIBUTES: string[];

  @Expose()
  @IsString()
  MYINFO_API_ENVIRONMENT: EnvType;
}
