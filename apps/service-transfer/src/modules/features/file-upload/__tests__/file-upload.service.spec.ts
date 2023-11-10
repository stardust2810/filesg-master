import { AWSHttpException, AWSS3UploadException } from '@filesg/aws';
import { UnauthorizedRequestException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EVENT, File, FILE_TYPE, FileInfo, MIME_TYPE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { S3TransferException } from '../../../../common/custom-exceptions';
import {
  DuplicateFileNameException,
  FilesFailedToUploadException,
  FileSizeException,
  InvalidChecksumException,
  MissingS3FileException,
  UnsupportedFileTypeException,
  UploadFileMismatchException,
} from '../../../../common/filters/custom-exceptions.filter';
import { MGMT_SERVICE_API_CLIENT_PROVIDER } from '../../../../typings/common';
import { getFileTypeFromMimeType } from '../../../../utils/mime-detector';
import { mockMgmtServiceApiClient } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockS3Service } from '../../aws/__mocks__/aws-s3.service.mock';
import { mockSqsService } from '../../aws/__mocks__/aws-sqs.service.mock';
import { mockStsService } from '../../aws/__mocks__/aws-sts.service.mock';
import { S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';
import { mockOaDocumentService } from '../../oa-document/__mocks__/oa-document.service.mock';
import { OaDocumentService } from '../../oa-document/oa-document.service';
import {
  agencyInfo,
  copyModeFileUploadDetails,
  copyModeReqFile,
  copyModeTxnFile,
  filesUploadRequest,
  jwtPayloadInRequest,
  mockRedisFileUploadInfo,
  oaFileUploadDetails,
  oaReqFile,
  oaTxnFile,
  s3Client,
  TestFileUploadService,
  transferFileToStgBucketError,
  transferFileToStgBucketSuccess,
  uploadModeFileUploadDetails,
  uploadModeReqFile,
  uploadModeTxnFile,
} from '../__mocks__/file-upload.service.mock';

describe('FileUploadService', () => {
  let service: TestFileUploadService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFileUploadService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: SqsService, useValue: mockSqsService },
        { provide: StsService, useValue: mockStsService },
        { provide: OaDocumentService, useValue: mockOaDocumentService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: MGMT_SERVICE_API_CLIENT_PROVIDER, useValue: mockMgmtServiceApiClient },
      ],
    }).compile();

    service = module.get<TestFileUploadService>(TestFileUploadService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('fileUpload', () => {
    beforeEach(() => {
      jest.spyOn(service, 'decryptSigningKey').mockReturnValue('randomSk');
      jest.spyOn(service, 'verifyS3FileExistence').mockResolvedValue();
      jest.spyOn(service, 'verifyAndReconcileTxnFileAndReqFile').mockResolvedValue([oaFileUploadDetails, uploadModeFileUploadDetails]);
      jest.spyOn(service, 'verifyChecksum').mockReturnValue();
      jest.spyOn(service, 'verifyMimeType').mockReturnValue();
      jest.spyOn(service, 'verifyValidSize').mockReturnValue();
      jest.spyOn(service, 'sqsFileAssetInfosMapper').mockReturnValue({
        fileAssetId: 'fileAssetId',
        fileName: 'fileName',
        fileType: FILE_TYPE.PDF,
        size: 1000,
        isPasswordEncryptionRequired: false,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
      jest.restoreAllMocks();
    });

    it('UnauthorizedRequestException should be thrown where there is no file session', async () => {
      mockMgmtServiceApiClient.get.mockResolvedValueOnce({ data: null });

      await expect(service.fileUpload(filesUploadRequest, jwtPayloadInRequest)).rejects.toThrowError(UnauthorizedRequestException);
    });

    it('FilesFailedToUploadException should be thrown where there is any upload error', async () => {
      mockMgmtServiceApiClient.get.mockResolvedValueOnce({ data: mockRedisFileUploadInfo });
      jest
        .spyOn(service, 'transferFileToStgBucket')
        .mockRejectedValueOnce(transferFileToStgBucketError)
        .mockResolvedValueOnce(transferFileToStgBucketSuccess);

      await expect(service.fileUpload(filesUploadRequest, jwtPayloadInRequest)).rejects.toThrowError(FilesFailedToUploadException);
      // deleteFilesFromStgBucket should be called once as 1 of the upload is successful
      expect(mockS3Service.deleteFilesFromStgBucket).toBeCalledTimes(1);
      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith({
        event: EVENT.FILES_UPLOAD_TO_STG_FAILED,
        payload: {
          failedFiles: [
            {
              fileAssetId: transferFileToStgBucketError.s3TransferError.fileName,
              failedReason: transferFileToStgBucketError.s3TransferError.awsErrorResponse,
            },
          ],
          transactionId: jwtPayloadInRequest.transactionUuid,
        },
      });
    });

    it('should upload file successfully', async () => {
      mockMgmtServiceApiClient.get.mockResolvedValueOnce({ data: mockRedisFileUploadInfo });
      jest.spyOn(service, 'transferFileToStgBucket').mockResolvedValue(transferFileToStgBucketSuccess);

      await expect(service.fileUpload(filesUploadRequest, jwtPayloadInRequest)).resolves.not.toThrow();
      expect(mockSqsService.sendMessageToQueueCoreEvents).toBeCalledWith({
        event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED,
        payload: {
          transactionId: jwtPayloadInRequest.transactionUuid,
          fileAssetInfos: [
            {
              fileAssetId: 'fileAssetId',
              fileName: 'fileName',
              fileType: FILE_TYPE.PDF,
              size: 1000,
              isPasswordEncryptionRequired: false,
            },
            {
              fileAssetId: 'fileAssetId',
              fileName: 'fileName',
              fileType: FILE_TYPE.PDF,
              size: 1000,
              isPasswordEncryptionRequired: false,
            },
          ],
        },
      });
    });
  });

  describe('verifyAndReconcileTxnFileAndReqFile', () => {
    beforeAll(() => {
      jest.spyOn(service, 'reconcileOaFile').mockImplementation(async () => oaFileUploadDetails);
      jest.spyOn(service, 'reconcileUploadModeFile').mockImplementation(async () => uploadModeFileUploadDetails);
      jest.spyOn(service, 'reconcileCopyModeFile').mockImplementation(async () => copyModeFileUploadDetails);
    });

    afterAll(() => {
      jest.restoreAllMocks();
    });

    it('DuplicateFileNameException should be thrown when there are duplicated filename in reqFiles', async () => {
      const reqFiles: File[] = [oaReqFile, oaReqFile, uploadModeReqFile];
      const txnFiles: FileInfo[] = [oaTxnFile, oaTxnFile, uploadModeTxnFile];

      await expect(service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client)).rejects.toThrowError(
        DuplicateFileNameException,
      );
    });

    it('UploadFileMismatchException should be thrown where there are missing file in reqFiles', async () => {
      const reqFiles: File[] = [oaReqFile];
      const txnFiles: FileInfo[] = [oaTxnFile, uploadModeTxnFile];

      await expect(service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client)).rejects.toThrowError(
        UploadFileMismatchException,
      );
    });

    it('UploadFileMismatchException should be thrown where there are additional file in reqFiles', async () => {
      const reqFiles: File[] = [oaReqFile, uploadModeReqFile];
      const txnFiles: FileInfo[] = [oaTxnFile];

      await expect(service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client)).rejects.toThrowError(
        UploadFileMismatchException,
      );
    });

    it('only reconcileOaFile should be called if there is only file with isOA true', async () => {
      const reqFiles: File[] = [oaReqFile];
      const txnFiles: FileInfo[] = [oaTxnFile];

      await service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client);

      expect(service.reconcileOaFile).toBeCalledTimes(1);
      expect(service.reconcileUploadModeFile).toBeCalledTimes(0);
      expect(service.reconcileCopyModeFile).toBeCalledTimes(0);
    });

    it('only reconcileOaFile should be called if there is only file with fileData and isOA false', async () => {
      const reqFiles: File[] = [uploadModeReqFile];
      const txnFiles: FileInfo[] = [uploadModeTxnFile];

      await service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client);

      expect(service.reconcileOaFile).toBeCalledTimes(0);
      expect(service.reconcileUploadModeFile).toBeCalledTimes(1);
      expect(service.reconcileCopyModeFile).toBeCalledTimes(0);
    });

    it('only reconcileOaFile should be called if there is only file with s3FileData', async () => {
      const reqFiles: File[] = [copyModeReqFile];
      const txnFiles: FileInfo[] = [copyModeTxnFile];

      await service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client);

      expect(service.reconcileOaFile).toBeCalledTimes(0);
      expect(service.reconcileUploadModeFile).toBeCalledTimes(0);
      expect(service.reconcileCopyModeFile).toBeCalledTimes(1);
    });

    it('corresponding reconcile methods should be called based on the inputs', async () => {
      const reqFiles: File[] = [copyModeReqFile, oaReqFile, uploadModeReqFile, { ...copyModeReqFile, fileName: 'random.pdf' }];
      const txnFiles: FileInfo[] = [copyModeTxnFile, oaTxnFile, uploadModeTxnFile, { ...copyModeTxnFile, name: 'random.pdf' }];

      await service.verifyAndReconcileTxnFileAndReqFile(reqFiles, txnFiles, agencyInfo, s3Client);

      expect(service.reconcileOaFile).toBeCalledTimes(1);
      expect(service.reconcileUploadModeFile).toBeCalledTimes(1);
      expect(service.reconcileCopyModeFile).toBeCalledTimes(2);
    });
  });

  describe('reconcileOaFile', () => {
    it('uploaded data and txn data should be transformed correctly', async () => {
      mockOaDocumentService.createOADocument.mockResolvedValueOnce({
        signedDocument: {
          signature: {
            targetHash: 'this-is-obviously-not-a-hash',
          },
        },
        oaCertificateId: 'random-oa-certificate-id',
      });
      await expect(service.reconcileOaFile(oaReqFile, oaTxnFile, agencyInfo)).resolves.toEqual(oaFileUploadDetails);
    });
  });

  describe('reconcileUploadModeFile', () => {
    it('uploaded data and txn data should be transformed correctly', async () => {
      await expect(service.reconcileUploadModeFile(uploadModeReqFile, uploadModeTxnFile)).resolves.toEqual(uploadModeFileUploadDetails);
    });
  });

  describe('reconcileCopyModeFile', () => {
    it('uploaded data and txn data should be tranformed correctly', async () => {
      mockS3Service.getFileMetadata.mockResolvedValueOnce({
        mimeType: copyModeFileUploadDetails.mimeType,
        sizeInBytes: copyModeFileUploadDetails.size,
        checksum: copyModeFileUploadDetails.generatedChecksum,
      });

      await expect(service.reconcileCopyModeFile(copyModeReqFile, copyModeTxnFile, s3Client)).resolves.toEqual(copyModeFileUploadDetails);
    });
  });

  describe('verifyS3FileExistence', () => {
    it('MissingS3FileException should be thrown when awsS3Service.checkForMissingFilesInS3 returns non-empty array', async () => {
      mockS3Service.checkForMissingFilesInS3.mockResolvedValueOnce(['helloWorld.pdf']);
      const input: File[] = [copyModeReqFile];

      await expect(service.verifyS3FileExistence(input, s3Client)).rejects.toThrowError(MissingS3FileException);
      expect(mockS3Service.checkForMissingFilesInS3).toBeCalledWith(
        [
          {
            bucketName: input[0].s3FileData?.bucketName,
            key: input[0].s3FileData?.key,
            getChecksum: false,
          },
        ],
        s3Client,
      );
    });

    it('error should not be throw when awsS3Service.checkForMissingFilesInS3 returns empty array', async () => {
      mockS3Service.checkForMissingFilesInS3.mockResolvedValueOnce([]);
      const input: File[] = [
        {
          fileName: 'helloWorld.pdf',
          isOA: false,
          s3FileData: {
            bucketName: 'dummy-s3-bucket',
            key: 'dummy-s3-key',
          },
        },
      ];

      await expect(service.verifyS3FileExistence(input, s3Client)).resolves.not.toThrowError(MissingS3FileException);
      expect(mockS3Service.checkForMissingFilesInS3).toBeCalledWith(
        [
          {
            bucketName: input[0].s3FileData?.bucketName,
            key: input[0].s3FileData?.key,
            getChecksum: false,
          },
        ],
        s3Client,
      );
    });
  });

  describe('verifyChecksum', () => {
    it('InvalidChecksumException should be thrown when any files has mismatched checksum', () => {
      expect(() =>
        service.verifyChecksum([
          oaFileUploadDetails,
          uploadModeFileUploadDetails,
          copyModeFileUploadDetails,
          {
            ...uploadModeFileUploadDetails,
            expectedChecksum: 'wrong-checksum',
          },
        ]),
      ).toThrowError(InvalidChecksumException);
    });

    it('no error should be thrown if all checksum matched', () => {
      expect(() => service.verifyChecksum([oaFileUploadDetails, uploadModeFileUploadDetails, copyModeFileUploadDetails])).not.toThrowError(
        InvalidChecksumException,
      );
    });
  });

  describe('verifyMimeType', () => {
    it('OA type should always pass without mimeType', () => {
      // ensure that oaFileUploadDetails has no mimeType property
      expect((oaFileUploadDetails as any).mimeType).toBeUndefined();
      expect(() => service.verifyMimeType([oaFileUploadDetails])).not.toThrow();
    });

    it('valid mimetypes should not throw exception', () => {
      expect(() =>
        service.verifyMimeType([
          oaFileUploadDetails,
          uploadModeFileUploadDetails,
          copyModeFileUploadDetails,
          {
            ...uploadModeFileUploadDetails,
            mimeType: 'image/jpeg',
          },
          {
            ...uploadModeFileUploadDetails,
            mimeType: 'image/png',
          },
        ]),
      ).not.toThrow();
    });

    it('any invalid mimetype should throw UnsupportFileTypeException', () => {
      expect(() =>
        service.verifyMimeType([
          oaFileUploadDetails,
          uploadModeFileUploadDetails,
          copyModeFileUploadDetails,
          {
            ...uploadModeFileUploadDetails,
            mimeType: 'video/ogg',
          },
        ]),
      ).toThrowError(UnsupportedFileTypeException);
    });
  });

  describe('verifyValidSize', () => {
    it('no error should be thrown if all sizes are > 0', () => {
      expect(() => service.verifyValidSize([oaFileUploadDetails, uploadModeFileUploadDetails, copyModeFileUploadDetails])).not.toThrow();
    });

    it('FileSizeException should be thrown if any size is = 0', () => {
      expect(() =>
        service.verifyValidSize([
          oaFileUploadDetails,
          uploadModeFileUploadDetails,
          {
            ...copyModeFileUploadDetails,
            size: 0,
          },
        ]),
      ).toThrowError(FileSizeException);
    });

    it('FileSizeException should be thrown if any size is < 0', () => {
      expect(() =>
        service.verifyValidSize([
          oaFileUploadDetails,
          uploadModeFileUploadDetails,
          {
            ...copyModeFileUploadDetails,
            size: -1,
          },
        ]),
      ).toThrowError(FileSizeException);
    });
  });

  describe('transferFileToStgBucket', () => {
    it('uploadFileToStgBucket should be called when is OA type', async () => {
      await service.transferFileToStgBucket(oaFileUploadDetails, s3Client);

      expect(mockS3Service.uploadFileToStgBucket).toBeCalledWith(
        {
          Body: oaFileUploadDetails.buffer,
          Key: oaFileUploadDetails.fileAssetId,
          ContentType: MIME_TYPE.OA,
        },
        s3Client,
      );
      expect(mockS3Service.copyFileToStgBucket).toBeCalledTimes(0);
    });

    it('uploadFileToStgBucket should be called when it is upload mode', async () => {
      await service.transferFileToStgBucket(uploadModeFileUploadDetails, s3Client);

      expect(mockS3Service.uploadFileToStgBucket).toBeCalledWith(
        {
          Body: uploadModeFileUploadDetails.buffer,
          Key: uploadModeFileUploadDetails.fileAssetId,
          ContentType: uploadModeFileUploadDetails.mimeType,
        },
        s3Client,
      );
      expect(mockS3Service.copyFileToStgBucket).toBeCalledTimes(0);
    });

    it('copyFileToStgBucket should be called when it is copy mode', async () => {
      await service.transferFileToStgBucket(copyModeFileUploadDetails, s3Client);

      expect(mockS3Service.copyFileToStgBucket).toBeCalledWith(
        copyModeFileUploadDetails.fromBucket,
        copyModeFileUploadDetails.fromKey,
        copyModeFileUploadDetails.fileAssetId,
        s3Client,
      );
      expect(mockS3Service.uploadFileToStgBucket).toBeCalledTimes(0);
    });

    it('aws upload or copy errors should be consolidated into S3TransferException', async () => {
      mockS3Service.uploadFileToStgBucket.mockRejectedValue(
        new AWSS3UploadException(COMPONENT_ERROR_CODE.S3_SERVICE, { fileName: '', bucketName: '', awsErrorResponse: '' }),
      );
      mockS3Service.copyFileToStgBucket.mockRejectedValue(new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, ''));

      await expect(service.transferFileToStgBucket(oaFileUploadDetails, s3Client)).rejects.toThrowError(S3TransferException);
      await expect(service.transferFileToStgBucket(uploadModeFileUploadDetails, s3Client)).rejects.toThrowError(S3TransferException);
      await expect(service.transferFileToStgBucket(copyModeFileUploadDetails, s3Client)).rejects.toThrowError(S3TransferException);
    });
  });

  describe('sqsFileAssetInfosMapper', () => {
    it('oa type, should return all the required properties and oaCertificateHash transformation', () => {
      expect(service.sqsFileAssetInfosMapper(oaFileUploadDetails)).toEqual({
        fileAssetId: oaFileUploadDetails.fileAssetId,
        fileName: oaFileUploadDetails.name,
        fileType: FILE_TYPE.OA,
        size: oaFileUploadDetails.size,
        oaCertificateId: oaFileUploadDetails.oaCertificateId,
        oaCertificateHash: `0x${oaFileUploadDetails.oaCertificateHash}`,
        isPasswordEncryptionRequired: oaFileUploadDetails.isPasswordEncryptionRequired,
      });
    });

    it('upload mode, should return all the required properties', () => {
      expect(service.sqsFileAssetInfosMapper(uploadModeFileUploadDetails)).toEqual({
        fileAssetId: uploadModeFileUploadDetails.fileAssetId,
        fileName: uploadModeFileUploadDetails.name,
        fileType: getFileTypeFromMimeType(uploadModeFileUploadDetails.mimeType!),
        size: uploadModeFileUploadDetails.size,
        isPasswordEncryptionRequired: uploadModeFileUploadDetails.isPasswordEncryptionRequired,
      });
    });

    it('upload mode, should return all the required properties', () => {
      expect(service.sqsFileAssetInfosMapper(copyModeFileUploadDetails)).toEqual({
        fileAssetId: copyModeFileUploadDetails.fileAssetId,
        fileName: copyModeFileUploadDetails.name,
        fileType: getFileTypeFromMimeType(copyModeFileUploadDetails.mimeType!),
        size: copyModeFileUploadDetails.size,
        isPasswordEncryptionRequired: copyModeFileUploadDetails.isPasswordEncryptionRequired,
      });
    });
  });

  describe('appendToOaCertificateHash', () => {
    it('0x should be appended to the input string', () => {
      const input = 'thisIsAInput';

      expect(service.appendToOaCertificateHash(input)).toEqual(`0x${input}`);
    });
  });
});
