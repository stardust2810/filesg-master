import {
  AbortMultipartUploadCommandOutput,
  ChecksumMode,
  CompleteMultipartUploadCommandOutput,
  CopyObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandInput,
  DeleteObjectsOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommand,
  HeadObjectCommandInput,
  HeadObjectCommandOutput,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  ListObjectVersionsCommand,
  ObjectIdentifier,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Configuration, Upload } from '@aws-sdk/lib-storage';
import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { AwsCredentialIdentity } from '@aws-sdk/types';
import { NODE_HTTPS_HANDLER_PROVIDER } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, convertBinaryRepresentation } from '@filesg/common';
import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { fromStream } from 'file-type';
import { Readable } from 'stream';

import { AWSException, AWSHttpException, AWSS3UploadException, MoveFilesFailureException } from '../../common/filters/custom-exceptions';
import { LOG_OPERATION_NAME_PREFIX } from '../../const';
import {
  ExtendedCopyObjectCommandOutput,
  S3_CLIENT,
  S3CopyFileInput,
  S3CopyFilesInput,
  S3CopyFilesPromiseResultMap,
  S3DeleteFileInput,
  S3DeleteFilesInput,
  S3DownloadFileInput,
  S3GetFileMetadataInput,
  S3GetFileMetadataOutput,
  S3HeadObjectInput,
  S3ListFilesInput,
  S3UploadFileInput,
  S3UploadUnknownLengthStreamInput,
  UploadObjectCommandOutput,
} from '../../typings/s3.typing';
import { generateS3ClientConfigOptions } from '../../utils/helpers';

@Injectable()
export class S3Service {
  private readonly logger = new Logger(S3Service.name);

  constructor(
    @Inject(S3_CLIENT) private readonly s3: S3Client,
    @Optional() @Inject(NODE_HTTPS_HANDLER_PROVIDER) private readonly nodeHttpsHandler?: NodeHttpHandler,
  ) {}

  // ===========================================================================
  // Create Client
  // ===========================================================================
  async createAssumedClient(credentials: AwsCredentialIdentity, region: string, isLocalStackOn = false): Promise<S3Client> {
    this.logger.log(`${LOG_OPERATION_NAME_PREFIX.S3} Creating assumed client`);
    return new S3Client(generateS3ClientConfigOptions({ credentials, region, requestHandler: this.nodeHttpsHandler }, isLocalStackOn));
  }

