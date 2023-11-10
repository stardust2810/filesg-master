import { numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService<RedisEnvironmentVariables>) {}

  get host() {
    return this.configService.get('REDIS_HOST', { infer: true })!;
  }
  get port() {
    return this.configService.get('REDIS_PORT', { infer: true })!;
  }
  get name() {
    return this.configService.get('REDIS_NAME', { infer: true })!;
  }
  get storeSecret() {
    return this.configService.get('REDIS_STORE_SCT', { infer: true })!;
  }
  get username() {
    return this.configService.get('REDIS_USERNAME', { infer: true })!;
  }
  get password() {
    return this.configService.get('REDIS_PASSWORD', { infer: true })!;
  }
  get fileUploadTtlInSeconds() {
    return this.configService.get('REDIS_FILE_UPLOAD_AUTH_TTL_IN_SECONDS', { infer: true });
  }
  get insertValidationTtlInSeconds() {
    return this.configService.get('REDIS_INSERT_VALIDATION_IN_SECONDS', { infer: true });
  }
}

export class RedisEnvironmentVariables {
  @Expose()
  @IsString()
  REDIS_HOST: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  REDIS_PORT: number;

  @Expose()
  @IsString()
  REDIS_NAME: string;

  @Expose()
  @IsString()
  REDIS_STORE_SCT: string;

  @Expose()
  @IsString()
  REDIS_USERNAME: string;

  @Expose()
  @IsString()
  REDIS_PASSWORD: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  REDIS_FILE_UPLOAD_AUTH_TTL_IN_SECONDS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  REDIS_INSERT_VALIDATION_IN_SECONDS: number;
}
