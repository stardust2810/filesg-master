import { Credentials } from '@aws-sdk/types';
import { S3Service as BaseS3Service } from '@filesg/aws';

import { MockService } from '../../../../typings/common.mock';
import { S3Service } from '../s3.service';

export const mockBaseS3Service: MockService<BaseS3Service> = {
  createAssumedClient: jest.fn(),
  listFilesFromS3: jest.fn(),
  listObjectVersions: jest.fn(),
  uploadFileToS3: jest.fn(),
  downloadFileFromS3: jest.fn(),
  copyFileBetweenS3: jest.fn(),
  copyFilesBetweenS3: jest.fn(),
  deleteFileFromS3: jest.fn(),
  deleteFilesFromS3: jest.fn(),
  deleteFilesByPrefixFromS3: jest.fn(),
  deleteFileAllVersions: jest.fn(),
  deleteFilesAllVersions: jest.fn(),
  moveFileBetweenS3: jest.fn(),
  multipartUploadFileToS3: jest.fn(),
  headObjectFromS3: jest.fn(),
  getFileMetadata: jest.fn()
};

export const mockS3Service: MockService<S3Service> = {
  createAssumedClient: jest.fn(),
  deleteFileFromStgBucket: jest.fn(),
  moveFileFromStgToStgClean: jest.fn(),
};

export const mockKey = 'mockKey';
export const mockFileAssetUuid = 'mockFileAssetUuid';
export const mockTags = 'mockTags';

export const mockCredentials: Credentials = {
  accessKeyId: 'mockAccessKeyId',
  secretAccessKey: 'mockSecretAccessKey',
};
