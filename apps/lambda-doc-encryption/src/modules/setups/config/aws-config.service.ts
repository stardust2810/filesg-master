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

  get uploadMoveRoleArn() {
    return this.configService.get('AWS_IAM_UPLOAD_MOVE_ROLE_ARN', { infer: true })!;
  }

  get assumeRoleSessionDuration() {
    return this.configService.get('AWS_STS_ASSUME_ROLE_SESSION_DURATION', { infer: true })!;
  }

  get mainBucketName() {
    return this.configService.get('AWS_S3_BUCKET_MAIN', { infer: true })!;
  }

  get stgCleanBucketName() {
    return this.configService.get('AWS_S3_BUCKET_STG_CLEAN', { infer: true })!;
  }
}

export class AWSEnvironmentVariables {
  @Expose()
  @IsString()
  AWS_REGION: string;

  @Expose()
  @IsString()
  AWS_IAM_UPLOAD_MOVE_ROLE_ARN: string;

  @Expose()
  @IsNumber()
  AWS_STS_ASSUME_ROLE_SESSION_DURATION: number;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_MAIN: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_STG_CLEAN: string;
}
