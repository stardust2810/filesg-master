import { S3 } from '@aws-sdk/client-s3';
import { Credentials } from '@aws-sdk/types';
import { S3HeadObjectInput, S3Service as BaseS3Service, S3UploadFileInput } from '@filesg/aws';
import { AssumeUploadMoveRole, MIME_TYPE, TransferFile } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { EncryptedFileAssetUuidToNewSizeMap, S3Service } from '../s3.service';

export const mockBaseS3Service: MockService<BaseS3Service> = {
  createAssumedClient: jest.fn(),
  listObjectVersions: jest.fn(),
  listFilesFromS3: jest.fn(),
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
  getFileMetadata: jest.fn(),
};

export const mockS3Service: MockService<S3Service> = {
  createAssumedClient: jest.fn(),
  uploadFileToStgBucket: jest.fn(),
  downloadFileFromStaticFileBucket: jest.fn(),
  deleteFilesFromStgBucket: jest.fn(),
  deleteFilesFromStgCleanBucket: jest.fn(),
  deleteFilesAllVersionsFromMainBucket: jest.fn(),
  downloadFileFromMainBucket: jest.fn(),
  copyTransferFiles: jest.fn(),
  getFileMetadata: jest.fn(),
  copyFileToStgBucket: jest.fn(),
  checkForMissingFilesInS3: jest.fn(),
  zipEncryptAndCopyFileFromStgCleanToMain: jest.fn(),
};

export const mockKey = 'mockKey';
export const mockKeys = [mockKey];

export const mockToBucket = 'mockToBucket';
export const mockFromBucket = 'mockFromBucket';

export const mockCredentials: Credentials = {
  accessKeyId: 'mockAccessKeyId',
  secretAccessKey: 'mockSecretAccessKey',
};

export const mockFileEncryptionPassword = 'mockFileEncryptionPassword';
export const mockEncryptedPassword = 'mockEncryptedPassword';

export const mockS3Client = new S3({ region: 'ap-southeast-1' });
export const mockAssumeUploadMoveRole: AssumeUploadMoveRole = { receiver: 'mockReceiver' };

export const mockUploadFileInput: S3UploadFileInput = {
  Key: 'mockKey',
  Body: Buffer.from('mockBody'),
  ContentType: MIME_TYPE.JPEG,
};

export const mockTransferFiles: TransferFile[] = [
  {
    from: {
      key: 'mockFromKey-1',
      fileAssetUuid: 'mockFromFileAssetUuid-1',
    },
    to: {
      key: 'mockToKey-1',
      fileAssetUuid: 'mockToFileAssetUuid-1',
    },
    isPasswordEncryptionRequired: true,
    name: 'fileName-1.png',
  },
  {
    from: {
      key: 'mockFromKey-2',
      fileAssetUuid: 'mockFromFileAssetUuid-2',
    },
    to: {
      key: 'mockToKey-2',
      fileAssetUuid: 'mockToFileAssetUuid-2',
    },
  },
];

export const mockFileSize = 100;
export const mockFileAssetUuidToNewSizeMap = mockTransferFiles.reduce<EncryptedFileAssetUuidToNewSizeMap>((acc, cur) => {
  if (cur.isPasswordEncryptionRequired) {
    acc[cur.to.fileAssetUuid!] = mockFileSize;
  }
  return acc;
}, {});

export const mockHeadObjectInput: S3HeadObjectInput = {
  key: 'mockKey',
  bucketName: 'mockBucket',
  getChecksum: true,
};
