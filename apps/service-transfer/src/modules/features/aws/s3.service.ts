import { DeleteObjectCommandOutput, DeleteObjectsCommandOutput, GetObjectCommandOutput, S3Client } from '@aws-sdk/client-s3';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import {
  AWSException,
  BaseS3Object,
  ExtendedCopyObjectCommandOutput,
  LambdaService,
  MoveFilesFailureException,
  S3CopyFilesPromiseResultMap,
  S3GetFileMetadataOutput,
  S3HeadObjectInput,
  S3Service as BaseS3Service,
  S3UploadFileInput,
  UploadObjectCommandOutput,
} from '@filesg/aws';
import {
  DocumentEncryptionErrorOutput,
  DocumentEncryptionInput,
  DocumentEncryptionOutput,
  DocumentEncryptionSuccessOutput,
  FileSGBaseException,
  isImplementRetryableException,
  RetryableException,
} from '@filesg/backend-common';
import { AssumeUploadMoveRole, CI_ENVIRONMENT, COMPONENT_ERROR_CODE, FEATURE_TOGGLE, TransferFile } from '@filesg/common';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import generator from 'generate-password';

import { DeleteCopiedFilesErrorException } from '../../../common/custom-exceptions';
import { DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER } from '../../../typings/common';
import { docEncryptionPasswordEncryptionTransformer } from '../../../utils/encryption';
import { FileSGConfigService } from '../../setups/config/config.service';

export interface EncryptedFileAssetUuidToNewSizeMap {
  [uuid: string]: number;
}

export interface CopyTransferFilesEncrypted {
  encryptedPassword: string;
  fileAssetUuidToNewSizeMap: EncryptedFileAssetUuidToNewSizeMap;
}

const isDocumentEncryptionSuccessOutput = (
  result: DocumentEncryptionSuccessOutput | DocumentEncryptionErrorOutput | ExtendedCopyObjectCommandOutput,
): result is DocumentEncryptionSuccessOutput => {
  return !!(result as DocumentEncryptionSuccessOutput).size;
};

