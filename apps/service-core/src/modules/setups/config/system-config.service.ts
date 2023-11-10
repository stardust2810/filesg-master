import { CI_ENVIRONMENT, ENVIRONMENT, FEATURE_TOGGLE, LOG_LEVEL } from '@filesg/common';
import { numberTransformer } from '@filesg/common';
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
  get port() {
    return parseInt(this.configService.get('PORT', { infer: true })!);
  }
  get protocol() {
    return this.configService.get('PROTOCOL', { infer: true })!;
  }
  get appVersion() {
    return this.configService.get('APP_VERSION', { infer: true })!;
  }
  get logLevel() {
    return this.configService.get('LOG_LEVEL', { infer: true })!;
  }
  get serviceName() {
    return this.configService.get('SERVICE_NAME', { infer: true })!;
  }
  get pollingSleepTimeInSeconds() {
    return this.configService.get('POLLING_SLEEP_TIME_IN_SECONDS', { infer: true })!;
  }
  get fileSGBaseURL() {
    return this.configService.get('FILESG_BASE_URL', { infer: true })!;
  }
  get eventLogsServiceName() {
    return this.configService.get('EVENT_LOGS_SERVICE_NAME', { infer: true })!;
  }
  get eventLogsServiceUrl() {
    return this.configService.get('EVENT_LOGS_SERVICE_URL', { infer: true })!;
  }
  get toggleMockAuth() {
    return this.configService.get('TOGGLE_MOCK_AUTH', { infer: true })!;
  }
  get toggleOnboardingReset() {
    return this.configService.get('TOGGLE_ONBOARDING_RESET', { infer: true })!;
  }
  get toggleActivityAcknowledgementReset() {
    return this.configService.get('TOGGLE_ACTIVITY_ACKNOWLEDGEMENT_RESET', { infer: true })!;
  }
  get toggleMockThirdPartyApi() {
    return this.configService.get('TOGGLE_MOCK_THIRD_PARTY_API', { infer: true })!;
  }
  get togglePerformanceTest() {
    return this.configService.get('TOGGLE_PERFORMANCE_TEST', { infer: true })!;
  }
  get infuraApiKey() {
    return this.configService.get('INFURA_API_KEY', { infer: true })!;
  }
  get alchemyApiKey() {
    return this.configService.get('ALCHEMY_API_KEY', { infer: true })!;
  }
  get ethNetworkName() {
    return this.configService.get('ETH_NETWORK_NAME', { infer: true })!;
  }
  get useLocalstack() {
    return this.configService.get('USE_LOCALSTACK', { infer: true })!;
  }
  
  // Custom getters
  get eventLogsServiceFullUrl() {
    return `${this.protocol}://${this.eventLogsServiceUrl}/api/${this.eventLogsServiceName}`;
  }
}

export class SystemEnvironmentVariables {
  @Expose()
  @IsEnum(CI_ENVIRONMENT)
  ENV: CI_ENVIRONMENT;

  @Expose()
  @IsEnum(ENVIRONMENT)
  NODE_ENV: ENVIRONMENT;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  PORT: number;

  @Expose()
  @IsString()
  APP_VERSION: string;

  @Expose()
  @IsEnum(LOG_LEVEL)
  LOG_LEVEL: LOG_LEVEL;

  @Expose()
  @IsString()
  SERVICE_NAME: string;

  @Expose()
  @IsString()
  PROTOCOL: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  POLLING_SLEEP_TIME_IN_SECONDS: number;

  @Expose()
  @IsString()
  FILESG_BASE_URL: string;

  @Expose()
  @IsString()
  EVENT_LOGS_SERVICE_NAME: string;

  @Expose()
  @IsString()
  EVENT_LOGS_SERVICE_URL: string;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_MOCK_AUTH: FEATURE_TOGGLE;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_ONBOARDING_RESET: FEATURE_TOGGLE;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_ACTIVITY_ACKNOWLEDGEMENT_RESET: FEATURE_TOGGLE;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_MOCK_THIRD_PARTY_API: FEATURE_TOGGLE;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_PERFORMANCE_TEST: FEATURE_TOGGLE;

  @Expose()
  @IsString()
  INFURA_API_KEY: string;

  @Expose()
  @IsString()
  ALCHEMY_API_KEY: string;

  @Expose()
  @IsString()
  ETH_NETWORK_NAME: string;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  USE_LOCALSTACK: FEATURE_TOGGLE;
}
