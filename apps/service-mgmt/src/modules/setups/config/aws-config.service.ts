import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class AwsConfigService {
  constructor(private configService: ConfigService<AwsEnvironmentVariables>) {}

  get stgFileBucketName() {
    return this.configService.get('AWS_S3_BUCKET_FILE_STG', { infer: true })!;
  }

  get stgCleanFileBucketName() {
    return this.configService.get('AWS_S3_BUCKET_FILE_STG_CLEAN', { infer: true })!;
  }

  get mainFileBucketName() {
    return this.configService.get('AWS_S3_BUCKET_FILE_MAIN', { infer: true })!;
  }
}

export class AwsEnvironmentVariables {
  @Expose()
  @IsString()
  AWS_S3_BUCKET_FILE_STG: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_FILE_STG_CLEAN: string;

  @Expose()
  @IsString()
  AWS_S3_BUCKET_FILE_MAIN: string;
}
