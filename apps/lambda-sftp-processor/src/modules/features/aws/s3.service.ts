import { S3Client } from '@aws-sdk/client-s3';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { S3Service as BaseS3Service, S3UploadFileInput } from '@filesg/aws';
import { COMPONENT_ERROR_CODE, FEATURE_TOGGLE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

import { FileDownloadErrorException, UploadWorkingFileToS3Exception } from '../../../common/custom-exceptions';
import { FileSGConfigService } from '../..//setups/config/config.service';
import { StsService } from './sts.service';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  constructor(
    private readonly stsService: StsService,
    private readonly baseS3Service: BaseS3Service,
    private fileSGConfigService: FileSGConfigService,
  ) {}
  // ===========================================================================
  // Create Client
  // ===========================================================================
  async createAssumedClient(credentials: AwsCredentialIdentity): Promise<S3Client> {
    const useLocalstack = this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;
    const region = this.fileSGConfigService.awsConfig.region;

    return this.baseS3Service.createAssumedClient(credentials, region, useLocalstack);
  }

  async downloadFileFromSftpBucketToDisk(srcKey: string, destPath: string): Promise<void> {
    const credentials = await this.stsService.assumeSftpProcessorRole();
    const assumedS3Client = await this.createAssumedClient(credentials);

    const { Body } = await this.baseS3Service.downloadFileFromS3(
      { key: srcKey, bucketName: this.fileSGConfigService.awsConfig.s3SftpBucket },
      assumedS3Client,
    );

    if (!Body) {
      throw new FileDownloadErrorException(COMPONENT_ERROR_CODE.S3_SERVICE, `Source file: ${srcKey} is missing in bucket`);
    }

    await pipeline(Body as Readable, createWriteStream(destPath));
  }

  async deleteFileFromSftpBucket(srcKey: string): Promise<void> {
    const credentials = await this.stsService.assumeSftpProcessorRole();
    const assumedS3Client = await this.createAssumedClient(credentials);

    await this.baseS3Service.deleteFileFromS3(
      {
        key: srcKey,
        bucketName: this.fileSGConfigService.awsConfig.s3SftpBucket,
      },
      assumedS3Client,
    );
  }

  async deleteFilesByPrefixFromSftpBucket(prefix: string): Promise<void> {
    const credentials = await this.stsService.assumeSftpProcessorRole();
    const assumedS3Client = await this.createAssumedClient(credentials);

    await this.baseS3Service.deleteFilesByPrefixFromS3(
      {
        prefix,
        bucketName: this.fileSGConfigService.awsConfig.s3SftpBucket,
      },
      assumedS3Client,
    );
  }

  async uploadFilesToSftpBucket(uploadFileInputs: S3UploadFileInput[]): Promise<void> {
    const credentials = await this.stsService.assumeSftpProcessorRole();
    const assumedS3Client = await this.createAssumedClient(credentials);

    const uploadRes = await Promise.allSettled(
      uploadFileInputs.map((uploadFileInput) =>
        this.baseS3Service.uploadFileToS3(uploadFileInput, this.fileSGConfigService.awsConfig.s3SftpBucket, assumedS3Client),
      ),
    );

    const uploadFileFailedResult = uploadRes.reduce((acc, result, index) => {
      if (result.status === 'rejected') {
        acc.push({
          key: uploadFileInputs[index].Key,
          msg: result.reason.message,
        });
      }

      return acc;
    }, [] as ConstructorParameters<typeof UploadWorkingFileToS3Exception>[1]);

    if (uploadFileFailedResult.length > 0) {
      throw new UploadWorkingFileToS3Exception(COMPONENT_ERROR_CODE.SFTP_S3_SERVICE, uploadFileFailedResult);
    }
  }
}
