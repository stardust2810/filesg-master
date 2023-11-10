import { S3 } from '@aws-sdk/client-s3';
import { S3Service as BaseS3Service, S3UploadFileInput } from '@filesg/aws';
import { MIME_TYPE } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { S3Service } from '../s3.service';

export const mockBaseS3Service: MockService<BaseS3Service> = {
  createAssumedClient: jest.fn(),
  listObjectVersions: jest.fn(),
  listFilesFromS3: jest.fn(),
  uploadFileToS3: jest.fn(),
  multipartUploadFileToS3: jest.fn(),
  downloadFileFromS3: jest.fn(),
  headObjectFromS3: jest.fn(),
  copyFileBetweenS3: jest.fn(),
  copyFilesBetweenS3: jest.fn(),
  deleteFileFromS3: jest.fn(),
  deleteFilesFromS3: jest.fn(),
  deleteFilesByPrefixFromS3: jest.fn(),
  deleteFileAllVersions: jest.fn(),
  deleteFilesAllVersions: jest.fn(),
  moveFileBetweenS3: jest.fn(),
  getFileMetadata: jest.fn(),
};

export const mockS3Service: MockService<S3Service> = {
  downloadFileFromSftpBucketToDisk: jest.fn(),
  deleteFileFromSftpBucket: jest.fn(),
  deleteFilesByPrefixFromSftpBucket: jest.fn(),
  uploadFilesToSftpBucket: jest.fn(),
  createAssumedClient: jest.fn(),
};

export const mockS3Client = new S3({ region: 'ap-southeast-1' });
export const mockKey = 'mockKey';
export const mockPath = 'mockPath';
export const mockPrefix = 'mockPrefix';
export const mockS3UploadFileUpload: S3UploadFileInput = {
  Body: Buffer.alloc(0),
  ContentType: MIME_TYPE.PDF,
  Key: mockKey,
};
