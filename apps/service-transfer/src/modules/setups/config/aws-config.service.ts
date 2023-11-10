import { numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Injectable()
export class AwsConfigService {
  constructor(private configService: ConfigService<AwsEnvironmentVariables>) {}

  get region() {
    return this.configService.get('AWS_REGION', { infer: true })!;
  }

  get stgFileBucketName() {
    return this.configService.get('AWS_S3_BUCKET_FILE_STG', { infer: true })!;
  }

  get stgCleanFileBucketName() {
    return this.configService.get('AWS_S3_BUCKET_FILE_STG_CLEAN', { infer: true })!;
  }

  get mainFileBucketName() {
    return this.configService.get('AWS_S3_BUCKET_FILE_MAIN', { infer: true })!;
  }

  get coreEventsQueueUrl() {
    return this.configService.get('AWS_SQS_CORE_EVENTS', { infer: true })!;
  }

  get transferEventsQueueUrl() {
    return this.configService.get('AWS_SQS_TRANSFER_EVENTS', { infer: true })!;
  }

  get uploadMoveRoleArn() {
    return this.configService.get('AWS_IAM_UPLOAD_MOVE_ROLE_ARN', { infer: true })!;
  }

  get transferMoveRoleArn() {
    return this.configService.get('AWS_IAM_TRANSFER_MOVE_ROLE_ARN', { infer: true })!;
  }

  get uploadRoleArn() {
    return this.configService.get('AWS_IAM_UPLOAD_ROLE_ARN', { infer: true })!;
  }

  get retrieveRoleArn() {
    return this.configService.get('AWS_IAM_RETRIEVE_ROLE_ARN', { infer: true })!;
  }

  get deleteRoleArn() {
    return this.configService.get('AWS_IAM_DELETE_ROLE_ARN', { infer: true })!;
  }

  get assumeRoleSessionDuration() {
    return this.configService.get('AWS_STS_ASSUME_ROLE_SESSION_DURATION', { infer: true })!;
  }

  get staticFileBucketURL() {
    return this.configService.get('AWS_S3_BUCKET_STATIC_FILES', { infer: true })!;
  }

  get agencyOASchemaFolderName() {
    return this.configService.get('AGENCY_OA_SCHEMA_FOLDER_NAME', { infer: true })!;
  }

  get maxMessageReceiveCount() {
    return this.configService.get('MAX_MESSAGE_RECEIVE_COUNT', { infer: true })!;
  }

  get docEncryptionLambdaFunctionName() {
    return this.configService.get('AWS_LAMDBA_DOC_ENCRYPTION_FUNCTION_NAME', { infer: true })!;
  }

  get lambdaTimeoutInMs() {
    return this.configService.get('AWS_LAMBDA_TIMEOUT_IN_MS', { infer: true })!;
  }
}

export class AwsEnvironmentVariables {
  @Expose()
  @IsString()
  AWS_REGION: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_FILE_STG: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_FILE_STG_CLEAN: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_FILE_MAIN: string;

  @Expose()
  @IsString()
  AWS_SQS_CORE_EVENTS: string;

  @Expose()
  @IsString()
  AWS_SQS_TRANSFER_EVENTS: string;

  @Expose()
  @IsString()
  AWS_IAM_UPLOAD_MOVE_ROLE_ARN: string;

  @Expose()
  @IsString()
  AWS_IAM_TRANSFER_MOVE_ROLE_ARN: string;

  @Expose()
  @IsString()
  AWS_IAM_UPLOAD_ROLE_ARN: string;

  @Expose()
  @IsString()
  AWS_IAM_RETRIEVE_ROLE_ARN: string;

  @Expose()
  @IsString()
  AWS_IAM_DELETE_ROLE_ARN: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  AWS_STS_ASSUME_ROLE_SESSION_DURATION: number;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_STATIC_FILES: string;

  @Expose()
  @IsString()
  AGENCY_OA_SCHEMA_FOLDER_NAME: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  MAX_MESSAGE_RECEIVE_COUNT: number;

  @Expose()
  @IsString()
  AWS_LAMDBA_DOC_ENCRYPTION_FUNCTION_NAME: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  AWS_LAMBDA_TIMEOUT_IN_MS: number;
}
