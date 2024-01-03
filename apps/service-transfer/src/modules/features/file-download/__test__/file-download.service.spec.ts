import { Readable } from 'node:stream';

import { ZipService } from '@filesg/zipper';
import { Test, TestingModule } from '@nestjs/testing';

import { MGMT_SERVICE_API_CLIENT_PROVIDER } from '../../../../typings/common';
import { mockMgmtServiceApiClient } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockS3Service } from '../../aws/__mocks__/aws-s3.service.mock';
import { mockSqsService } from '../../aws/__mocks__/aws-sqs.service.mock';
import { mockStsService } from '../../aws/__mocks__/aws-sts.service.mock';
import { S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';
import { mockOAData, mockOaDocumentService } from '../../oa-document/__mocks__/oa-document.service.mock';
import { OaDocumentService } from '../../oa-document/oa-document.service';
import { mockDownloadInfo, mockFileSessionId, mockS3File } from '../__mocks__/file-download.service.mock';
import { mockZipService } from '../__mocks__/zip.service.mock';
import { FileDownloadService } from '../file-download.service';

describe('FileDownloadService', () => {
  let service: FileDownloadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FileDownloadService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: StsService, useValue: mockStsService },
        { provide: SqsService, useValue: mockSqsService },
        { provide: ZipService, useValue: mockZipService },
        { provide: OaDocumentService, useValue: mockOaDocumentService },
        { provide: MGMT_SERVICE_API_CLIENT_PROVIDER, useValue: mockMgmtServiceApiClient },
      ],
    }).compile();

    service = module.get<FileDownloadService>(FileDownloadService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('downloadFile', () => {
    it('should be defined', () => {
      expect(service.downloadFile).toBeDefined();
    });

    it('should retrieve download info with api client, download file(s) from main bucket, and return file details and stream', async () => {
      mockMgmtServiceApiClient.get.mockResolvedValue({ data: mockDownloadInfo });
      mockS3Service.downloadFileFromMainBucket.mockResolvedValue(mockS3File);

      // call and return value
      expect(await service.downloadFile(mockFileSessionId)).toEqual({
        type: mockS3File.ContentType,
        stream: mockS3File.Body,
        fileAssetIds: [mockDownloadInfo.files[0].id],
        name: 'testFile1',
      });

      // retrieving download info
      expect(await mockMgmtServiceApiClient.get).toBeCalledWith(`v1/file-download/${mockFileSessionId}`);

      // Assume role and download file
      expect(await mockStsService.assumeRetrieveRole).toBeCalledWith(mockDownloadInfo.ownerUuidHash);
      expect(await mockS3Service.createAssumedClient).toBeCalledTimes(1);
    });
  });

  describe('obfuscateAndDownloadOAFile', () => {
    it('should be defined', () => {
      expect(service.obfuscateAndDownloadOAFile).toBeDefined();
    });

    it('should call downloadFile to download file', async () => {
      const mockReadableStream = new Readable();
      mockReadableStream.push(JSON.stringify(mockOAData));
      mockReadableStream.push(null);

      jest.spyOn(service, 'downloadFile').mockResolvedValue({
        type: mockS3File.ContentType,
        stream: mockReadableStream,
        fileAssetIds: [mockDownloadInfo.files[0].id],
        name: 'testFile1',
      });

      jest.spyOn(mockOaDocumentService, 'obfuscateOa').mockImplementation();
      await service.obfuscateAndDownloadOAFile(mockFileSessionId);

      expect(service.downloadFile).toBeCalledTimes(1);
      expect(service.downloadFile).toBeCalledWith(mockFileSessionId);

      expect(mockOaDocumentService.obfuscateOa).toBeCalledTimes(1);
    });
  });
});
