/* eslint-disable sonarjs/no-duplicate-string */
import { AWSException, AWSHttpException, LambdaService, MoveFilesFailureException, S3Service as BaseS3Service } from '@filesg/aws';
import { DocumentEncryptionErrorOutput, DocumentEncryptionInput, DocumentEncryptionSuccessOutput } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import generatePassword from 'generate-password';

import { DeleteCopiedFilesErrorException } from '../../../../common/custom-exceptions';
import { DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER } from '../../../../typings/common';
import { docEncryptionPasswordEncryptionTransformer } from '../../../../utils/encryption';
import { mockDocEncryptionLambdaApiClient } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { s3Client } from '../../file-upload/__mocks__/file-upload.service.mock';
import { mockLambdaService } from '../__mocks__/aws-lambda.service.mock';
import {
  mockAssumeUploadMoveRole,
  mockBaseS3Service,
  mockCredentials,
  mockEncryptedPassword,
  mockFileAssetUuidToNewSizeMap,
  mockFileEncryptionPassword,
  mockFileSize,
  mockFromBucket,
  mockHeadObjectInput,
  mockKey,
  mockKeys,
  mockS3Client,
  mockToBucket,
  mockTransferFiles,
  mockUploadFileInput,
} from '../__mocks__/aws-s3.service.mock';
import { DocEncryptionLambdaException, S3Service } from '../s3.service';