export class DocEncryptionLambdaException extends FileSGBaseException implements RetryableException {
  constructor(message: string, componentErrorCode: COMPONENT_ERROR_CODE, private readonly isHeadObjectError: boolean) {
    super(`[DocEncryptionLambdaException]: ${message}`, componentErrorCode);
  }
  get isRetryable(): boolean {
    // if the error message match any `nonRetryableErrorTags` then the error should non retryable
    const nonRetryableErrorTags = [
      'UnsupportedFileTypeException',
      'MissingFileException',
      'UnsupportedFileTypeForEncryptionException',
      'PdfEncryptionException',
      'ExcelEncryptionException',
    ];
    return !nonRetryableErrorTags.some((x) => this.message.indexOf(x) !== -1);
  }
}

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  constructor(
    private readonly baseS3Service: BaseS3Service,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly lambdaService: LambdaService,
    @Inject(DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER) private readonly docEncryptionLambdaApiClient: AxiosInstance,
  ) {}

  // ===========================================================================
  // Create Client
  // ===========================================================================
  async createAssumedClient(credentials: AwsCredentialIdentity): Promise<S3Client> {
    const useLocalstack = this.fileSGConfigService.systemConfig.useLocalstack === FEATURE_TOGGLE.ON;
    const region = this.fileSGConfigService.awsConfig.region;

    return this.baseS3Service.createAssumedClient(credentials, region, useLocalstack);
  }

  // ===========================================================================
  // Upload
  // ===========================================================================
  async uploadFileToStgBucket(s3UploadObject: S3UploadFileInput, s3Client?: S3Client): Promise<UploadObjectCommandOutput> {
    return await this.baseS3Service.uploadFileToS3(s3UploadObject, this.fileSGConfigService.awsConfig.stgFileBucketName, s3Client);
  }

  // ===========================================================================
  // Delete
  // ===========================================================================
  async deleteFilesFromStgBucket(keys: string[], s3Client?: S3Client): Promise<DeleteObjectsCommandOutput> {
    return await this.baseS3Service.deleteFilesFromS3({ keys, bucketName: this.fileSGConfigService.awsConfig.stgFileBucketName }, s3Client);
  }

  async deleteFilesFromStgCleanBucket(keys: string[], s3Client?: S3Client): Promise<DeleteObjectsCommandOutput> {
    return await this.baseS3Service.deleteFilesFromS3(
      { keys, bucketName: this.fileSGConfigService.awsConfig.stgCleanFileBucketName },
      s3Client,
    );
  }

  async deleteFilesAllVersionsFromMainBucket(keys: string[], s3Client?: S3Client): Promise<DeleteObjectCommandOutput> {
    const { mainFileBucketName } = this.fileSGConfigService.awsConfig;

    return await this.baseS3Service.deleteFilesAllVersions({ keys, bucketName: mainFileBucketName }, s3Client);
  }

  // ===========================================================================
  // Download
  // ===========================================================================
  async downloadFileFromMainBucket(key: string, fileName?: string, s3Client?: S3Client): Promise<GetObjectCommandOutput> {
    return await this.baseS3Service.downloadFileFromS3(
      { key, bucketName: this.fileSGConfigService.awsConfig.mainFileBucketName, fileName },
      s3Client,
    );
  }

  async downloadFileFromStaticFileBucket(key: string, s3Client?: S3Client): Promise<GetObjectCommandOutput> {
    return await this.baseS3Service.downloadFileFromS3(
      { key, bucketName: this.fileSGConfigService.awsConfig.staticFileBucketURL },
      s3Client,
    );
  }

  // ===========================================================================
  // Copy
  // ===========================================================================
  async copyTransferFiles(
    transferFiles: TransferFile[],
    fromBucket: string,
    toBucket: string,
    s3Client?: S3Client,
    assumeUploadMoveRole?: AssumeUploadMoveRole,
  ): Promise<CopyTransferFilesEncrypted | undefined> {
    const requiredPasswordEncryption = !!transferFiles.find((transferFile) => transferFile.isPasswordEncryptionRequired);

    const password = requiredPasswordEncryption
      ? generator.generate({
          length: 12,
          symbols: true,
          numbers: true,
          uppercase: true,
          lowercase: true,
          exclude: `<>&/"'`,
          excludeSimilarCharacters: true,
          strict: true,
        })
      : '';

    const fileAssetUuidToNewSizeMap: EncryptedFileAssetUuidToNewSizeMap = {};

    const copyFilesPromises: (Promise<DocumentEncryptionSuccessOutput> | Promise<ExtendedCopyObjectCommandOutput>)[] = transferFiles.map(
      ({ from: { key: fromKey }, to: { key: toKey }, isPasswordEncryptionRequired, encryptedAgencyPassword, name }) =>
        isPasswordEncryptionRequired && name && assumeUploadMoveRole
          ? this.zipEncryptAndCopyFileFromStgCleanToMain({
              fromKey,
              toKey,
              assumeRole: assumeUploadMoveRole,
              password,
              agencyPassword:
                encryptedAgencyPassword && JSON.parse(docEncryptionPasswordEncryptionTransformer.from(encryptedAgencyPassword) as string),
              fileName: name,
            })
          : this.baseS3Service.copyFileBetweenS3({ fileDetail: { fromKey, toKey }, toBucket, fromBucket }, s3Client),
    );

    const promisesResults = await Promise.allSettled(copyFilesPromises);

    const promiseResultsMap: S3CopyFilesPromiseResultMap = {
      fulfilled: [],
      rejected: [],
    };

    const additionalObjectKeysToBeDeleted: string[] = [];

    promisesResults.forEach((result, index) => {
      const transferFile = transferFiles[index];

      if (result.status === 'fulfilled') {
        const { fromKey, toKey } = result.value;
        promiseResultsMap.fulfilled.push({ fromKey, toKey });

        if (isDocumentEncryptionSuccessOutput(result.value)) {
          const { fileAssetUuid } = transferFile.to;
          fileAssetUuidToNewSizeMap[fileAssetUuid] = result.value.size;
        }

        return;
      }

      const { message, isHeadObjectError } = result.reason;
      const {
        from: { key: fromKey },
        to: { key: toKey },
      } = transferFile;

      // Whenever there is a head object error from the doc encryption lambda invocation, always delete the uploaded file because
      // the zip encrypted file is already uploaded to the main bucket but failed to get file size due to failure of headObject operation
      if (isHeadObjectError) {
        additionalObjectKeysToBeDeleted.push(transferFile.to.key);
      }

      const isRetryable = isImplementRetryableException(result.reason) ? result.reason.isRetryable : true;

      this.logger.log(`File asset failed to copy from ${fromKey} (${fromBucket}) to ${toKey} (${toBucket}): ${message}`);
      promiseResultsMap.rejected.push({ reason: message, fromKey, toKey, isRetryable });
    });

    // if any copy file promise is rejected, delete all the copied object in destination bucket
    const rejectedErrors = promiseResultsMap.rejected;

    if (rejectedErrors.length > 0) {
      const copiedObjectKeys = promiseResultsMap.fulfilled.map((item) => item.toKey).concat(additionalObjectKeysToBeDeleted);

      // delete those files that were copied successfully
      if (copiedObjectKeys.length > 0) {
        try {
          await this.baseS3Service.deleteFilesAllVersions({ keys: copiedObjectKeys, bucketName: toBucket }, s3Client);
        } catch (error) {
          const { message, errorData } = error as AWSException;
          throw new DeleteCopiedFilesErrorException(COMPONENT_ERROR_CODE.S3_SERVICE, `${message}: ${JSON.stringify(errorData)}`, toBucket);
        }
      }

      // gd TODO: relook into the error code service
      throw new MoveFilesFailureException(COMPONENT_ERROR_CODE.S3_SERVICE, rejectedErrors);
    }

    if (requiredPasswordEncryption) {
      const encryptedPassword = docEncryptionPasswordEncryptionTransformer.to(password) as string;
      return { encryptedPassword, fileAssetUuidToNewSizeMap };
    }
  }

  async zipEncryptAndCopyFileFromStgCleanToMain(input: DocumentEncryptionInput): Promise<DocumentEncryptionSuccessOutput> {
    let payload: DocumentEncryptionOutput;

    if (this.fileSGConfigService.systemConfig.env !== CI_ENVIRONMENT.LOCAL) {
      const response = await this.lambdaService.invokeLambda({
        functionName: this.fileSGConfigService.awsConfig.docEncryptionLambdaFunctionName,
        payload: input,
      });

      /**
       * The reason for the response type not being string but Uint8Array because Lambda functions are user controlled and may return a response
       * that should not be converted into a string. V3 aims to both support other response types and more closely follow the AWS service's definitions
       * for input and output types.
       * Reference: https://github.com/aws/aws-sdk-js-v3/issues/2252
       */
      payload = JSON.parse(Buffer.from(response.Payload!).toString());
    } else {
      const response = await this.docEncryptionLambdaApiClient.post<DocumentEncryptionOutput>('doc-encryption', input);
      payload = response.data;
    }

    if (!isDocumentEncryptionSuccessOutput(payload)) {
      throw new DocEncryptionLambdaException(payload.errorMessage, COMPONENT_ERROR_CODE.S3_SERVICE, !!payload.isHeadObjectError);
    }

    return payload as DocumentEncryptionSuccessOutput;
  }

  async copyFileToStgBucket(
    srcBucket: string,
    srcKey: string,
    destKey: string,
    s3Client?: S3Client,
  ): Promise<ExtendedCopyObjectCommandOutput> {
    return await this.baseS3Service.copyFileBetweenS3(
      {
        fromBucket: srcBucket,
        toBucket: this.fileSGConfigService.awsConfig.stgFileBucketName,
        fileDetail: { fromKey: srcKey, toKey: destKey },
      },
      s3Client,
    );
  }

  // ===========================================================================
  // Get Metadata
  // ===========================================================================
  async checkForMissingFilesInS3(input: S3HeadObjectInput[], s3Client?: S3Client): Promise<BaseS3Object[]> {
    const headObjectResults = await Promise.allSettled(
      input.map(async ({ bucketName, key, getChecksum }) => {
        await this.baseS3Service.headObjectFromS3(
          {
            bucketName,
            key,
            getChecksum,
          },
          s3Client,
        );
      }),
    );

    const missingFiles: Array<BaseS3Object> = [];
    headObjectResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        missingFiles.push({
          bucketName: input[index].bucketName,
          key: input[index].key,
        });
      }
    });

    return missingFiles;
  }

  async getFileMetadata(bucketName: string, key: string, s3Client?: S3Client): Promise<S3GetFileMetadataOutput> {
    return await this.baseS3Service.getFileMetadata(
      {
        bucketName,
        key,
      },
      s3Client,
    );
  }
}
