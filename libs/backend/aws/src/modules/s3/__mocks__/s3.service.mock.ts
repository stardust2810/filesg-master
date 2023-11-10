/* eslint-disable sonarjs/no-duplicate-string */
import { DeleteObjectsCommandOutput } from '@aws-sdk/client-s3';
import { Credentials } from '@aws-sdk/types';
import { MIME_TYPE } from '@filesg/common';

import { ExtendedCopyObjectCommandOutput } from '../../..';
import {
  FailedMove,
  S3CopyFileInput,
  S3CopyFileInputDetails,
  S3CopyFilesInput,
  S3DeleteFileInput,
  S3DeleteFilesInput,
  S3DownloadFileInput,
  S3HeadObjectInput,
  S3UploadFileInput,
} from '../../../typings/s3.typing';

// =============================================================================
// Common
// =============================================================================
export const mockRegion = 'mockRegion';
export const mockFromBucket = 'mockFromBucket';
export const mockToBucket = 'mockToBucket';

export const mockCredentials: Credentials = {
  accessKeyId: 'mockAccessKeyId',
  secretAccessKey: 'mockSecretAccessKey',
};

export function generateMockS3CopyFileInputDetails(): S3CopyFileInputDetails;
export function generateMockS3CopyFileInputDetails(numberOfFiles: 1): S3CopyFileInputDetails;
export function generateMockS3CopyFileInputDetails(numberOfFiles: number): S3CopyFileInputDetails[];
export function generateMockS3CopyFileInputDetails(numberOfFiles = 1): S3CopyFileInputDetails | S3CopyFileInputDetails[] {
  if (numberOfFiles === 1) {
    return {
      fromKey: 'mockFromKey-1',
      toKey: 'mockToKey-1',
    };
  }

  return Array.from(Array(numberOfFiles)).map((_, index) => {
    const count = index + 1;
    return {
      fromKey: `mockFromKey-${count}`,
      toKey: `mockToKey-${count}`,
    };
  });
}

// =============================================================================
// Upload
// =============================================================================
export const mockUploadFileInput: S3UploadFileInput = {
  Key: 'mockKey',
  Body: Buffer.from('mockBody'),
  ContentType: MIME_TYPE.JPEG,
};

// =============================================================================
// Download
// =============================================================================
export const mockDownloadFileInput: S3DownloadFileInput = {
  key: 'mockFromKey-1',
  bucketName: mockFromBucket,
};

export const mockHeadObjectInput: S3HeadObjectInput = {
  bucketName: 'mockBucket',
  key: 'mockKey',
  getChecksum: true,
};

// =============================================================================
// Copy
// =============================================================================

export const mockCopyFileInput: S3CopyFileInput = {
  fileDetail: generateMockS3CopyFileInputDetails(),
  fromBucket: mockFromBucket,
  toBucket: mockToBucket,
  tags: 'mockTags',
};

export const mockCopyFilesInput: S3CopyFilesInput = {
  fileDetails: generateMockS3CopyFileInputDetails(3),
  fromBucket: mockFromBucket,
  toBucket: mockToBucket,
  tags: 'mockTags',
};

export const mockCopyFileOutput: ExtendedCopyObjectCommandOutput = {
  $metadata: {},
  ...generateMockS3CopyFileInputDetails(),
};

export const mockRejectedCopyFileOutput: PromiseRejectedResult = {
  status: 'rejected',
  reason: {
    message: 'mockError',
    metadata: {
      ...generateMockS3CopyFileInputDetails(),
    },
  },
};

export const mockRejectedErrors: FailedMove[] = [
  {
    reason: 'mockError',
    isRetryable: true,
    ...generateMockS3CopyFileInputDetails(),
  },
  {
    reason: 'mockError',
    isRetryable: true,
    ...generateMockS3CopyFileInputDetails(),
  },
];

// =============================================================================
// Delete
// =============================================================================
export const mockDeleteFileInput: S3DeleteFileInput = {
  key: 'mockFromKey-1',
  bucketName: mockFromBucket,
};

export const mockDeleteFilesInput: S3DeleteFilesInput = {
  keys: ['mockFromKey-1'],
  bucketName: mockFromBucket,
};

export const mockDeleteOutputWithErrors: DeleteObjectsCommandOutput = {
  Errors: [
    {
      Message: 'error1',
    },
    {
      Message: 'error2',
    },
  ],
  $metadata: {},
};