  // ===========================================================================
  // List versions
  // ===========================================================================
  /**
   * List versions of object
   *
   * Can only be used on buckets with versioning enabled,
   * else output will be missing the Versions field, resulting in error
   */
  async listObjectVersions(key: string, bucketName: string, s3Client?: S3Client): Promise<ObjectIdentifier[]> {
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Listing version of object with key ${key} in bucket: ${bucketName}`;
    this.logger.log(taskMessage);
    this.logger.verbose(`Key: ${key}`);

    try {
      const listObjectVersionsCommand = new ListObjectVersionsCommand({
        Bucket: bucketName,
        Prefix: key,
      });

      const client = this.providedS3Client(s3Client);

      const { Versions } = await client.send(listObjectVersionsCommand);

      if (!Versions) {
        throw new Error('Missing versioning data');
      }

      this.logger.log(`[Succeed] ${taskMessage}`);

      return Versions.map(({ Key, VersionId }): ObjectIdentifier => {
        return { Key, VersionId };
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage, { operation: 'LIST_OBJECT_VERSIONS', metadata: { key } });
    }
  }

  async listFilesFromS3(listFilesInput: S3ListFilesInput, s3Client?: S3Client): Promise<ListObjectsCommandOutput> {
    const { bucketName, prefix } = listFilesInput;
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Listing files in bucket: ${bucketName} with prefix: ${prefix}`;
    this.logger.log(taskMessage);

    try {
      const listObjectsCommand = new ListObjectsCommand({
        Bucket: bucketName,
        Prefix: prefix,
      });

      const client: S3Client = s3Client ?? this.s3;

      const data = await client.send(listObjectsCommand);

      this.logger.log(`[Succeed] ${taskMessage}`);
      return data;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage);
    }
  }

  // ===========================================================================
  // Upload
  // ===========================================================================
  async uploadFileToS3(uploadFileInput: S3UploadFileInput, bucketName: string, s3Client?: S3Client): Promise<UploadObjectCommandOutput> {
    const { Key, Body, ContentType, ChecksumSHA256 } = uploadFileInput;
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Uploading file ${uploadFileInput.Key} to bucket: ${bucketName}`;
    this.logger.log(taskMessage);

    try {
      const putObjectCommand = new PutObjectCommand({
        Key,
        Body,
        ContentType,
        Bucket: bucketName,
        ...(ChecksumSHA256 && { ChecksumSHA256 }),
      });

      const client = this.providedS3Client(s3Client);

      const data = await client.send(putObjectCommand);
      this.logger.log(`[Succeed] ${taskMessage}`, data);
      return {
        ...data,
        key: Key,
      };
    } catch (error) {
      // TODO: remove once tested the error for invalid checksum
      this.logger.error(error);
      const errorMessage = (error as Error).message;
      throw new AWSS3UploadException(COMPONENT_ERROR_CODE.S3_SERVICE, { fileName: Key, bucketName, awsErrorResponse: errorMessage });
    }
  }

  /**
   * Upload allows for easy and efficient uploading of buffers, blobs, or streams,
   * using a configurable amount of concurrency to perform multipart uploads where possible.
   * This abstraction enables uploading large files or streams of unknown size due to
   * the use of multipart uploads under the hood.
   */
  async multipartUploadFileToS3(
    uploadFileInput: S3UploadUnknownLengthStreamInput,
    bucketName: string,
    s3Client?: S3Client,
    configuration?: Configuration,
  ): Promise<CompleteMultipartUploadCommandOutput | AbortMultipartUploadCommandOutput> {
    const { Key, Body, ContentType } = uploadFileInput;
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Multipart uploading file ${uploadFileInput.Key} to bucket: ${bucketName}`;
    this.logger.log(taskMessage);

    try {
      const input: PutObjectCommandInput = {
        Bucket: bucketName,
        Key,
        Body,
        ContentType,
      };

      const client = this.providedS3Client(s3Client);

      const multipartUpload = new Upload({
        client,
        params: input,
        ...configuration,
      });

      const response = await multipartUpload.done();
      this.logger.log(`[Succeed] ${taskMessage}`, multipartUpload);
      return response;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSS3UploadException(COMPONENT_ERROR_CODE.S3_SERVICE, { fileName: Key, bucketName, awsErrorResponse: errorMessage });
    }
  }

  // ===========================================================================
  // Download
  // ===========================================================================
  async downloadFileFromS3(downloadFileInput: S3DownloadFileInput, s3Client?: S3Client): Promise<GetObjectCommandOutput> {
    const { key, bucketName, fileName, range } = downloadFileInput;
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Downloading file ${key} from bucket: ${bucketName}`;
    this.logger.log(taskMessage);

    try {
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename=${fileName}`,
        ...(range && { Range: `bytes=${range.start}-${range.end}` }),
      });

      const client = this.providedS3Client(s3Client);

      const data = await client.send(getObjectCommand);
      this.logger.log(`[Succeed] ${taskMessage}`);

      return data;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage);
    }
  }

  async headObjectFromS3({ bucketName, key, getChecksum }: S3HeadObjectInput, s3Client?: S3Client): Promise<HeadObjectCommandOutput> {
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Head Object`;
    this.logger.log(taskMessage);

    try {
      const headObjectCommandInput: HeadObjectCommandInput = {
        Bucket: bucketName,
        Key: key,
        ...(getChecksum && { ChecksumMode: ChecksumMode.ENABLED }),
      };

      const client = this.providedS3Client(s3Client);

      const result = await client.send(new HeadObjectCommand(headObjectCommandInput));
      this.logger.log(`[Succeed] ${taskMessage}`);

      return result;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage, {
        operation: 'HEAD_OBJECT',
        metadata: {
          bucketName,
          key,
        },
      });
    }
  }

  // ===========================================================================
  // Copy
  // ===========================================================================
  async copyFileBetweenS3(copyFileInput: S3CopyFileInput, s3Client?: S3Client): Promise<ExtendedCopyObjectCommandOutput> {
    const { fileDetail, fromBucket, toBucket, tags } = copyFileInput;
    const { fromKey, toKey } = fileDetail;

    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Copying file ${fromKey} from ${fromBucket} to ${toBucket} as ${toKey}`;
    this.logger.log(taskMessage);

    try {
      const copyObjectCommand = new CopyObjectCommand({
        CopySource: fromBucket + '/' + fromKey,
        Bucket: toBucket,
        Key: toKey,
        TaggingDirective: tags ? 'REPLACE' : 'COPY',
        Tagging: tags,
      });

      const client = this.providedS3Client(s3Client);

      const data = await client.send(copyObjectCommand);
      this.logger.log(`[Succeed] ${taskMessage}`, data);

      return {
        ...data,
        fromKey,
        toKey,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage);
    }
  }

  async copyFilesBetweenS3(copyFilesInput: S3CopyFilesInput, s3Client?: S3Client) {
    const { fileDetails, toBucket, fromBucket } = copyFilesInput;

    const copyFilesPromises = fileDetails.map((fileDetail) => {
      return this.copyFileBetweenS3({ fileDetail, toBucket, fromBucket }, s3Client);
    });

    const promisesResults = await Promise.allSettled(copyFilesPromises);

    const promiseResultsMap: S3CopyFilesPromiseResultMap = {
      fulfilled: [],
      rejected: [],
    };

    promisesResults.forEach((item, index) => {
      if (item.status === 'fulfilled') {
        const { fromKey, toKey } = item.value;
        promiseResultsMap.fulfilled.push({ fromKey, toKey });
        return;
      }

      const { message } = item.reason;
      const { fromKey, toKey } = fileDetails[index];
      promiseResultsMap.rejected.push({ reason: message, fromKey, toKey, isRetryable: true });
    });

    // if any copy file promise is rejected, delete all the copied object in destination bucket
    const rejectedErrors = promiseResultsMap.rejected;

    if (rejectedErrors.length > 0) {
      const copiedObjects = promiseResultsMap.fulfilled;

      // delete those files that were copied successfully
      if (copiedObjects.length > 0) {
        await this.deleteFilesFromS3(
          {
            keys: copiedObjects.map((obj) => obj.toKey),
            bucketName: toBucket,
          },
          s3Client,
        );
      }

      throw new MoveFilesFailureException(COMPONENT_ERROR_CODE.S3_SERVICE, rejectedErrors);
    }
  }

  // =============================================================================
  // Delete
  // =============================================================================
  async deleteFileFromS3(deleteFileInput: S3DeleteFileInput, s3Client?: S3Client): Promise<DeleteObjectCommandOutput> {
    const { key, bucketName } = deleteFileInput;
    return await this.deleteFilesFromS3({ keys: [key], bucketName }, s3Client);
  }

  async deleteFilesFromS3(deleteFilesInput: S3DeleteFilesInput, s3Client?: S3Client): Promise<DeleteObjectCommandOutput> {
    const { keys, bucketName } = deleteFilesInput;
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Deleting file(s): ${keys} from bucket ${bucketName}`;
    this.logger.log(taskMessage);

    const objects: ObjectIdentifier[] = keys.map((key) => {
      return {
        Key: key,
      };
    });

    try {
      const deleteObjectsCommand = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: objects },
      });

      const client = this.providedS3Client(s3Client);

      const data = await client.send(deleteObjectsCommand);

      // handle errors from delete command output (as it wont throw error on its own)
      this.throwDeleteErrors(data);

      this.logger.log(`[Succeed] ${taskMessage}`);
      return data;
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage);
    }
  }

  async deleteFilesByPrefixFromS3(listFilesInput: S3ListFilesInput, s3Client?: S3Client): Promise<DeleteObjectCommandOutput | undefined> {
    const { bucketName } = listFilesInput;
    const { Contents } = await this.listFilesFromS3(listFilesInput, s3Client);

    if (!Contents || Contents.length === 0) {
      return;
    }

    const filesToBeDeleted = Contents.reduce(
      (acc, curr) => {
        acc.keys.push(curr.Key!);
        return acc;
      },
      { bucketName, keys: [] } as S3DeleteFilesInput,
    );

    return await this.deleteFilesFromS3(filesToBeDeleted, s3Client);
  }

  async deleteFileAllVersions(s3DeleteFileInput: S3DeleteFileInput, s3Client?: S3Client): Promise<DeleteObjectCommandOutput> {
    const { key, bucketName } = s3DeleteFileInput;
    return this.deleteFilesAllVersions({ keys: [key], bucketName }, s3Client);
  }

  async deleteFilesAllVersions(
    s3DeleteFilesInput: S3DeleteFilesInput,
    s3Client?: S3Client,
    transactionUuid?: string,
  ): Promise<DeleteObjectCommandOutput> {
    const { keys, bucketName } = s3DeleteFilesInput;
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Deleting all versions of file(s) for keys ${keys.join(
      ', ',
    )} from bucket: ${bucketName} | Transaction uuid: ${transactionUuid}`;
    this.logger.log(taskMessage);

    const objectIdentifiers = (await Promise.all(keys.map((key) => this.listObjectVersions(key, bucketName, s3Client)))).flat();

    try {
      this.logger.verbose(`Object identifiers: ${JSON.stringify(objectIdentifiers)}}`);

      const deleteFileAllVerionsInput: DeleteObjectsCommandInput = {
        Bucket: bucketName,
        Delete: {
          Objects: objectIdentifiers,
        },
      };
      const deleteFilesCommand = new DeleteObjectsCommand(deleteFileAllVerionsInput);

      let client: S3Client = this.s3;
      if (s3Client) {
        client = s3Client;
      }

      const data = await client.send(deleteFilesCommand);

      // handle errors from delete command output (as it wont throw error on its own)
      this.throwDeleteErrors(data);

      this.logger.log(`[Succeed] ${taskMessage}`);
      return data;
    } catch (error) {
      this.logger.error(`${JSON.stringify(error)} | Transaction uuid: ${transactionUuid}`);
      const errorMessage = (error as Error).message;
      throw new AWSException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage, {
        operation: 'DELETE_ALL_FILES_VERSIONS',
        metadata: { keys },
      });
    }
  }

  // ===========================================================================
  // Move (Copy and delete)
  // ===========================================================================
  async moveFileBetweenS3(copyFileInput: S3CopyFileInput, s3Client?: S3Client) {
    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Moving file`;
    this.logger.log(taskMessage);

    const { fileDetail, fromBucket } = copyFileInput;
    const { fromKey } = fileDetail;
    const deleteFileInput: S3DeleteFileInput = {
      key: fromKey,
      bucketName: fromBucket,
    };

    await this.copyFileBetweenS3(copyFileInput, s3Client);
    await this.deleteFileFromS3(deleteFileInput, s3Client);

    this.logger.log(`[Success] ${taskMessage}`);
  }

  // ===========================================================================
  // Metadata
  // ===========================================================================
  /**
   * S3 stores checksum in base64 representation and hence, there is a need to convert it back to hex
   * for FileSG processes
   */
  async getFileMetadata({ bucketName, key }: S3GetFileMetadataInput, s3Client?: S3Client): Promise<S3GetFileMetadataOutput> {
    const minimumBytes = 4100; // A fair amount of file-types are detectable within this range.

    const taskMessage = `${LOG_OPERATION_NAME_PREFIX.S3} Getting file metadata`;
    this.logger.log(taskMessage);

    try {
      const client = this.providedS3Client(s3Client);

      const [headObjectResult, downloadFileResult] = await Promise.all([
        this.headObjectFromS3({ bucketName, key, getChecksum: true }, client),
        this.downloadFileFromS3({ bucketName, key, range: { start: 0, end: minimumBytes } }, client),
      ]);

      this.logger.log(`[Succeed] ${taskMessage}`);

      const sizeInBytes = headObjectResult.ContentLength ?? null;
      const checksum = headObjectResult.ChecksumSHA256
        ? convertBinaryRepresentation(headObjectResult.ChecksumSHA256, 'base64', 'hex')
        : null;
      const mimeType = (await fromStream(downloadFileResult.Body as Readable))?.mime;

      return {
        sizeInBytes,
        checksum,
        mimeType,
      };
    } catch (error) {
      const errorMessage = (error as Error).message;
      throw new AWSException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage, {
        operation: 'GET_OBJECT_METADATA',
        metadata: {
          bucketName,
          key,
        },
      });
    }
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private providedS3Client(s3Client?: S3Client): S3Client {
    return s3Client ?? this.s3;
  }

  private throwDeleteErrors(deleteObjectsOutput: DeleteObjectsOutput) {
    if (deleteObjectsOutput.Errors && deleteObjectsOutput.Errors?.length > 0) {
      const errors = deleteObjectsOutput.Errors.reduce<string[]>((array, error) => {
        this.logger.error(error);
        if (error.Message) {
          array.push(error.Message);
        }

        return array;
      }, []);

      throw new Error(errors.join(', '));
    }
  }
}
