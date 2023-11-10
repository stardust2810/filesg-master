import { CI_ENVIRONMENT, ENVIRONMENT, FEATURE_TOGGLE, LOG_LEVEL } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';

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
}
