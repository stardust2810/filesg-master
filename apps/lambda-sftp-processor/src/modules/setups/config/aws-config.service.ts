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

  get sqsSftpProcessor() {
    return this.configService.get('AWS_SQS_SFTP_PROCESSOR', { infer: true })!;
  }

  get s3SftpBucket() {
    return this.configService.get('AWS_S3_BUCKET_SFTP', { infer: true })!;
  }

  get sftpRoleArn() {
    return this.configService.get('AWS_IAM_SFTP_ROLE_ARN', { infer: true })!;
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
  AWS_SQS_SFTP_PROCESSOR: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_SFTP: string;

  @Expose()
  @IsString()
  AWS_IAM_SFTP_ROLE_ARN: string;

  @Expose()
  @IsNumber()
  AWS_STS_ASSUME_ROLE_SESSION_DURATION: number;
}
