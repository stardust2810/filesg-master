import { CopyObjectCommandOutput, PutObjectCommandOutput, S3ClientConfig } from '@aws-sdk/client-s3';
import { MIME_TYPE } from '@filesg/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { MimeType } from 'file-type';
import { Readable } from 'stream';

export const S3_CLIENT = Symbol('S3_CLIENT');
export const S3_MODULE_OPTIONS = Symbol('S3_MODULE_OPTIONS');

type Key = string;
type BucketName = string;

export interface BaseS3Object {
  key: Key;
  bucketName: BucketName;
}

export interface S3ModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (...args: any[]) => S3ClientConfig | Promise<S3ClientConfig>;
  inject?: any[];
}

// =============================================================================
// List
// =============================================================================
export interface S3ListFilesInput {
  bucketName: string;
  prefix?: string;
}

// =============================================================================
// Head
// =============================================================================
export interface S3HeadObjectInput {
  key: string;
  bucketName: string;
  getChecksum: boolean;
}

export interface S3GetFileMetadataInput {
  key: string;
  bucketName: string;
}

export interface S3GetFileMetadataOutput {
  sizeInBytes: number | null;
  checksum: string | null;
  mimeType: MimeType | undefined;
}

// =============================================================================
// Download
// =============================================================================
export interface S3DownloadFileInput {
  key: string;
  bucketName: string;
  fileName?: string;
  range?: {
    start: number;
    end: number;
  };
}

// =============================================================================
// Upload
// =============================================================================
export interface UploadObjectCommandOutput extends PutObjectCommandOutput {
  key: string;
}

interface S3BaseUploadInput {
  Key: Key;
  ContentType: MIME_TYPE;
  ChecksumSHA256?: string;
}

export interface S3UploadFileInput extends S3BaseUploadInput {
  Body: Buffer | Readable;
}

export interface S3UploadUnknownLengthStreamInput extends S3BaseUploadInput {
  Body: Buffer | Blob | Readable;
}

// =============================================================================
// Copy
// =============================================================================
export interface S3CopyFileInputDetails {
  fromKey: string;
  toKey: string;
}

export interface S3BaseCopyFileInput {
  fromBucket: string;
  toBucket: string;
  tags?: string;
}

export interface S3CopyFileInput extends S3BaseCopyFileInput {
  fileDetail: S3CopyFileInputDetails;
}

export interface S3CopyFilesInput extends S3BaseCopyFileInput {
  fileDetails: S3CopyFileInputDetails[];
}

export interface ExtendedCopyObjectCommandOutput extends CopyObjectCommandOutput {
  fromKey: string;
  toKey: string;
}

export interface FulfilledMove {
  fromKey: string;
  toKey: string;
  tags?: string;
}

export interface FailedMove {
  reason: string;
  isRetryable: boolean;
  fromKey: string;
  toKey: string;
}

export interface S3CopyFilesPromiseResultMap {
  fulfilled: FulfilledMove[];
  rejected: FailedMove[];
}

// =============================================================================
// Delete
// =============================================================================
export interface S3DeleteFileInput {
  key: string;
  bucketName: string;
}

export interface S3DeleteFilesInput {
  keys: string[];
  bucketName: string;
}

export interface S3DeleteFilesPromiseResultMap {
  fulfilled: Record<string, unknown>[];
  rejected: FailedDelete[];
}

export interface FailedDelete {
  reason: string;
  keys: Key[];
}
