import { S3Client } from '@aws-sdk/client-s3';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { S3CopyFileInput, S3Service as BaseS3Service } from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../..//setups/config/config.service';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  constructor(private readonly baseS3Service: BaseS3Service, private fileSGConfigService: FileSGConfigService) {}
  // ===========================================================================
  // Create Client
  // ===========================================================================
  async createAssumedClient(credentials: AwsCredentialIdentity) {
    const useLocalstack = this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;
    const region = this.fileSGConfigService.awsConfig.region;

    return this.baseS3Service.createAssumedClient(credentials, region, useLocalstack);
  }

  // ===========================================================================
  // Delete
  // ===========================================================================
  async deleteFileFromStgBucket(key: string, s3Client?: S3Client) {
    return await this.baseS3Service.deleteFileFromS3({ key, bucketName: this.fileSGConfigService.awsConfig.s3StgBucket }, s3Client);
  }

  // ===========================================================================
  // Move
  // ===========================================================================
  async moveFileFromStgToStgClean(fileAssetUuid: string, tags?: string, s3Client?: S3Client) {
    const stgBucket = this.fileSGConfigService.awsConfig.s3StgBucket;
    const stgCleanBucket = this.fileSGConfigService.awsConfig.s3StgCleanBucket;

    const copyFileInput: S3CopyFileInput = {
      fileDetail: {
        fromKey: fileAssetUuid,
        toKey: fileAssetUuid,
      },
      fromBucket: stgBucket,
      toBucket: stgCleanBucket,
      tags,
    };
    await this.baseS3Service.moveFileBetweenS3(copyFileInput, s3Client);
  }
}
