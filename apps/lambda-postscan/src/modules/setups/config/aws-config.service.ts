import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Injectable()
export class AWSConfigService {
  constructor(private configService: ConfigService<AWSEnvironmentVariables>) {}

  get region() {
    return this.configService.get('AWS_REGION', { infer: true })!;
  }

  get sqsCoreEvents() {
    return this.configService.get('AWS_SQS_CORE_EVENTS', { infer: true })!;
  }

  get s3StgBucket() {
    return this.configService.get('AWS_S3_BUCKET_STG', { infer: true })!;
  }

  get s3StgCleanBucket() {
    return this.configService.get('AWS_S3_BUCKET_STG_CLEAN', { infer: true })!;
  }

  get scanMoveRoleArn() {
    return this.configService.get('AWS_IAM_SCAN_MOVE_ROLE_ARN', { infer: true })!;
  }

  get assumeRoleSessionDuration() {
    return this.configService.get('AWS_STS_ASSUME_ROLE_SESSION_DURATION', { infer: true })!;
  }
}

export class AWSEnvironmentVariables {
  @Expose()
  @IsString()
  AWS_REGION: string;

  @Expose()
  @IsString()
  AWS_SQS_CORE_EVENTS: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_STG: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_STG_CLEAN: string;

  @Expose()
  @IsString()
  AWS_IAM_SCAN_MOVE_ROLE_ARN: string;

  @Expose()
  @IsNumber()
  AWS_STS_ASSUME_ROLE_SESSION_DURATION: number;
}
