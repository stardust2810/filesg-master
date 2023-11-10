import { CI_ENVIRONMENT, ENVIRONMENT, FEATURE_TOGGLE, LOG_LEVEL, numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

@Injectable()
export class SystemConfigService {
  constructor(private configService: ConfigService<SystemEnvironmentVariables>) {}

  get env() {
    return this.configService.get('ENV', { infer: true })!;
  }

  get nodeEnv() {
    return this.configService.get('NODE_ENV', { infer: true })!;
  }

  get appName() {
    return this.configService.get('APP_NAME', { infer: true })!;
  }

  get appVersion() {
    return this.configService.get('APP_VERSION', { infer: true })!;
  }

  get serviceName() {
    return this.configService.get('SERVICE_NAME', { infer: true })!;
  }

  get port() {
    return this.configService.get('PORT', { infer: true })!;
  }

  get logLevel() {
    return this.configService.get('LOG_LEVEL', { infer: true })!;
  }

  get prefixHashSecret() {
    return this.configService.get('PREFIX_HASH_SECRET', { infer: true })!;
  }

  get useLocalstack() {
    return this.configService.get('USE_LOCALSTACK', { infer: true })!;
  }
}

export class SystemEnvironmentVariables {
  @Expose()
  @IsEnum(CI_ENVIRONMENT)
  ENV: CI_ENVIRONMENT;

  @Expose()
  @IsEnum(ENVIRONMENT)
  NODE_ENV: ENVIRONMENT;

  @Expose()
  @IsString()
  APP_NAME: string;

  @Expose()
  @IsString()
  APP_VERSION: string;

  @Expose()
  @IsString()
  SERVICE_NAME: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  PORT: number;

  @Expose()
  @IsEnum(LOG_LEVEL)
  LOG_LEVEL: LOG_LEVEL;

  @Expose()
  @IsString()
  PREFIX_HASH_SECRET: string;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  USE_LOCALSTACK: FEATURE_TOGGLE;
}
