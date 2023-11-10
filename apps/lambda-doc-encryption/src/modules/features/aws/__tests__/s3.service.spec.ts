import { S3Service as BaseS3Service, S3UploadUnknownLengthStreamInput } from '@filesg/aws';
import { FEATURE_TOGGLE, MIME_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Readable } from 'stream';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockInput } from '../../doc-encryption/__mocks__/doc-encryption.service.mock';
import { mockBaseS3Service, mockS3Client, mockZipFileData } from '../__mocks__/s3.service.mock';
import { mockCredentials, mockStsService } from '../__mocks__/sts.service.mock';
import { S3Service } from '../s3.service';
import { StsService } from '../sts.service';

describe.skip('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: StsService, useValue: mockStsService },
        { provide: BaseS3Service, useValue: mockBaseS3Service },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);

    jest.spyOn(service, 'createAssumedClient').mockResolvedValue(mockS3Client);
    mockStsService.assumeDocumentEncryptionRole.mockResolvedValue(mockCredentials);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAssumedClient', () => {
    it('should call baseS3Service createAssumedClient with the correct args', async () => {
      // need to restore this mock as we are testing this particular method
      jest.spyOn(service, 'createAssumedClient').mockRestore();

      const { region } = mockFileSGConfigService.awsConfig;
      const { useLocalstack } = mockFileSGConfigService.systemConfig;

      await service.createAssumedClient(mockCredentials);

      expect(mockBaseS3Service.createAssumedClient).toBeCalledWith(mockCredentials, region, useLocalstack === FEATURE_TOGGLE.ON);
    });
  });

  describe('downloadFileFromStgCleanBucket', () => {
    it('should call baseS3Service downloadFileFromS3 with the correct args', async () => {
      const { fromKey, assumeRole } = mockInput;
      const downloadOutput = { Body: mockZipFileData, ContentType: MIME_TYPE.ZIP };

      mockBaseS3Service.downloadFileFromS3.mockResolvedValueOnce(downloadOutput);

      // expect(await service.downloadFileFromStgCleanBucket(fromKey, assumeRole)).toEqual(downloadOutput);

      expect(mockBaseS3Service.downloadFileFromS3).toBeCalledWith(
        { key: fromKey, bucketName: mockFileSGConfigService.awsConfig.stgCleanBucketName },
        mockS3Client,
      );
    });

    it('should throw FileDownloadException when either Body or ContentType is missing after calling downloadFileFromS3', async () => {
      const { fromKey, assumeRole } = mockInput;
      mockBaseS3Service.downloadFileFromS3.mockResolvedValueOnce({ Body: undefined });

      // await expect(service.downloadFileFromStgCleanBucket(fromKey, assumeRole)).rejects.toThrow(FileDownloadException);
    });
  });

  describe('uploadZipToMainBucket', () => {
    const { toKey, assumeRole } = mockInput;
    const { mainBucketName } = mockFileSGConfigService.awsConfig;

    const uploadInput: S3UploadUnknownLengthStreamInput = {
      Key: toKey,
      Body: mockZipFileData as unknown as Readable,
      ContentType: MIME_TYPE.ZIP,
    };

    it('should call baseS3Service multipartUploadFileToS3 with the correct args', async () => {
      const uploadOutput = {
        Key: toKey,
        Bucket: mainBucketName,
        RequestCharged: 'requester',
      };

      mockBaseS3Service.multipartUploadFileToS3.mockResolvedValueOnce(uploadOutput);

      // expect(await service.uploadZipToMainBucket(uploadInput, assumeRole)).toEqual({ Key: toKey, Bucket: mainBucketName });

      expect(mockBaseS3Service.multipartUploadFileToS3).toBeCalledWith(uploadInput, mainBucketName, mockS3Client);
    });
  });

  describe('getFileSizeFromMainBucket', () => {
    const { toKey, assumeRole } = mockInput;
    const { mainBucketName } = mockFileSGConfigService.awsConfig;

    it('should call baseS3Service headObjectFromS3 with the correct args', async () => {
      const mockFileSize = 88;
      mockBaseS3Service.headObjectFromS3.mockResolvedValueOnce({ ContentLength: mockFileSize });

      // expect(await service.getFileSizeFromMainBucket(toKey, assumeRole)).toEqual(mockFileSize);

      expect(mockBaseS3Service.headObjectFromS3).toBeCalledWith(
        {
          bucketName: mainBucketName,
          key: toKey,
          getChecksum: false,
        },
        mockS3Client,
      );
    });

    it('should throw GetFileSizeException when file size cannot be determined', async () => {
      mockBaseS3Service.headObjectFromS3.mockResolvedValueOnce({ ContentLength: undefined });

      // await expect(service.getFileSizeFromMainBucket(toKey, assumeRole)).rejects.toThrow(GetFileSizeException);
    });
  });
});
