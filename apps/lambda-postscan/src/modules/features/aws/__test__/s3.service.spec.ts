import { S3Service as BaseS3Service } from '@filesg/aws';
import { Test, TestingModule } from '@nestjs/testing';

import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockBaseS3Service, mockCredentials, mockFileAssetUuid, mockKey, mockTags } from '../__mocks__/s3.service.mock';
import { S3Service } from '../s3.service';

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
      ],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAssumedClient', () => {
    it('should be defined', () => {
      expect(service.createAssumedClient).toBeDefined();
    });

    it('should call baseS3Service createAssumedClient with correct args', async () => {
      const { region } = mockFileSGConfigService.awsConfig;

      await service.createAssumedClient(mockCredentials);

      expect(mockBaseS3Service.createAssumedClient).toBeCalledWith(mockCredentials, region, false);
    });
  });

  describe('deleteFileFromStgBucket', () => {
    it('should be defined', () => {
      expect(service.deleteFileFromStgBucket).toBeDefined();
    });

    it('should call baseS3Service deleteFileFromS3 with correct args', async () => {
      const { s3StgBucket } = mockFileSGConfigService.awsConfig;

      await service.deleteFileFromStgBucket(mockKey);

      expect(mockBaseS3Service.deleteFileFromS3).toBeCalledWith({ key: mockKey, bucketName: s3StgBucket }, undefined);
    });
  });

  describe('moveFileFromStgToStgClean', () => {
    it('should be defined', () => {
      expect(service.moveFileFromStgToStgClean).toBeDefined();
    });

    it('should call baseS3Service deleteFileFromS3 with correct args', async () => {
      const { s3StgBucket, s3StgCleanBucket } = mockFileSGConfigService.awsConfig;

      await service.moveFileFromStgToStgClean(mockFileAssetUuid, mockTags);

      const mockCopyFileInput = {
        fileDetail: {
          fromKey: mockFileAssetUuid,
          toKey: mockFileAssetUuid,
        },
        fromBucket: s3StgBucket,
        toBucket: s3StgCleanBucket,
        tags: mockTags,
      };

      expect(mockBaseS3Service.moveFileBetweenS3).toBeCalledWith(mockCopyFileInput, undefined);
    });
  });
});
