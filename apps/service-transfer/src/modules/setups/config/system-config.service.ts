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

  get protocol() {
    return this.configService.get('PROTOCOL', { infer: true })!;
  }

  get port() {
    return this.configService.get('PORT', { infer: true })!;
  }

  get requestTimeoutMs() {
    return this.configService.get('REQUEST_TIMEOUT_MS', { infer: true })!;
  }

  get logLevel() {
    return this.configService.get('LOG_LEVEL', { infer: true })!;
  }

  get mgmtServiceUrl() {
    return this.configService.get('MANAGEMENT_SERVICE_URL', { infer: true })!;
  }

  get mgmtServiceName() {
    return this.configService.get('MANAGEMENT_SERVICE_NAME', { infer: true })!;
  }

  get pollingSleepTimeInSeconds() {
    return this.configService.get('POLLING_SLEEP_TIME_IN_SECONDS', { infer: true })!;
  }

  get uploadFileSizeLimitInMBytes() {
    return this.configService.get('UPLOAD_FILE_SIZE_LIMIT_IN_MB', { infer: true })!;
  }

  get useLocalstack() {
    return this.configService.get('USE_LOCALSTACK', { infer: true })!;
  }

  // Custom getters
  get mgmtServiceFullUrl() {
    return `${this.protocol}://${this.mgmtServiceUrl}/api/${this.mgmtServiceName}`;
  }

  get docEncryptionLambdaFullUrl() {
    return `${this.protocol}://localhost:3004`;
  }

  //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #START#
  get toggleUploadMoveFailure() {
    return this.configService.get('TOGGLE_UPLOAD_MOVE_FAILURE', { infer: true })!;
  }

  get toggleTransferMoveFailure() {
    return this.configService.get('TOGGLE_TRANSFER_MOVE_FAILURE', { infer: true })!;
  }
  //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #END#
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

  @Expose()
  @IsString()
  PROTOCOL: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  PORT: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  REQUEST_TIMEOUT_MS: number;

  @Expose()
  @IsEnum(LOG_LEVEL)
  LOG_LEVEL: LOG_LEVEL;

  @Expose()
  @IsString()
  MANAGEMENT_SERVICE_URL: string;

  @Expose()
  @IsString()
  MANAGEMENT_SERVICE_NAME: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  POLLING_SLEEP_TIME_IN_SECONDS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  UPLOAD_FILE_SIZE_LIMIT_IN_MB: number;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  USE_LOCALSTACK: FEATURE_TOGGLE;

  //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #START#
  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_UPLOAD_MOVE_FAILURE: FEATURE_TOGGLE;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_TRANSFER_MOVE_FAILURE: FEATURE_TOGGLE;
  //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #END#
}