const objectToUint8Array = (obj: Record<string, any>) => {
  const outputString = JSON.stringify(obj);
  const encoder = new TextEncoder();
  const data = encoder.encode(outputString);
  return new Uint8Array(data);
};

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3Service,
        { provide: BaseS3Service, useValue: mockBaseS3Service },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: LambdaService, useValue: mockLambdaService },
        { provide: DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER, useValue: mockDocEncryptionLambdaApiClient },
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

    it('should call baseS3Service createAssumedClient with correct args', async () => {
      const { region } = mockFileSGConfigService.awsConfig;

      await service.createAssumedClient(mockCredentials);

      expect(mockBaseS3Service.createAssumedClient).toBeCalledWith(mockCredentials, region, false);
    });
  });

  // ===========================================================================
  // Upload
  // ===========================================================================
  describe('uploadFileToStgBucket', () => {
    it('should be defined', () => {
      expect(service.uploadFileToStgBucket).toBeDefined();
    });

    it('should call baseS3Service uploadFileToS3 with correct args', async () => {
      const { stgFileBucketName } = mockFileSGConfigService.awsConfig;

      await service.uploadFileToStgBucket(mockUploadFileInput);

      expect(mockBaseS3Service.uploadFileToS3).toBeCalledWith(mockUploadFileInput, stgFileBucketName, undefined);
    });
  });

  // ===========================================================================
  // Delete
  // ===========================================================================
  describe('deleteFilesFromStgBucket', () => {
    it('should be defined', () => {
      expect(service.deleteFilesFromStgBucket).toBeDefined();
    });

    it('should call baseS3Service deleteFilesFromS3 with correct args', async () => {
      const { stgFileBucketName } = mockFileSGConfigService.awsConfig;

      await service.deleteFilesFromStgBucket(mockKeys);

      expect(mockBaseS3Service.deleteFilesFromS3).toBeCalledWith({ keys: mockKeys, bucketName: stgFileBucketName }, undefined);
    });
  });

  describe('deleteFilesFromStgCleanBucket', () => {
    it('should be defined', () => {
      expect(service.deleteFilesFromStgCleanBucket).toBeDefined();
    });

    it('should call baseS3Service deleteFilesFromS3 with correct args', async () => {
      const { stgCleanFileBucketName } = mockFileSGConfigService.awsConfig;

      await service.deleteFilesFromStgCleanBucket(mockKeys);

      expect(mockBaseS3Service.deleteFilesFromS3).toBeCalledWith({ keys: mockKeys, bucketName: stgCleanFileBucketName }, undefined);
    });
  });

  describe('deleteFilesAllVersionsFromMainBucket', () => {
    it('should be defined', () => {
      expect(service.deleteFilesAllVersionsFromMainBucket).toBeDefined();
    });

    it('should call baseS3Service deleteFilesFromS3 with correct args', async () => {
      const { mainFileBucketName } = mockFileSGConfigService.awsConfig;

      await service.deleteFilesAllVersionsFromMainBucket(mockKeys);

      expect(mockBaseS3Service.deleteFilesAllVersions).toBeCalledWith({ keys: mockKeys, bucketName: mainFileBucketName }, undefined);
    });
  });

  // ===========================================================================
  // Download
  // ===========================================================================
  describe('downloadFileFromMainBucket', () => {
    it('should be defined', () => {
      expect(service.downloadFileFromMainBucket).toBeDefined();
    });

    it('should call baseS3Service deleteFilesFromS3 with correct args', async () => {
      const { mainFileBucketName } = mockFileSGConfigService.awsConfig;

      await service.downloadFileFromMainBucket(mockKey);

      expect(mockBaseS3Service.downloadFileFromS3).toBeCalledWith({ key: mockKey, bucketName: mainFileBucketName }, undefined);
    });
  });

  describe('downloadFileFromStaticFileBucket', () => {
    it('should be defined', () => {
      expect(service.downloadFileFromStaticFileBucket).toBeDefined();
    });

    it('should call baseS3Service deleteFilesFromS3 with correct args', async () => {
      const { staticFileBucketURL } = mockFileSGConfigService.awsConfig;

      await service.downloadFileFromStaticFileBucket(mockKey);

      expect(mockBaseS3Service.downloadFileFromS3).toBeCalledWith({ key: mockKey, bucketName: staticFileBucketURL }, undefined);
    });
  });

  // ===========================================================================
  // Copy
  // ===========================================================================
  describe('copyTransferFiles', () => {
    beforeEach(() => {
      const generateSpy = jest.spyOn(generatePassword, 'generate');
      generateSpy.mockReturnValueOnce(mockFileEncryptionPassword);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be defined', () => {
      expect(service.copyTransferFiles).toBeDefined();
    });

    it('should call the correct file copy function based on whether the file requires password encryption', async () => {
      const docEncryptionPasswordEncryptionTransformerToFnSpy = jest.spyOn(docEncryptionPasswordEncryptionTransformer, 'to');
      docEncryptionPasswordEncryptionTransformerToFnSpy.mockReturnValueOnce(mockEncryptedPassword);

      const zipEncryptAndCopyFileFromStgCleanToMainSpy = jest.spyOn(service, 'zipEncryptAndCopyFileFromStgCleanToMain');
      zipEncryptAndCopyFileFromStgCleanToMainSpy.mockImplementation(async ({ fromKey, toKey }) => ({ fromKey, toKey, size: mockFileSize }));

      mockBaseS3Service.copyFileBetweenS3.mockImplementation(async ({ fileDetail: { fromKey, toKey } }) => ({ fromKey, toKey }));

      expect(
        await service.copyTransferFiles(mockTransferFiles, mockFromBucket, mockToBucket, mockS3Client, mockAssumeUploadMoveRole),
      ).toEqual({ encryptedPassword: mockEncryptedPassword, fileAssetUuidToNewSizeMap: mockFileAssetUuidToNewSizeMap });

      mockTransferFiles.forEach(({ from: { key: fromKey }, to: { key: toKey }, isPasswordEncryptionRequired, name }) => {
        if (isPasswordEncryptionRequired && !!name) {
          expect(zipEncryptAndCopyFileFromStgCleanToMainSpy).toBeCalledWith({
            fromKey,
            toKey,
            assumeRole: mockAssumeUploadMoveRole,
            password: mockFileEncryptionPassword,
            fileName: name,
          });
        } else {
          expect(mockBaseS3Service.copyFileBetweenS3).toBeCalledWith(
            { fileDetail: { fromKey, toKey }, toBucket: mockToBucket, fromBucket: mockFromBucket },
            mockS3Client,
          );
        }
      });

      expect(zipEncryptAndCopyFileFromStgCleanToMainSpy).toBeCalledTimes(
        mockTransferFiles.filter((file) => file.isPasswordEncryptionRequired).length,
      );

      expect(mockBaseS3Service.copyFileBetweenS3).toBeCalledTimes(
        mockTransferFiles.filter((file) => !file.isPasswordEncryptionRequired).length,
      );
    });

    it('should call deleteFilesAllVersions if copiedObjects > 0 & throw MoveFilesFailureException', async () => {
      const zipEncryptAndCopyFileFromStgCleanToMainSpy = jest.spyOn(service, 'zipEncryptAndCopyFileFromStgCleanToMain');
      zipEncryptAndCopyFileFromStgCleanToMainSpy.mockImplementation(async ({ fromKey, toKey }) => ({ fromKey, toKey, size: mockFileSize }));

      // failing the copy function for the second transfer file which does not require password encryption
      mockBaseS3Service.copyFileBetweenS3.mockRejectedValueOnce(new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, 'someErrorMessage'));

      await expect(
        service.copyTransferFiles(mockTransferFiles, mockFromBucket, mockToBucket, mockS3Client, mockAssumeUploadMoveRole),
      ).rejects.toThrow(MoveFilesFailureException);

      expect(mockBaseS3Service.deleteFilesAllVersions).toBeCalledWith(
        { keys: [mockTransferFiles[0].to.key], bucketName: mockToBucket },
        mockS3Client,
      );
    });

    it('should throw DeleteCopiedFilesErrorException when error occurs during deletion', async () => {
      const zipEncryptAndCopyFileFromStgCleanToMainSpy = jest.spyOn(service, 'zipEncryptAndCopyFileFromStgCleanToMain');
      zipEncryptAndCopyFileFromStgCleanToMainSpy.mockImplementation(async ({ fromKey, toKey }) => ({ fromKey, toKey, size: mockFileSize }));

      // failing the copy function for the second transfer file which does not require password encryption
      mockBaseS3Service.copyFileBetweenS3.mockRejectedValueOnce(new AWSHttpException(COMPONENT_ERROR_CODE.S3_SERVICE, 'someErrorMessage'));

      // failing the delete function for the first transfer file which has been copied over
      mockBaseS3Service.deleteFilesAllVersions.mockRejectedValueOnce(
        new AWSException(COMPONENT_ERROR_CODE.S3_SERVICE, 'deleteFilesAllVersionsErrorMessage', {
          operation: 'DELETE_ALL_FILES_VERSIONS',
          metadata: { keys: [mockTransferFiles[0].to.key] },
        }),
      );

      await expect(
        service.copyTransferFiles(mockTransferFiles, mockFromBucket, mockToBucket, mockS3Client, mockAssumeUploadMoveRole),
      ).rejects.toThrow(DeleteCopiedFilesErrorException);

      expect(mockBaseS3Service.deleteFilesAllVersions).toBeCalledTimes(1);
    });
  });

  describe('zipEncryptAndCopyFileFromStgCleanToMain', () => {
    const mockFromKey = 'mockFromKey';
    const mockToKey = 'mockToKey';

    const input: DocumentEncryptionInput = {
      fromKey: mockFromKey,
      toKey: mockToKey,
      fileName: 'mockName.pdf',
      password: 'mockPassword',
      assumeRole: { receiver: 'mockReceiver' },
    };

    it('should call base lambda service invokeLambda with the correct param', async () => {
      const output: DocumentEncryptionSuccessOutput = {
        fromKey: mockFromKey,
        toKey: mockToKey,
        size: mockFileSize,
      };

      const payload = objectToUint8Array(output);
      mockLambdaService.invokeLambda.mockResolvedValueOnce({ Payload: payload });

      expect(await service.zipEncryptAndCopyFileFromStgCleanToMain(input)).toEqual(output);

      expect(mockLambdaService.invokeLambda).toBeCalledWith({
        functionName: mockFileSGConfigService.awsConfig.docEncryptionLambdaFunctionName,
        payload: input,
      });
    });

    it('should throw DocEncryptionLambdaException if the payload is not DocumentEncryptionSuccessOutput', async () => {
      const output: DocumentEncryptionErrorOutput = {
        errorMessage: 'someErrorMessage',
        isHeadObjectError: true,
      };

      const payload = objectToUint8Array(output);
      mockLambdaService.invokeLambda.mockResolvedValueOnce({ Payload: payload });

      await expect(service.zipEncryptAndCopyFileFromStgCleanToMain(input)).rejects.toThrow(DocEncryptionLambdaException);
    });
  });

  describe('copyFileToStgBucket', () => {
    it('should be defined', () => {
      expect(service.copyFileToStgBucket).toBeDefined();
    });

    it('should call baseS3Service copyFileBetweenS3 with correct args', async () => {
      await service.copyFileToStgBucket(mockFromBucket, mockKey, mockKey, s3Client);

      expect(mockBaseS3Service.copyFileBetweenS3).toBeCalledWith(
        {
          fromBucket: mockFromBucket,
          toBucket: mockFileSGConfigService.awsConfig.stgFileBucketName,
          fileDetail: {
            fromKey: mockKey,
            toKey: mockKey,
          },
        },
        s3Client,
      );
    });
  });

  // ===========================================================================
  // Get Metadata
  // ===========================================================================
  describe('checkForMissingFilesInS3', () => {
    it('should be defined', () => {
      expect(service.checkForMissingFilesInS3).toBeDefined();
    });

    it('should call baseS3Service headObjectFromS3 with correct args and number of times', async () => {
      const input = [mockHeadObjectInput, mockHeadObjectInput];
      await service.checkForMissingFilesInS3(input, s3Client);

      expect(mockBaseS3Service.headObjectFromS3).toBeCalledTimes(input.length);
      expect(mockBaseS3Service.headObjectFromS3).toBeCalledWith(mockHeadObjectInput, s3Client);
    });

    it('missing files should be returned when headObjectFromS3 failed', async () => {
      mockBaseS3Service.headObjectFromS3.mockImplementationOnce(() => {
        throw new AWSException(COMPONENT_ERROR_CODE.S3_SERVICE, 'dummy error message', {
          operation: 'HEAD_OBJECT',
          metadata: {
            bucketName: mockHeadObjectInput.bucketName,
            key: mockHeadObjectInput.key,
          },
        });
      });

      const input = [mockHeadObjectInput, mockHeadObjectInput];
      const ret = await service.checkForMissingFilesInS3(input, s3Client);

      expect(ret).toEqual([{ bucketName: mockHeadObjectInput.bucketName, key: mockHeadObjectInput.key }]);
    });
  });

  describe('getFileMetadata', () => {
    it('should be defined', () => {
      expect(service.getFileMetadata).toBeDefined();
    });

    it('baseS3Service getFileMetadata should be called with correct args', async () => {
      await service.getFileMetadata(mockFromBucket, mockKey, s3Client);

      expect(mockBaseS3Service.getFileMetadata).toBeCalledWith(
        {
          bucketName: mockFromBucket,
          key: mockKey,
        },
        s3Client,
      );
    });
  });

  describe('DocEncryptionLambdaException', () => {
    test('"isRetrayble" should return false if the error message contains [UnsupportedFileTypeException] tag.', () => {
      const error = new DocEncryptionLambdaException(
        '[UnsupportedFileTypeException] File type is not supported',
        COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE,
        false,
      );
      expect(error.isRetryable).toBeFalsy();
    });
    test('"isRetrayble" should return false if the error message contains [MissingFileException] tag.', () => {
      const error = new DocEncryptionLambdaException(
        '[MissingFileException] Missing files: { path: "path1/file.xlsx"}',
        COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE,
        false,
      );
      expect(error.isRetryable).toBeFalsy();
    });
    test('"isRetrayble" should return false if the error message contains [UnsupportedFileTypeForEncryptionException] tag.', () => {
      const error = new DocEncryptionLambdaException(
        '[UnsupportedFileTypeForEncryptionException] File type is not supported for password protection.',
        COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE,
        false,
      );
      expect(error.isRetryable).toBeFalsy();
    });
    test('"isRetrayble" should return true if the error message do not contains any of the non retryable error tag.', () => {
      const error = new DocEncryptionLambdaException(
        '[AnyOtherErrorTag] Any other error.',
        COMPONENT_ERROR_CODE.DOC_ENCRYPTION_SERVICE,
        false,
      );
      expect(error.isRetryable).toBeTruthy();
    });
  });
});
