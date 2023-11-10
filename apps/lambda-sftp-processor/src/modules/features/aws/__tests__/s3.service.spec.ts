import { S3Service as BaseS3Service, S3UploadFileInput } from '@filesg/aws';
import { FEATURE_TOGGLE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import stream from 'stream/promises';

import { FileDownloadErrorException, UploadWorkingFileToS3Exception } from '../../../../common/custom-exceptions';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseS3Service, mockKey, mockPath, mockPrefix, mockS3Client, mockS3UploadFileUpload } from '../__mocks__/aws-s3.service.mock';
import { mockCredentials, mockStsService } from '../__mocks__/aws-sts.service.mock';
import { S3Service } from '../s3.service';
import { StsService } from '../sts.service';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        {
          provide: BaseS3Service,
          useValue: mockBaseS3Service,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
        {
          provide: StsService,
          useValue: mockStsService,
        },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);

    jest.spyOn(service, 'createAssumedClient').mockResolvedValue(mockS3Client);
    mockStsService.assumeSftpProcessorRole.mockResolvedValue(mockCredentials);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAssumedClient', () => {
    it('baseS3Service createAssumedClient should be called with correct args', async () => {
      // need to restore this mock as we are testing this particular method
      jest.spyOn(service, 'createAssumedClient').mockRestore();

      const { region } = mockFileSGConfigService.awsConfig;
      const { useLocalstack } = mockFileSGConfigService.systemConfig;

      await service.createAssumedClient(mockCredentials);

      expect(mockBaseS3Service.createAssumedClient).toBeCalledWith(mockCredentials, region, useLocalstack === FEATURE_TOGGLE.ON);
    });
  });

  describe('downloadFileFromSftpBucketToDisk', () => {
    it('baseS3Service downloadFileFromS3 should be called with correct args', async () => {
      mockBaseS3Service.downloadFileFromS3.mockResolvedValue({ Body: 'random-body' });

      jest.spyOn(fs, 'createWriteStream').mockImplementation();
      jest.spyOn(stream, 'pipeline').mockImplementation();

      const { s3SftpBucket } = mockFileSGConfigService.awsConfig;

      await service.downloadFileFromSftpBucketToDisk(mockKey, mockPath);

      expect(mockBaseS3Service.downloadFileFromS3).toBeCalledWith(
        {
          key: mockKey,
          bucketName: s3SftpBucket,
        },
        mockS3Client,
      );
    });

    it('FileDownloadErrorException should be thrown when Body is undefined', async () => {
      mockBaseS3Service.downloadFileFromS3.mockResolvedValue({ Body: undefined });

      await expect(service.downloadFileFromSftpBucketToDisk(mockKey, mockPath)).rejects.toThrowError(FileDownloadErrorException);
    });
  });

  describe('deleteFileFromSftpBucket', () => {
    it('baseS3Service deleteFileFromS3 should be called with correct args', async () => {
      const { s3SftpBucket } = mockFileSGConfigService.awsConfig;

      await service.deleteFileFromSftpBucket(mockKey);

      expect(mockBaseS3Service.deleteFileFromS3).toBeCalledWith(
        {
          key: mockKey,
          bucketName: s3SftpBucket,
        },
        mockS3Client,
      );
    });
  });

  describe('deleteFilesByPrefixFromSftpBucket', () => {
    it('baseS3Service deleteFilesByPrefixFromS3 should be called with correct args', async () => {
      const { s3SftpBucket } = mockFileSGConfigService.awsConfig;

      await service.deleteFilesByPrefixFromSftpBucket(mockPrefix);

      expect(mockBaseS3Service.deleteFilesByPrefixFromS3).toBeCalledWith(
        {
          prefix: mockPrefix,
          bucketName: s3SftpBucket,
        },
        mockS3Client,
      );
    });
  });

  describe('uploadFilesToSftpBucket', () => {
    it('baseS3Service uploadFileToS3 should be called with correct args', async () => {
      mockBaseS3Service.uploadFileToS3.mockResolvedValue(undefined);

      const { s3SftpBucket } = mockFileSGConfigService.awsConfig;
      const input: S3UploadFileInput[] = [mockS3UploadFileUpload, mockS3UploadFileUpload];

      await service.uploadFilesToSftpBucket(input);

      expect(mockBaseS3Service.uploadFileToS3).toBeCalledWith(input[0], s3SftpBucket, mockS3Client);
      expect(mockBaseS3Service.uploadFileToS3).toBeCalledTimes(input.length);
    });

    it('UploadWorkingFileToS3Exception should be thrown where there is any error', async () => {
      mockBaseS3Service.uploadFileToS3.mockResolvedValueOnce(undefined).mockRejectedValueOnce({
        reason: {
          message: 'Test dummy error',
        },
      });

      const input: S3UploadFileInput[] = [mockS3UploadFileUpload, mockS3UploadFileUpload];

      await expect(service.uploadFilesToSftpBucket(input)).rejects.toThrowError(UploadWorkingFileToS3Exception);
    });
  });
});
