import { CompleteMultipartUploadCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { S3Service as BaseS3Service, S3UploadUnknownLengthStreamInput } from '@filesg/aws';
import { COMPONENT_ERROR_CODE, FEATURE_TOGGLE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';

import { FileDownloadException, GetFileSizeException } from '../../../common/custom-exceptions';
import { FileSGConfigService } from '../../setups/config/config.service';
import { StsService } from './sts.service';

export interface UploadZipOutput {
  Key: string;
  Bucket: string;
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  constructor(
    private readonly stsService: StsService,
    private readonly baseS3Service: BaseS3Service,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  async createAssumedClient(credentials: AwsCredentialIdentity): Promise<S3Client> {
    const useLocalstack = this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;

    const { region } = this.fileSGConfigService.awsConfig;

    return this.baseS3Service.createAssumedClient(credentials, region, useLocalstack);
  }

  async downloadFileFromStgCleanBucket(
    srcKey: string,
    assumedS3Client: S3Client,
  ): Promise<{ Body: Readable | ReadableStream | Blob; ContentType: string }> {
    const { Body, ContentType } = await this.baseS3Service.downloadFileFromS3(
      { key: srcKey, bucketName: this.fileSGConfigService.awsConfig.stgCleanBucketName },
      assumedS3Client,
    );

    if (!Body || !ContentType) {
      throw new FileDownloadException('File data or content type missing.', COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, srcKey);
    }

    return { Body, ContentType };
  }

  async uploadZipToMainBucket(s3UploadObject: S3UploadUnknownLengthStreamInput, assumedS3Client: S3Client): Promise<UploadZipOutput> {
    const { mainBucketName } = this.fileSGConfigService.awsConfig;

    const result = await this.baseS3Service.multipartUploadFileToS3(s3UploadObject, mainBucketName, assumedS3Client);

    const { Key: resultKey, Bucket: resultBucket } = result as CompleteMultipartUploadCommandOutput;
    return { Key: resultKey!, Bucket: resultBucket! };
  }

  async getFileSizeFromMainBucket(key: string, assumedS3Client: S3Client): Promise<number> {
    try {
      const result = await this.baseS3Service.headObjectFromS3(
        {
          bucketName: this.fileSGConfigService.awsConfig.mainBucketName,
          key,
          getChecksum: false,
        },
        assumedS3Client,
      );

      const fileSize = result.ContentLength;

      if (!fileSize) {
        throw new Error('Unknown file size.');
      }
      return fileSize;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new GetFileSizeException(errorMessage, COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE, key);
    }
  }
}
