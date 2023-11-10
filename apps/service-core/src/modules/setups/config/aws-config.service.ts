import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class AWSConfigService {
  constructor(private configService: ConfigService<AWSEnvironmentVariables>) {}

  get region() {
    return this.configService.get('AWS_REGION', { infer: true })!;
  }

  get coreEventsQueueUrl() {
    return this.configService.get('AWS_SQS_CORE_EVENTS', { infer: true })!;
  }

  get transferEventsQueueUrl() {
    return this.configService.get('AWS_SQS_TRANSFER_EVENTS', { infer: true })!;
  }

  get staticConfigBucketName() {
    return this.configService.get('AWS_S3_STATIC_FILES_BUCKET', { infer: true })!;
  }

  get sesEventQueueUrl() {
    return this.configService.get('AWS_SES_EVENT_QUEUE', { infer: true })!;
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
  AWS_SQS_TRANSFER_EVENTS: string;

  @Expose()
  @IsString()
  AWS_S3_STATIC_FILES_BUCKET: string;

  @Expose()
  @IsString()
  AWS_SES_EVENT_QUEUE: string;
}
