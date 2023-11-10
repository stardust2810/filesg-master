import { CI_ENVIRONMENT, ENVIRONMENT, FEATURE_TOGGLE, LOG_LEVEL } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsEnum, IsString } from 'class-validator';

@Injectable()
export class SystemConfigService {
  constructor(private configService: ConfigService<SystemEnvironmentVariables>) {}

  get env() {
    return this.configService.get('ENV', { infer: true })!;
  }

  get nodeEnv() {
    return this.configService.get('NODE_ENV', { infer: true })!;
  }

  get logLevel() {
    return this.configService.get('LOG_LEVEL', { infer: true })!;
  }

  get useLocalstack() {
    return this.configService.get('USE_LOCALSTACK', { infer: true })!;
  }

  get coreServiceUrl() {
    return this.configService.get('CORE_SERVICE_URL', { infer: true })!;
  }

  get transferServiceUrl() {
    return this.configService.get('TRANSFER_SERVICE_URL', { infer: true })!;
  }

  get eventLogsServiceUrl() {
    return this.configService.get('EVENT_LOGS_SERVICE_URL', { infer: true })!;
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
  @IsEnum(LOG_LEVEL)
  LOG_LEVEL: LOG_LEVEL;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  USE_LOCALSTACK: FEATURE_TOGGLE;

  @Expose()
  @IsString()
  CORE_SERVICE_URL: string;

  @Expose()
  @IsString()
  TRANSFER_SERVICE_URL: string;

  @Expose()
  @IsString()
  EVENT_LOGS_SERVICE_URL: string;
}
