import { FsHelper } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { UnzipService } from '@filesg/zipper';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import FileType from 'file-type';
import fs from 'fs';
import { cloneDeep } from 'lodash';

import {
  CreateTransactionException,
  ExtraFileException,
  InvalidFilePathFormatAgencyPasswordException,
  ProcessMessageErrorException,
  RequestTimeoutException,
  UnsupportedFileTypeException,
  UploadTransactionFilesException,
} from '../../../../common/custom-exceptions';
import { ExtraFileAgencyPasswordException } from '../../../../common/custom-exceptions';
import { DuplicateEntryAgencyPasswordException } from '../../../../common/custom-exceptions';
import { CORE_API_CLIENT_PROVIDER, SIDECAR_FILES_INFO, TRANSFER_API_CLIENT_PROVIDER } from '../../../../const';
import { mockCoreServiceApiClient, mockTransferServiceApiClient } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockS3Service } from '../../aws/__mocks__/aws-s3.service.mock';
import { mockMessageId, mockMsgReceiptHandle, mockSqsService } from '../../aws/__mocks__/aws-sqs.service.mock';
import { S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { mockSliftService } from '../../slift/__mocks__/slift.service.mock';
import { SliftService } from '../../slift/slift.service';
import {
  mockCreateTransactionPayload,
  mockCreateTransactionResponse,
  mockFilePath,
  mockFileTypeResult,
  mockJwt,
  mockLambdaSqsMessage,
  mockPaths,
  mockS3Key,
  TestSftpProcessorService,
} from '../__mocks__/sftp-processor.service.mock';
import { mockSidecarData, mockSidecarFileService, mockUnzipService } from '../__mocks__/sidecar-file.service.mock';
import { SidecarFileService } from '../sidecar-file.service';

describe('SftpProcessorService', () => {
  let service: TestSftpProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSftpProcessorService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: SqsService, useValue: mockSqsService },
        { provide: SidecarFileService, useValue: mockSidecarFileService },
        { provide: UnzipService, useValue: mockUnzipService },
        { provide: SliftService, useValue: mockSliftService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: CORE_API_CLIENT_PROVIDER, useValue: mockCoreServiceApiClient },
        { provide: TRANSFER_API_CLIENT_PROVIDER, useValue: mockTransferServiceApiClient },
      ],
    }).compile();

    service = module.get<TestSftpProcessorService>(TestSftpProcessorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('run', () => {
    it('ProcessMessageErrorException should be thrown when body is empty', async () => {
      await expect(service.run({ ...mockLambdaSqsMessage, body: '' })).rejects.toThrowError(ProcessMessageErrorException);
    });

    it('ProcessMessageErrorException should be thrown when body cannot be parsed', async () => {
      await expect(service.run({ ...mockLambdaSqsMessage, body: 'non json body' })).rejects.toThrowError(ProcessMessageErrorException);
    });

    it('ProcessMessageErrorException should be thrown when there are no record', async () => {
      await expect(service.run({ ...mockLambdaSqsMessage, body: '{"Records":[]}' })).rejects.toThrowError(ProcessMessageErrorException);
    });

    it('errorHandler should not be called where there is no processing error', async () => {
      jest.spyOn(service, 'generateFilePaths').mockReturnValue(mockPaths('mock-uuid'));
      jest.spyOn(service, 'preProcess').mockImplementation();
      jest.spyOn(service, 'parseAndValidateCsv').mockResolvedValue(mockSidecarData);
      jest.spyOn(service, 'process').mockImplementation();
      jest.spyOn(service, 'postProcess').mockImplementation();
      jest.spyOn(service, 'errorHandler').mockImplementation();
      jest.spyOn(service, 'clean').mockImplementation();

      await expect(service.run(mockLambdaSqsMessage)).resolves.not.toThrow();
      expect(service.errorHandler).toBeCalledTimes(0);
      expect(service.clean).toBeCalledTimes(1);
    });

    it('errorHandler and clean should be called where there is processing error', async () => {
      jest.spyOn(service, 'generateFilePaths').mockReturnValue(mockPaths('mock-uuid'));
      jest.spyOn(service, 'preProcess').mockImplementation();
      jest.spyOn(service, 'parseAndValidateCsv').mockResolvedValue(mockSidecarData);
      jest.spyOn(service, 'process').mockImplementation(() => {
        throw new Error();
      });
      jest.spyOn(service, 'postProcess').mockImplementation();
      jest.spyOn(service, 'errorHandler').mockImplementation();
      jest.spyOn(service, 'clean').mockImplementation();

      await expect(service.run(mockLambdaSqsMessage)).resolves.not.toThrow();
      expect(service.errorHandler).toBeCalledTimes(1);
      expect(service.clean).toBeCalledTimes(1);
    });
  });

  describe('preProcess', () => {
    it('the underlying methods are called with correct args', async () => {
      const paths = mockPaths('mock-uuid');

      jest.spyOn(FsHelper, 'createDir').mockImplementation();
      jest.spyOn(FsHelper, 'rmFile').mockImplementation();
      jest.spyOn(fs, 'createReadStream').mockImplementation();

      await service.preProcess(paths);
      expect(FsHelper.createDir).toBeCalledWith(paths.localWorkingDir);
      expect(mockSliftService.init).toBeCalledWith(paths.localWorkingDir);
      expect(mockS3Service.downloadFileFromSftpBucketToDisk).toBeCalledWith(paths.s3Key, paths.encryptedZip);
      expect(mockSliftService.decrypt).toBeCalledWith(paths.encryptedZip, paths.plainZip);
      expect(FsHelper.rmFile).toBeCalledWith(paths.encryptedZip);
      expect(mockUnzipService.unzipToDisk).toBeCalledTimes(1);
    });
  });

  describe('parseAndValidateCsv', () => {
    it('the underlying methods are called with correct args', async () => {
      const paths = mockPaths('mock-uuid');

      mockSidecarFileService.parseSidecarFiles.mockResolvedValueOnce(mockSidecarData);
      jest.spyOn(service, 'checkForMissingIssuanceFiles').mockImplementation();
      jest.spyOn(service, 'checkForExtraIssuanceFiles').mockImplementation();
      jest.spyOn(service, 'detectAndPopulateMimeType').mockImplementation();
      jest.spyOn(service, 'validateFilePathInsideAgencyPasswordSidecar').mockImplementation();

      await expect(service.parseAndValidateCsv(paths)).resolves.toEqual(mockSidecarData);
      expect(mockSidecarFileService.checkSidecarFilesExistsOrThrow).toBeCalledWith(paths.extractedZipDir);
      expect(mockSidecarFileService.parseSidecarFiles).toBeCalledWith(paths.extractedZipDir);
      expect(service.checkForMissingIssuanceFiles).toBeCalledWith(paths, mockSidecarData);
      expect(service.checkForExtraIssuanceFiles).toBeCalledWith(paths, mockSidecarData);
      expect(service.detectAndPopulateMimeType).toBeCalledWith(paths, mockSidecarData);
      expect(service.validateFilePathInsideAgencyPasswordSidecar).toBeCalledWith(paths, mockSidecarData);
    });
  });

  describe('process', () => {
    it('the underlying methods are called with correct args', async () => {
      const paths = mockPaths('mock-uuid');

      jest.spyOn(service, 'createTransaction').mockResolvedValueOnce(mockCreateTransactionResponse);
      jest.spyOn(service, 'uploadTransactionFiles').mockImplementation();
      jest.spyOn(fs, 'createReadStream').mockImplementation();

      await service.process(paths, mockSidecarData);

      // unable to test with toBeCalledWith due to ReadStream
      expect(mockS3Service.uploadFilesToSftpBucket).toBeCalledTimes(1);
      expect(service.createTransaction).toBeCalledWith(mockSidecarData);
      expect(service.uploadTransactionFiles).toBeCalledWith(mockJwt, mockSidecarData, paths.s3WorkingDir);
    });
  });

  describe('postProcess', () => {
    it('deleteFileFromSftpBucket and deleteMessageInQueueSftpProcessor should be called with correct args', async () => {
      const paths = mockPaths('mock-uuid');

      await service.postProcess(paths, mockLambdaSqsMessage);

      expect(mockS3Service.deleteFileFromSftpBucket).toBeCalledWith(paths.s3Key);
      expect(mockSqsService.deleteMessageInQueueSftpProcessor).toBeCalledWith(
        mockLambdaSqsMessage.messageId,
        mockLambdaSqsMessage.receiptHandle,
      );
    });
  });

  describe('clean', () => {
    it('rmDir and deleteFilesByPrefixFromSftpBucket should be called with correct args', async () => {
      const paths = mockPaths('mock-uuid');

      jest.spyOn(FsHelper, 'rmDir').mockResolvedValueOnce(undefined);
      mockS3Service.deleteFilesByPrefixFromSftpBucket.mockResolvedValueOnce(undefined);

      await service.clean(paths);

      expect(FsHelper.rmDir).toBeCalledWith(paths.localWorkingDir);
      expect(mockS3Service.deleteFilesByPrefixFromSftpBucket).toBeCalledWith(paths.s3WorkingDir);
    });
  });

  describe('generateFilePaths', () => {
    it('file paths should be generated correctly', () => {
      const generatedPaths = service.generateFilePaths(mockS3Key);
      const generatedUuid = generatedPaths.processUuid;

      expect(generatedPaths).toEqual(mockPaths(generatedUuid));
    });
  });

  describe('deriveFilenames', () => {
    it('filename should be derived correctly', () => {
      const paths = mockPaths('mock-uuid');

      expect(service.deriveFilenames(mockS3Key)).toEqual({
        encryptedFileName: paths.encryptedFileName,
        plainFileName: paths.plainFileName,
      });
    });
  });

  describe('checkForMissingIssuanceFiles', () => {
    it('no exception should be thrown if there are no missing issuance files', async () => {
      const paths = mockPaths('mock-uuid');

      jest.spyOn(FsHelper, 'checkForMissingFilesInDir').mockResolvedValueOnce([]);

      await expect(service.checkForMissingIssuanceFiles(paths, mockSidecarData)).resolves.not.toThrow();
    });

    it('MissingFileException should be throw if there are any missing file', async () => {
      const paths = mockPaths('mock-uuid');

      jest.spyOn(FsHelper, 'checkForMissingFilesInDir').mockResolvedValueOnce(['mock-missing-file.pdf']);

      await expect(service.checkForMissingIssuanceFiles(paths, mockSidecarData)).rejects.toThrow();
    });
  });

  describe('checkForExtraIssuanceFiles', () => {
    it('no exception should be thrown if there are no extra files', async () => {
      const paths = mockPaths('mock-uuid');

      jest
        .spyOn(FsHelper, 'listDirContent')
        .mockResolvedValueOnce([...mockSidecarData.files.map((file) => file.name), ...SIDECAR_FILES_INFO.map((info) => info.name)]);

      await expect(service.checkForExtraIssuanceFiles(paths, mockSidecarData)).resolves.not.toThrow();
    });

    it('ExtraFileException should be thrown if there are extra files', async () => {
      const paths = mockPaths('mock-uuid');

      jest
        .spyOn(FsHelper, 'listDirContent')
        .mockResolvedValueOnce([
          ...mockSidecarData.files.map((file) => file.name),
          ...SIDECAR_FILES_INFO.map((info) => info.name),
          'extra-mock-file.pdf',
        ]);

      await expect(service.checkForExtraIssuanceFiles(paths, mockSidecarData)).rejects.toThrowError(ExtraFileException);
    });
  });

  describe('detectAndPopulateMimeType', () => {
    it('mimeType should be populated correctly', async () => {
      const paths = mockPaths('mock-uuid');
      const clonedMockSidecarData = cloneDeep(mockSidecarData);

      jest.spyOn(FileType, 'fromFile').mockResolvedValue(mockFileTypeResult);

      await expect(service.detectAndPopulateMimeType(paths, clonedMockSidecarData)).resolves.not.toThrow();
      expect(clonedMockSidecarData.files[0].mimeType).toEqual('application/pdf');
      expect(clonedMockSidecarData.files[1].mimeType).toEqual('application/pdf');
    });

    it('UnsupportedFileTypeException should be thrown if mimeType cannot be detected', async () => {
      const paths = mockPaths('mock-uuid');
      const clonedMockSidecarData = cloneDeep(mockSidecarData);

      jest.spyOn(FileType, 'fromFile').mockResolvedValue(undefined);

      await expect(service.detectAndPopulateMimeType(paths, clonedMockSidecarData)).rejects.toThrowError(UnsupportedFileTypeException);
    });

    it('UnsupportedFileTypeException should be thrown if mimeType is unsupported', async () => {
      const paths = mockPaths('mock-uuid');
      const clonedMockSidecarData = cloneDeep(mockSidecarData);

      jest.spyOn(FileType, 'fromFile').mockResolvedValue({ ext: 'mp4', mime: 'video/mp4' });

      await expect(service.detectAndPopulateMimeType(paths, clonedMockSidecarData)).rejects.toThrowError(UnsupportedFileTypeException);
    });
  });

  describe('validateFilePathInsideAgencyPasswordSidecar', () => {
    it('should throw error if the agency password sidecar file has record and not a corresponding physical file', async () => {
      const paths = mockPaths('mock-uuid');
      const clonedMockSidecarData = cloneDeep(mockSidecarData);
      clonedMockSidecarData.agencyPassword = [{ filePath: 'non-existing-file.zip/folder/filename.pdf', password: 'P@ssw0rd' }];
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      expect(service.validateFilePathInsideAgencyPasswordSidecar(paths, clonedMockSidecarData)).rejects.toThrowError(
        ExtraFileAgencyPasswordException,
      );
    });

    it('should throw error if the agency password sidecar filepath has invalid paths', async () => {
      const paths = mockPaths('mock-uuid');
      const clonedMockSidecarData = cloneDeep(mockSidecarData);
      clonedMockSidecarData.agencyPassword = [
        { filePath: 'existing-file.zip/folder/', password: 'P@ssw0rd' },
        { filePath: 'existing-file.zip', password: 'P@ssw0rd' },
      ];
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      expect(service.validateFilePathInsideAgencyPasswordSidecar(paths, clonedMockSidecarData)).rejects.toThrowError(
        InvalidFilePathFormatAgencyPasswordException,
      );
    });

    it('should throw error if the agency password sidecar filepath has duplicate entry', async () => {
      const paths = mockPaths('mock-uuid');
      const clonedMockSidecarData = cloneDeep(mockSidecarData);
      clonedMockSidecarData.agencyPassword = [
        { filePath: 'existing-file.zip/folder/filename.pdf', password: 'P@ssw0rd' },
        { filePath: 'existing-file.zip/folder/filename.pdf', password: 'P@ssw0rd' },
      ];
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      expect(service.validateFilePathInsideAgencyPasswordSidecar(paths, clonedMockSidecarData)).rejects.toThrowError(
        DuplicateEntryAgencyPasswordException,
      );
    });
  });

  describe('createTransaction', () => {
    it('coreServiceClient is called with correct args', async () => {
      mockCoreServiceApiClient.post.mockResolvedValueOnce({ data: { data: mockCreateTransactionResponse } });
      jest.spyOn(service, 'getCreateTransactionPayload').mockReturnValue(mockCreateTransactionPayload);

      await expect(service.createTransaction(mockSidecarData)).resolves.toEqual(mockCreateTransactionResponse);
      expect(mockCoreServiceApiClient.post).toBeCalledWith('v2/transaction/file/client', mockCreateTransactionPayload, {
        headers: {
          'x-client-id': mockSidecarData.transactions[0].clientId,
          'x-client-secret': mockSidecarData.transactions[0].clientSecret,
        },
      });
    });

    it('CreateTransactionException should be thrown when api throws error', async () => {
      mockCoreServiceApiClient.post.mockRejectedValueOnce({ originErrorMsg: 'originErrorMsg', response: { data: 'errorData' } });

      await expect(service.createTransaction(mockSidecarData)).rejects.toThrowError(CreateTransactionException);
    });

    it('should throw RequestTimeoutException when api return status of 408', async () => {
      mockCoreServiceApiClient.post.mockRejectedValueOnce({
        originErrorMsg: 'originErrorMsg',
        response: { data: 'errorData', status: HttpStatus.REQUEST_TIMEOUT },
      });

      await expect(service.createTransaction(mockSidecarData)).rejects.toThrowError(RequestTimeoutException);
    });
  });

  describe('uploadTransactionFiles', () => {
    it('transferServiceClient is called with correct args', async () => {
      const paths = mockPaths('mock-uuid');
      const mockUploadTransactionFilesPayload = { files: [] };

      mockTransferServiceApiClient.post.mockResolvedValueOnce('mock return');
      jest.spyOn(service, 'getUploadTransactionFilesPayload').mockReturnValue(mockUploadTransactionFilesPayload);

      await expect(service.uploadTransactionFiles(mockJwt, mockSidecarData, paths.s3WorkingDir)).resolves.toEqual('mock return');
      expect(mockTransferServiceApiClient.post).toBeCalledWith('v1/file-upload', mockUploadTransactionFilesPayload, {
        headers: {
          Authorization: `Bearer ${mockJwt}`,
        },
      });
    });

    it('UploadTransactionFilesException should be thrown when api throws error', async () => {
      mockTransferServiceApiClient.post.mockRejectedValueOnce({ originErrorMsg: 'originErrorMsg', response: { data: 'errorData' } });

      const paths = mockPaths('mock-uuid');

      await expect(service.uploadTransactionFiles('mockJwt', mockSidecarData, paths.s3WorkingDir)).rejects.toThrow(
        UploadTransactionFilesException,
      );
    });

    it('should throw RequestTimeoutException when api return status of 408', async () => {
      mockTransferServiceApiClient.post.mockRejectedValueOnce({
        originErrorMsg: 'originErrorMsg',
        response: { data: 'errorData', status: HttpStatus.REQUEST_TIMEOUT },
      });

      const paths = mockPaths('mock-uuid');

      await expect(service.uploadTransactionFiles('mockJwt', mockSidecarData, paths.s3WorkingDir)).rejects.toThrow(RequestTimeoutException);
    });
  });

  describe('getCreateTransactionPayload', () => {
    it('data should be transformed correctly', () => {
      // using snapshot as the output is long
      expect(service.getCreateTransactionPayload(mockSidecarData)).toMatchSnapshot();
    });
  });

  describe('getUploadTransactionFilesPayload', () => {
    it('data should be transformed correctly', () => {
      const paths = mockPaths('mock-uuid');
      const { s3SftpBucket } = mockFileSGConfigService.awsConfig;

      expect(service.getUploadTransactionFilesPayload(mockSidecarData, paths.s3WorkingDir)).toEqual({
        files: [
          {
            fileName: mockSidecarData.files[0].name,
            isOA: false,
            s3FileData: {
              bucketName: s3SftpBucket,
              key: `${paths.s3WorkingDir}/${mockSidecarData.files[0].name}`,
            },
          },
          {
            fileName: mockSidecarData.files[1].name,
            isOA: false,
            s3FileData: {
              bucketName: s3SftpBucket,
              key: `${paths.s3WorkingDir}/${mockSidecarData.files[1].name}`,
            },
          },
        ],
      });
    });
  });

  describe('errorHandler', () => {
    it('deleteMessageInQueueSftpProcessor shoud not be called if error is retryable', () => {
      service.errorHandler(
        new ProcessMessageErrorException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, 'dummy'),
        mockFilePath,
        mockMessageId,
        mockMsgReceiptHandle,
      );

      expect(mockSqsService.deleteMessageInQueueSftpProcessor).toBeCalledTimes(0);
    });

    it('deleteMessageInQueueSftpProcessor shoud be called if error is not retryable', () => {
      service.errorHandler(
        new ExtraFileException(COMPONENT_ERROR_CODE.SFTP_PROCESSOR_SERVICE, ['mock-extra-file.pdf']),
        mockFilePath,
        mockMessageId,
        mockMsgReceiptHandle,
      );

      expect(mockSqsService.deleteMessageInQueueSftpProcessor).toBeCalledTimes(1);
    });
  });
});
