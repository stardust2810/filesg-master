/* eslint-disable sonarjs/no-duplicate-string */
import 'aws-sdk-client-mock-jest';

import {
  ChecksumMode,
  CopyObjectCommand,
  CopyObjectCommandOutput,
  DeleteObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectVersionsCommand,
  ObjectIdentifier,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';

import { AWSHttpException, MoveFilesFailureException } from '../../../common/filters/custom-exceptions';
import { S3_CLIENT } from '../../../typings/s3.typing';
import * as helpers from '../../../utils/helpers';
import {
  mockCopyFileInput,
  mockCopyFileOutput,
  mockCopyFilesInput,
  mockCredentials,
  mockDeleteFileInput,
  mockDeleteFilesInput,
  mockDeleteOutputWithErrors,
  mockDownloadFileInput,
  mockHeadObjectInput,
  mockRegion,
  mockRejectedCopyFileOutput,
  mockToBucket,
  mockUploadFileInput,
} from '../__mocks__/s3.service.mock';
import { S3Service } from '../s3.service';

jest.mock('file-type', () => ({
  fromStream: jest.fn().mockImplementation(() => ({ mime: 'application/pdf' })),
}));

describe('S3Service', () => {
  let service: S3Service;
  const mockBaseS3Client = mockClient(S3Client);

  // For delete files error checking
  mockBaseS3Client.on(DeleteObjectsCommand).resolves({ Errors: [] });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: S3_CLIENT,
          useValue: mockBaseS3Client,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create Client
  // ===========================================================================
  describe('createAssumedClient', () => {
    it('should be defined', () => {
      expect(service.createAssumedClient).toBeDefined();
    });

    it('should return new S3Client with generateS3ClientConfigOptions as arg', async () => {
      jest.spyOn(helpers, 'generateS3ClientConfigOptions');

      await service.createAssumedClient(mockCredentials, mockRegion);

      expect(helpers.generateS3ClientConfigOptions).toBeCalledWith({ credentials: mockCredentials, region: mockRegion }, false);
    });
  });

  // ===========================================================================
  // List versions
  // ===========================================================================
  describe('listObjectVersions', () => {
    it('should be defined', () => {
      expect(service.listObjectVersions).toBeDefined();
    });

    it('should return all the versions of a particular object key', async () => {
      const mockFileKey = 'mockFileKey';
      const mockFileVersionId = 'mockVersionId';
      const mockVersions = [{ Key: mockFileKey, VersionId: mockFileVersionId }];

      const newS3Client = new S3Client({});
      const mockListObjectVersionsS3Client = mockClient(newS3Client);

      mockListObjectVersionsS3Client.on(ListObjectVersionsCommand).resolves({ Versions: mockVersions });

      expect(await service.listObjectVersions(mockFileKey, 'mockBucketName', newS3Client)).toEqual(mockVersions);
    });
  });

  // ===========================================================================
  // Upload
  // ===========================================================================
  describe('uploadFileToS3', () => {
    it('should be defined', () => {
      expect(service.uploadFileToS3).toBeDefined();
    });

    it('should send PutObjectCommand with correct args', async () => {
      await service.uploadFileToS3(mockUploadFileInput, mockToBucket);

      expect(mockBaseS3Client).toReceiveCommandWith(PutObjectCommand, { ...mockUploadFileInput, Bucket: mockToBucket });
    });

    it('should return fileAssetUuid as property', async () => {
      const { Key } = mockUploadFileInput;
      const newS3Client = new S3Client({});
      const mockUploadS3Client = mockClient(newS3Client);

      mockUploadS3Client.on(PutObjectCommand).resolves({});

      expect(await service.uploadFileToS3(mockUploadFileInput, mockToBucket, newS3Client)).toEqual({ key: Key });
    });
  });

  // ===========================================================================
  // Download
  // ===========================================================================
  describe('downloadFileFromS3', () => {
    it('should be defined', () => {
      expect(service.downloadFileFromS3).toBeDefined();
    });

    it('should send GetObjectCommand with correct args', async () => {
      const { key, bucketName, fileName } = mockDownloadFileInput;
      await service.downloadFileFromS3(mockDownloadFileInput);

      expect(mockBaseS3Client).toReceiveCommandWith(GetObjectCommand, {
        Bucket: bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename=${fileName}`,
      });
    });
  });

  describe('headObjectFromS3', () => {
    it('should be defined', () => {
      expect(service.headObjectFromS3).toBeDefined();
    });

    it('should send HeadObjectCommandInput with correct args', async () => {
      await service.headObjectFromS3(mockHeadObjectInput);

      expect(mockBaseS3Client).toReceiveCommandWith(HeadObjectCommand, {
        Bucket: mockHeadObjectInput.bucketName,
        Key: mockHeadObjectInput.key,
        ChecksumMode: mockHeadObjectInput.getChecksum ? ChecksumMode.ENABLED : undefined,
      });
    });
  });

  // ===========================================================================
  // Copy
  // ===========================================================================
  describe('copyFileBetweenS3', () => {
    it('should be defined', () => {
      expect(service.copyFileBetweenS3).toBeDefined();
    });

    it('should send CopyObjectCommand with correct args', async () => {
      const { fileDetail, fromBucket, toBucket, tags } = mockCopyFileInput;
      const { fromKey, toKey } = fileDetail;

      await service.copyFileBetweenS3(mockCopyFileInput);

      expect(mockBaseS3Client).toReceiveCommandWith(CopyObjectCommand, {
        CopySource: fromBucket + '/' + fromKey,
        Bucket: toBucket,
        Key: toKey,
        TaggingDirective: 'REPLACE',
        Tagging: tags,
      });
    });

    it('should return from & to as property', async () => {
      const { fileDetail } = mockCopyFileInput;

      const newS3Client = new S3Client({});
      const mockCopyS3Client = mockClient(newS3Client);

      mockCopyS3Client.on(CopyObjectCommand).resolves({});

      expect(await service.copyFileBetweenS3(mockCopyFileInput, newS3Client)).toEqual(fileDetail);
    });
  });

  describe('copyFilesBetweenS3', () => {
    it('should be defined', () => {
      expect(service.copyFilesBetweenS3).toBeDefined();
    });

    it('should call copyFileBetweenS3 N times for N number of files', async () => {
      jest.spyOn(service, 'copyFileBetweenS3');
      await service.copyFilesBetweenS3(mockCopyFilesInput);

      expect(service.copyFileBetweenS3).toBeCalledTimes(mockCopyFilesInput.fileDetails.length);
    });

    it('should call deleteFilesAllVersions if copiedObjects > 0 & throw MoveFilesFailureException', async () => {
      const newS3Client = new S3Client({});
      const mockCopyS3Client = mockClient(newS3Client);

      const { fromKey, toKey, $metadata } = mockCopyFileOutput;
      const { reason } = mockRejectedCopyFileOutput;

      mockCopyS3Client.on(DeleteObjectsCommand).resolves({ Errors: [] });

      const deleteFilesFromS3Spy = jest.spyOn(service, 'deleteFilesFromS3');
      deleteFilesFromS3Spy.mockReturnThis();

      mockCopyS3Client
        .on(CopyObjectCommand)
        .resolvesOnce({ fromKey, toKey, $metadata } as CopyObjectCommandOutput)
        .rejects(reason);

      await expect(service.copyFilesBetweenS3(mockCopyFilesInput, newS3Client)).rejects.toThrow(MoveFilesFailureException);

      expect(deleteFilesFromS3Spy).toBeCalledWith({ keys: [toKey], bucketName: mockCopyFilesInput.toBucket }, newS3Client);
    });
  });

  // =============================================================================
  // Delete
  // =============================================================================
  describe('deleteFileFromS3', () => {
    it('should be defined', () => {
      expect(service.deleteFileFromS3).toBeDefined();
    });

    it('should call deleteFilesFromS3 with correct args', async () => {
      const { key, bucketName } = mockDeleteFileInput;

      jest.spyOn(service, 'deleteFilesFromS3');

      await service.deleteFileFromS3(mockDeleteFileInput);

      expect(service.deleteFilesFromS3).toBeCalledWith({ keys: [key], bucketName }, undefined);
    });
  });

  describe('deleteFilesFromS3', () => {
    it('should be defined', () => {
      expect(service.deleteFilesFromS3).toBeDefined();
    });

    it('should send DeleteObjectsCommand with correct args', async () => {
      const { keys, bucketName } = mockDeleteFilesInput;
      await service.deleteFilesFromS3(mockDeleteFilesInput);

      expect(mockBaseS3Client).toReceiveCommandWith(DeleteObjectsCommand, {
        Bucket: bucketName,
        Delete: {
          Objects: keys.map((key) => ({ Key: key })),
        },
      });
    });

    it('should throw error if error is returned', async () => {
      const newS3Client = new S3Client({});
      const mockDeleteS3Client = mockClient(newS3Client);

      const { Errors } = mockDeleteOutputWithErrors;
      const errorMessage = new Error(`${Errors![0].Message}, ${Errors![1].Message}`).message;

      mockDeleteS3Client.on(DeleteObjectsCommand).resolves(mockDeleteOutputWithErrors);

      await expect(service.deleteFilesFromS3(mockDeleteFilesInput, newS3Client)).rejects.toThrow(
        new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, errorMessage),
      );
    });
  });

  describe('deleteFileAllVersions', () => {
    it('should be defined', () => {
      expect(service.deleteFileAllVersions).toBeDefined();
    });

    it('should call deleteFilesAllVersions with correct args', async () => {
      const { key, bucketName } = mockDeleteFileInput;

      const deleteFilesAllVersionsSpy = jest.spyOn(service, 'deleteFilesAllVersions');
      deleteFilesAllVersionsSpy.mockReturnThis();

      await service.deleteFileAllVersions(mockDeleteFileInput);

      expect(deleteFilesAllVersionsSpy).toBeCalledWith({ keys: [key], bucketName }, undefined);
    });
  });

  describe('deleteFilesAllVersions', () => {
    it('should be defined', () => {
      expect(service.deleteFilesAllVersions).toBeDefined();
    });

    it('should send DeleteObjectsCommand with correct args', async () => {
      const { keys, bucketName } = mockDeleteFilesInput;

      const objectIdentifiers: ObjectIdentifier[] = [{ Key: keys[0], VersionId: 'mockVersionId' }];

      const listObjectVersionsSpy = jest.spyOn(service, 'listObjectVersions');
      listObjectVersionsSpy.mockResolvedValueOnce(objectIdentifiers);

      await service.deleteFilesAllVersions(mockDeleteFilesInput);

      expect(mockBaseS3Client).toReceiveCommandWith(DeleteObjectsCommand, {
        Bucket: bucketName,
        Delete: {
          Objects: objectIdentifiers,
        },
      });
    });
  });

  // ===========================================================================
  // Move (Copy and delete)
  // ===========================================================================
  describe('moveFileBetweenS3', () => {
    it('should be defined', () => {
      expect(service.moveFileBetweenS3).toBeDefined();
    });

    it('should call copy and delete with correct args', async () => {
      const { fileDetail, fromBucket } = mockCopyFileInput;

      jest.spyOn(service, 'copyFileBetweenS3');
      jest.spyOn(service, 'deleteFileFromS3');

      await service.moveFileBetweenS3(mockCopyFileInput);

      expect(service.copyFileBetweenS3).toBeCalledWith(mockCopyFileInput, undefined);
      expect(service.deleteFileFromS3).toBeCalledWith({ key: fileDetail.fromKey, bucketName: fromBucket }, undefined);
    });
  });

  describe('getFileMetadata', () => {
    it('should be defined', () => {
      expect(service.getFileMetadata).toBeDefined();
    });

    it('correct response should be returned', async () => {
      // typing as any as it is not important for the rest of the values to be presented
      jest.spyOn(service, 'headObjectFromS3').mockResolvedValueOnce({
        ContentLength: 1000,
        ChecksumSHA256: '3df79d34abbca99308e79cb94461c1893582604d68329a41fd4bec1885e6adb4',
      } as any);
      jest.spyOn(service, 'downloadFileFromS3').mockResolvedValueOnce({
        Body: 'random-mock',
      } as any);

      expect(await service.getFileMetadata({ bucketName: 'mockBucket', key: 'mockKey' })).toEqual({
        sizeInBytes: 1000,
        checksum: 'ddd7fbf5ddf869b6dc6bdf77d3c7bbf5c6fde38eb5735f3ddf9f36eb4e1debcdf6f5ae357dde1b79cd7cf397ba69d6f8',
        mimeType: 'application/pdf',
      });
    });
  });
});
