import { S3 } from '@aws-sdk/client-s3';
import { S3Service as BaseS3Service } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { S3Service } from '../s3.service';

export const mockS3Service: MockService<S3Service> = {
  createAssumedClient: jest.fn(),
  downloadFileFromStgCleanBucket: jest.fn(),
  uploadZipToMainBucket: jest.fn(),
  getFileSizeFromMainBucket: jest.fn(),
};

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

export const mockS3Client = new S3({ region: 'ap-southeast-1' });
export const mockZipFileData = `some zip file data`;
