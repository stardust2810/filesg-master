/* eslint-disable sonarjs/no-duplicate-string */
import * as backendCommon from '@filesg/backend-common';
import {
  EVENT_LOGGING_EVENTS,
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgProcessBatchCreateTxnFailure,
  FormSgProcessInitEvent,
  maskUin,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, File, FORMSG_FAIL_CATEGORY } from '@filesg/common';
import { FormSgDecryptionError, FormSgIdMismatchError, FormSgService, FormSgWebhookAuthenticationError } from '@filesg/formsg';
import { UnzipService } from '@filesg/zipper';
import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as fileType from 'file-type';
import * as fs from 'fs';
import * as uuid from 'uuid';

import {
  BatchIssuancePackageZipFileException,
  FormSgCreateTransactionError,
  FormSgNonRetryableCreateTransactionError,
  FormSgNonRetryableUploadFileError,
  FormSgUploadFileError,
} from '../../../../../common/custom-exceptions';
import {
  EVENT_LOG_PATH,
  EVENT_LOGS_API_CLIENT_PROVIDER,
  FORMSG_BATCH_ISSUANCE_FORM_SECRET_NAME,
  SECRET_MANAGER_FSG_APP_PREFIX,
} from '../../../../../const';
import {
  DOWNLOAD_DIR,
  LOCAL_EXTRACTED_SUBPATH,
  TRANSACTIONS_SIDECAR_FILENAME,
  TRANSACTIONS_SIDECAR_HEADERS,
} from '../../../../../const/batch-issuance';
import { SingleIssuanceFormData } from '../../../../../typings';
import { mockEventLogsServiceApiClient } from '../../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../../setups/config/config.service';
import { mockKey, mockSmService } from '../../../aws/__mocks__/sm.service.mock';
import { SmService } from '../../../aws/sm.service';
import {
  mockBatchFormSgSqsRecord,
  mockBatchIssuanceSidecarDataList,
  mockBatchIssuanceSingleTransactionDataList,
  mockBuffer,
  mockChecksum,
  mockCreateFormSgFileTransactionResponse,
  mockDecryptedAttachments,
  mockDecryptedContentAndAttachments,
  mockFileMap,
  mockFileName,
  mockPaths,
  mockProcessFormDataResult,
  mockSubmissionId,
  mockUnzipService,
  TestBatchIssuanceFormService,
} from '../__mocks__/batch-issuance-form.service.mock';
import { mockFormSgService, mockRequestorEmail, mockSingleIssuanceFormService } from '../__mocks__/single-issuance-form.service.mock';
import { MAX_ALLOWED_TRANSACTION_COUNT } from '../batch-issuance-form.service';
import { SingleIssuanceFormService } from '../single-issuance-form.service';

// To allow spy on rmDir without mocking whole library
jest.mock('@filesg/backend-common', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@filesg/backend-common'),
  };
});

jest.mock('file-type', () => {
  return {
    __esModule: true,
    ...jest.requireActual('file-type'),
  };
});

jest.mock('fs', () => {
  return {
    __esModule: true,
    ...jest.requireActual('fs'),
  };
});

jest.mock('uuid', () => {
  return {
    __esModule: true,
    ...jest.requireActual('uuid'),
  };
});

describe('BatchIssuanceFormService', () => {
  let service: TestBatchIssuanceFormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestBatchIssuanceFormService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: SmService, useValue: mockSmService },
        { provide: FormSgService, useValue: mockFormSgService },
        { provide: EVENT_LOGS_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceApiClient },
        { provide: UnzipService, useValue: mockUnzipService },
        { provide: SingleIssuanceFormService, useValue: mockSingleIssuanceFormService },
      ],
    }).compile();

    service = module.get<TestBatchIssuanceFormService>(TestBatchIssuanceFormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Main handler', () => {
    describe('batchIssuanceFormHandler', () => {
      let generateFilePathsSpy: jest.SpyInstance;
      let processPackageZipFileSpy: jest.SpyInstance;
      let processFormDataSpy: jest.SpyInstance;
      let generateTransactionRequestsInfoSpy: jest.SpyInstance;
      let sendEventSpy: jest.SpyInstance;
      let issuanceHandlerSpy: jest.SpyInstance;
      let rmDirSpy: jest.SpyInstance;

      let formProcessErrorHandlerSpy: jest.SpyInstance;

      beforeEach(() => {
        generateFilePathsSpy = jest.spyOn(service, 'generateFilePaths');
        processPackageZipFileSpy = jest.spyOn(service, 'processPackageZipFile');
        processFormDataSpy = jest.spyOn(service, 'processFormData');
        generateTransactionRequestsInfoSpy = jest.spyOn(service, 'generateTransactionRequestsInfo');
        sendEventSpy = jest.spyOn(service, 'sendEvent');
        issuanceHandlerSpy = jest.spyOn(service, 'issuanceHandler');
        rmDirSpy = jest.spyOn(backendCommon, 'rmDir');
        formProcessErrorHandlerSpy = jest.spyOn(service, 'formProcessErrorHandler');

        generateFilePathsSpy.mockReturnValueOnce(mockPaths);
        mockFormSgService.decryptFormDataWithAttachments.mockReturnValueOnce(mockDecryptedContentAndAttachments);
        processPackageZipFileSpy.mockReturnValueOnce({ sidecarDataList: [], fileMap: {} });
        processFormDataSpy.mockReturnValueOnce(mockProcessFormDataResult);
        generateTransactionRequestsInfoSpy.mockReturnValueOnce(mockBatchIssuanceSingleTransactionDataList);
      });

      it('should be defined', () => {
        expect(service.batchIssuanceFormHandler).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        jest.useFakeTimers();

        const { parsedBodyData, attributes, parsedMessageAttributes } = mockBatchFormSgSqsRecord;
        const { formId, submissionId } = parsedBodyData!;

        const { env } = mockFileSGConfigService.systemConfig;
        const { formSgBatchIssuanceFormId, formSgBatchIssuanceWebhookUrl } = mockFileSGConfigService.formSGConfig;
        const { content: formContent, attachments: formAttachments } = mockDecryptedContentAndAttachments;

        await service.batchIssuanceFormHandler(mockBatchFormSgSqsRecord);

        // Generate file paths
        expect(generateFilePathsSpy).toBeCalledWith(submissionId);
        // Send batch init event
        expect(mockSingleIssuanceFormService.sendProcessInitEvent).toBeCalledWith(submissionId, attributes.SentTimestamp);

        // Validate formid & auth webhook
        expect(mockFormSgService.validateFormId).toBeCalledWith(formId, formSgBatchIssuanceFormId);
        expect(mockFormSgService.authenticateWebhook).toBeCalledWith(
          parsedMessageAttributes!.formsgSignature,
          formSgBatchIssuanceWebhookUrl,
        );

        // Decreate form content
        expect(mockSmService.getSecretValue).toBeCalledWith(
          `${SECRET_MANAGER_FSG_APP_PREFIX}/${env}/${FORMSG_BATCH_ISSUANCE_FORM_SECRET_NAME}`,
        );
        expect(mockFormSgService.decryptFormDataWithAttachments).toBeCalledWith(parsedBodyData, mockKey);

        // Process form response
        expect(processFormDataSpy).toBeCalledWith(formContent.responses);
        expect(generateTransactionRequestsInfoSpy).toBeCalledWith(mockProcessFormDataResult, [], {}, submissionId);

        // Process and validate package zip
        expect(processPackageZipFileSpy).toBeCalledWith(formAttachments, mockPaths);

        // Update batch record with notification counts
        expect(sendEventSpy).nthCalledWith(1, {
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE,
          requestorEmail: mockProcessFormDataResult.requestorEmail,
          id: submissionId,
          batchSize: mockBatchIssuanceSingleTransactionDataList.length,
        });

        // Create all txn init records
        expect(sendEventSpy).nthCalledWith(2, {
          type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
          ids: mockBatchIssuanceSingleTransactionDataList.map(({ id }) => id),
          processorStartedTimestamp: new Date().toISOString(),
          queueEventTimestamp: new Date(parseInt(attributes.SentTimestamp)).toISOString(),
          batchId: submissionId,
        });

        expect(issuanceHandlerSpy).toBeCalledWith(mockBatchIssuanceSingleTransactionDataList[0], {});

        // Update process end
        expect(sendEventSpy).nthCalledWith(3, {
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE,
          id: submissionId,
          timestamp: new Date().toISOString(),
        });

        expect(rmDirSpy).toBeCalledWith(mockPaths.localWorkingDir);

        jest.useRealTimers();
      });

      it('should call formProcessErrorHandler if error is thrown', async () => {
        sendEventSpy.mockRejectedValueOnce(new Error('mockReject'));

        await expect(service.batchIssuanceFormHandler(mockBatchFormSgSqsRecord)).rejects.toThrow();

        expect(formProcessErrorHandlerSpy).toBeCalledWith(
          new Error('mockReject'),
          mockSubmissionId,
          mockProcessFormDataResult.requestorEmail,
        );
      });
    });
  });

  describe('Form data processing', () => {
    describe('processFormData', () => {
      it('should be defined', () => {
        expect(service.processFormData).toBeDefined();
      });

      it('should return form data in correct format', async () => {
        expect(service.processFormData(mockDecryptedContentAndAttachments.content.responses)).toEqual({
          requestorEmail: 'filesgsqa+formsguser@gmail.com',
          applicationType: 'LTVP',
          transaction: {
            name: 'Issuance with 2 files',
            longCustomMessage: 'Long\nCustom\nMessage',
          },
        });
      });
    });

    describe('getApplicationType', () => {
      it('should be defined', () => {
        expect(service.getApplicationType).toBeDefined();
      });

      it('should return application type from form response | ICA - LTVP -> LTVP |', async () => {
        expect(service.getApplicationType(mockDecryptedContentAndAttachments.content.responses)).toEqual('LTVP');
      });
    });
  });

  describe('Package zip processing', () => {
    describe('generateFilePaths', () => {
      it('should be defined', () => {
        expect(service.generateFilePaths).toBeDefined();
      });

      it('should return correct values', () => {
        const localWorkingDir = `${DOWNLOAD_DIR}/${mockSubmissionId}`;
        const extractedZipDir = `${localWorkingDir}/${LOCAL_EXTRACTED_SUBPATH}`;
        const sidecarFileDir = `${extractedZipDir}/${TRANSACTIONS_SIDECAR_FILENAME}`;

        expect(service.generateFilePaths(mockSubmissionId)).toEqual({
          localWorkingDir,
          extractedZipDir,
          sidecarFileDir,
        });
      });
    });

    describe('processPackageZipFile', () => {
      let checkFileIsZipSpy: jest.SpyInstance;
      let createDirSpy: jest.SpyInstance;
      let checkSidecarFileExistsOrThrowSpy: jest.SpyInstance;
      let parseSidecarFileSpy: jest.SpyInstance;
      let checkForMissingIssuanceFilesSpy: jest.SpyInstance;
      let checkForExtraIssuanceFilesSpy: jest.SpyInstance;
      let generateFileMapSpy: jest.SpyInstance;

      beforeEach(() => {
        checkFileIsZipSpy = jest.spyOn(service, 'checkFileIsZip');
        createDirSpy = jest.spyOn(backendCommon, 'createDir');
        checkSidecarFileExistsOrThrowSpy = jest.spyOn(service, 'checkSidecarFileExistsOrThrow');
        parseSidecarFileSpy = jest.spyOn(service, 'parseSidecarFile');
        checkForMissingIssuanceFilesSpy = jest.spyOn(service, 'checkForMissingIssuanceFiles');
        checkForExtraIssuanceFilesSpy = jest.spyOn(service, 'checkForExtraIssuanceFiles');
        generateFileMapSpy = jest.spyOn(service, 'generateFileMap');

        checkFileIsZipSpy.mockReturnThis();
        checkSidecarFileExistsOrThrowSpy.mockReturnThis();
        parseSidecarFileSpy.mockResolvedValueOnce(mockBatchIssuanceSidecarDataList);
        checkForMissingIssuanceFilesSpy.mockReturnThis();
        checkForExtraIssuanceFilesSpy.mockReturnThis();
        generateFileMapSpy.mockReturnThis();
        generateFileMapSpy.mockReturnValueOnce(mockFileMap);
      });

      it('should be defined', () => {
        expect(service.processPackageZipFile).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        const { localWorkingDir, extractedZipDir, sidecarFileDir } = mockPaths;
        const mockFileContent = mockDecryptedAttachments['64c383e3fc37110011e99ffc'].content;
        const mockPackageZipFile = Buffer.from(mockFileContent);
        const mockUniqueFileNames = [...new Set(mockBatchIssuanceSidecarDataList.flatMap(({ files }) => files))];

        await service.processPackageZipFile(mockDecryptedAttachments, mockPaths);

        expect(checkFileIsZipSpy).toBeCalledWith(mockPackageZipFile);
        expect(createDirSpy).toBeCalledWith(localWorkingDir);
        expect(mockUnzipService.unzipToDisk).toBeCalledWith(mockPackageZipFile, extractedZipDir);
        expect(checkSidecarFileExistsOrThrowSpy).toBeCalledWith(sidecarFileDir);
        expect(parseSidecarFileSpy).toBeCalledWith(sidecarFileDir);
        expect(checkForMissingIssuanceFilesSpy).toBeCalledWith(extractedZipDir, mockUniqueFileNames);
        expect(checkForExtraIssuanceFilesSpy).toBeCalledWith(extractedZipDir, mockUniqueFileNames);
        expect(generateFileMapSpy).toBeCalledWith(extractedZipDir, mockUniqueFileNames);
      });

      it('should return correct values', async () => {
        expect(await service.processPackageZipFile(mockDecryptedAttachments, mockPaths)).toEqual({
          sidecarDataList: mockBatchIssuanceSidecarDataList,
          fileMap: mockFileMap,
        });
      });
    });

    describe('checkFileIsZip', () => {
      let fromBufferSpy: jest.SpyInstance;

      beforeAll(() => {
        fromBufferSpy = jest.spyOn(fileType, 'fromBuffer');
      });

      it('should be defined', () => {
        expect(service.checkFileIsZip).toBeDefined();
      });

      it('should resolve if result.ext === zip & result.mime === application/zip', async () => {
        const mockResult = {
          ext: 'zip',
          mime: 'application/zip',
        };

        fromBufferSpy.mockResolvedValueOnce(mockResult);

        await expect(() => service.checkFileIsZip(mockBuffer)).not.toThrow();
      });

      it('should throw if result.ext !== zip', async () => {
        const mockResult = {
          ext: 'pdf',
          mime: 'application/zip',
        };

        fromBufferSpy.mockResolvedValueOnce(mockResult);

        await expect(service.checkFileIsZip(mockBuffer)).rejects.toThrowError(
          new BatchIssuancePackageZipFileException(
            'File is not a zip file',
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.SIDECAR_FILE_NOT_ZIP,
          ),
        );
      });

      it('should throw if  result.mime !== application/zip', async () => {
        const mockResult = {
          ext: 'zip',
          mime: 'application/pdf',
        };

        fromBufferSpy.mockResolvedValueOnce(mockResult);

        await expect(service.checkFileIsZip(mockBuffer)).rejects.toThrowError(
          new BatchIssuancePackageZipFileException(
            'File is not a zip file',
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.SIDECAR_FILE_NOT_ZIP,
          ),
        );
      });
    });

    describe('checkSidecarFileExistsOrThrow', () => {
      const { sidecarFileDir } = mockPaths;

      let existsSyncSpy: jest.SpyInstance;

      beforeAll(() => {
        existsSyncSpy = jest.spyOn(fs, 'existsSync');
      });
      it('should be defined', () => {
        expect(service.checkSidecarFileExistsOrThrow).toBeDefined();
      });

      it('should resolve if existSync returns true', async () => {
        existsSyncSpy.mockReturnValueOnce(true);

        expect(() => service.checkSidecarFileExistsOrThrow(sidecarFileDir)).not.toThrow();
      });

      it('should throw if existSync returns false', async () => {
        existsSyncSpy.mockReturnValueOnce(false);

        expect(() => service.checkSidecarFileExistsOrThrow(sidecarFileDir)).toThrowError(
          new BatchIssuancePackageZipFileException(
            'Missing sidecar file',
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.SIDECAR_CSV_DOESNT_EXIST,
          ),
        );
      });
    });

    describe('parseSidecarFile', () => {
      const { sidecarFileDir } = mockPaths;
      let convertCsvToJsonSpy: jest.SpyInstance;

      beforeAll(() => {
        convertCsvToJsonSpy = jest.spyOn(backendCommon, 'convertCsvToJson');
      });

      it('should be defined', () => {
        expect(service.parseSidecarFile).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        convertCsvToJsonSpy.mockResolvedValueOnce([]);

        await service.parseSidecarFile(sidecarFileDir);

        expect(convertCsvToJsonSpy).toBeCalledWith(sidecarFileDir, TRANSACTIONS_SIDECAR_HEADERS, true, []);
      });

      it('should throw BatchIssuancePackageZipFileException with SIDECAR_CSV_HEADER_INCORRECT fail category if convertCsvToJson throws error', async () => {
        const error = new Error('CSV parse error');
        convertCsvToJsonSpy.mockRejectedValueOnce(error);

        await expect(service.parseSidecarFile(sidecarFileDir)).rejects.toThrowError(
          new BatchIssuancePackageZipFileException(
            error.message,
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.SIDECAR_CSV_HEADER_INCORRECT,
          ),
        );
      });

      it('should throw BatchIssuancePackageZipFileException with EXCEED_MAX_TRANSACTION_COUNT fail category if csv data length more than MAX_ALLOWED_TRANSACTION_COUNT', async () => {
        convertCsvToJsonSpy.mockResolvedValueOnce([...Array(MAX_ALLOWED_TRANSACTION_COUNT + 1).keys()]);

        await expect(service.parseSidecarFile(sidecarFileDir)).rejects.toThrowError(
          new BatchIssuancePackageZipFileException(
            `Number of transactions exceed maximum allowed number of ${MAX_ALLOWED_TRANSACTION_COUNT}`,
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.EXCEED_MAX_TRANSACTION_COUNT,
          ),
        );
      });
    });

    describe('checkForMissingIssuanceFiles', () => {
      const { extractedZipDir } = mockPaths;

      it('should be defined', () => {
        expect(service.checkForMissingIssuanceFiles).toBeDefined();
      });

      it('should throw if checkForMissingFilesInDir returns any file', async () => {
        const checkForMissingFilesInDirSpy = jest.spyOn(backendCommon, 'checkForMissingFilesInDir');

        const missingFiles = ['file-1'];
        checkForMissingFilesInDirSpy.mockResolvedValueOnce(missingFiles);

        await expect(service.checkForMissingIssuanceFiles(extractedZipDir, ['file-1'])).rejects.toThrowError(
          new BatchIssuancePackageZipFileException(
            `Missing file(s) for issuance: ${missingFiles.join(',')}`,
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.FILES_MISMATCH,
          ),
        );
      });
    });

    describe('checkForExtraIssuanceFiles', () => {
      const { extractedZipDir } = mockPaths;

      it('should be defined', () => {
        expect(service.checkForExtraIssuanceFiles).toBeDefined();
      });

      it('should resolve if dir files match issuance files', async () => {
        const listDirContentSpy = jest.spyOn(backendCommon, 'listDirContent');

        const mockDirFiles = ['file-1', 'file-2', TRANSACTIONS_SIDECAR_FILENAME];
        const mockIssuanceFiles = ['file-1', 'file-2'];
        listDirContentSpy.mockResolvedValueOnce(mockDirFiles);

        await service.checkForExtraIssuanceFiles(extractedZipDir, mockIssuanceFiles);
      });

      it('should throw if dir files has more files than issuance files', async () => {
        const listDirContentSpy = jest.spyOn(backendCommon, 'listDirContent');

        const mockDirFiles = ['file-1', 'file-2', 'file-3', TRANSACTIONS_SIDECAR_FILENAME];
        const mockIssuanceFiles = ['file-1', 'file-2'];
        listDirContentSpy.mockResolvedValueOnce(mockDirFiles);

        await expect(service.checkForExtraIssuanceFiles(extractedZipDir, mockIssuanceFiles)).rejects.toThrowError(
          new BatchIssuancePackageZipFileException(
            `Extra file(s) in package zip: file-3`,
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.FILES_MISMATCH,
          ),
        );
      });
    });

    describe('generateFileMap', () => {
      it('should be defined', () => {
        expect(service.generateFileMap).toBeDefined();
      });

      it('should return correct values', () => {
        const readFileSyncSpy = jest.spyOn(fs, 'readFileSync');
        const generateChecksumSpy = jest.spyOn(backendCommon, 'generateChecksum');

        readFileSyncSpy.mockReturnValue(mockBuffer);
        generateChecksumSpy.mockReturnValueOnce(mockChecksum);

        const { extractedZipDir } = mockPaths;

        expect(service.generateFileMap(extractedZipDir, [mockFileName])).toEqual({
          [mockFileName]: {
            checksum: mockChecksum,
            base64: mockBuffer.toString('base64'),
          },
        });
      });
    });
  });

  describe('Transaction process handlers', () => {
    describe('generateTransactionRequestsInfo', () => {
      it('should be defined', () => {
        expect(service.generateTransactionRequestsInfo).toBeDefined();
      });

      it('should return correct values', () => {
        const uuidV4Spy = jest.spyOn(uuid, 'v4');

        const mockUuid = 'mockUuid';
        uuidV4Spy.mockReturnValueOnce(mockUuid);

        const {
          applicationType,
          requestorEmail,
          transaction: { name: transactionName, longCustomMessage },
        } = mockProcessFormDataResult;
        const { uin, name, email } = mockBatchIssuanceSidecarDataList[0];
        const mockFileName = mockBatchIssuanceSidecarDataList[0].files[0];

        expect(
          service.generateTransactionRequestsInfo(
            mockProcessFormDataResult,
            mockBatchIssuanceSidecarDataList,
            mockFileMap,
            mockSubmissionId,
          ),
        ).toEqual([
          {
            createFileTransactionRequestData: {
              application: { type: applicationType },
              files: [{ name: mockFileName, checksum: mockFileMap[mockFileName].checksum }],
              requestorEmail: requestorEmail,
              transaction: {
                name: transactionName,
                longCustomMessage: [longCustomMessage],
                recipients: [{ uin, name, email }],
              },
            } as SingleIssuanceFormData,
            fileUploadRequestData: { fileNames: [mockFileName] },
            id: `${mockSubmissionId}-${mockUuid}`,
          },
        ]);
      });
    });

    describe('issuanceHandler', () => {
      const { id, createFileTransactionRequestData, fileUploadRequestData } = mockBatchIssuanceSingleTransactionDataList[0];

      it('should be defined', () => {
        expect(service.issuanceHandler).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        jest.useFakeTimers();

        const sendEventSpy = jest.spyOn(service, 'sendEvent');

        mockSingleIssuanceFormService.createFileTransaction.mockResolvedValueOnce(mockCreateFormSgFileTransactionResponse);

        const {
          application,
          transaction: { name: transactionName, recipients: requestRecipients },
          files: requestFiles,
        } = createFileTransactionRequestData;
        const { recipients, notificationChannels, transactionUuid, files } = mockCreateFormSgFileTransactionResponse;

        const filesToUpload: File[] = fileUploadRequestData.fileNames.map((fileName) => {
          const fileBase64 = mockFileMap[fileName].base64;
          return {
            fileName,
            isOA: false,
            fileData: fileBase64,
          };
        });

        await service.issuanceHandler(mockBatchIssuanceSingleTransactionDataList[0], mockFileMap);

        expect(mockSingleIssuanceFormService.createFileTransaction).toBeCalledWith(createFileTransactionRequestData, id);
        expect(mockSingleIssuanceFormService.uploadFileToServer).toBeCalledWith(filesToUpload, mockCreateFormSgFileTransactionResponse, id);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS,
          id,
          application,
          notificationsToSendCount: recipients.length * notificationChannels.length,
          timestamp: new Date().toISOString(),
          transaction: {
            uuid: transactionUuid,
            name: transactionName,
            agencyFileAssets: files.map(({ name, uuid }, index) => ({ name, uuid, deleteAt: requestFiles[index].deleteAt })),
            recipientActivities: recipients.map(({ activityUuid, uin }, index) => {
              const { name, email, dob, contact } = requestRecipients[index];
              return {
                uuid: activityUuid,
                name,
                maskedUin: maskUin(uin),
                email,
                dob,
                contact,
                isNonSingpassRetrievable: !!dob && !!contact,
              };
            }),
          },
          transactionUuid: mockCreateFormSgFileTransactionResponse.transactionUuid,
        });

        jest.useRealTimers();
      });

      it('should call transactionErrorHandler if error thrown', async () => {
        const transactionErrorHandlerSpy = jest.spyOn(service, 'transactionErrorHandler');

        mockSingleIssuanceFormService.createFileTransaction.mockResolvedValueOnce(mockCreateFormSgFileTransactionResponse);
        const error = new Error('Create transaction error');
        mockSingleIssuanceFormService.uploadFileToServer.mockRejectedValueOnce(error);

        await service.issuanceHandler(mockBatchIssuanceSingleTransactionDataList[0], mockFileMap);

        expect(transactionErrorHandlerSpy).toBeCalledWith(
          error,
          id,
          createFileTransactionRequestData,
          mockCreateFormSgFileTransactionResponse,
        );
      });
    });
  });

  describe('Event logs handling', () => {
    describe('sendEvent', () => {
      const mockEvent: FormSgProcessInitEvent = {
        type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
        ids: ['1'],
        queueEventTimestamp: new Date().toISOString(),
        processorStartedTimestamp: new Date().toISOString(),
      };

      it('should be defined', () => {
        expect(service.sendEvent).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        await service.sendEvent(mockEvent);

        expect(mockEventLogsServiceApiClient.post).toBeCalledWith(EVENT_LOG_PATH, { event: mockEvent });
      });

      it('should warning log if error is thrown', async () => {
        const loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn');

        const error = new Error('Axios error');
        const errorMessage = error?.message ? error.message : JSON.stringify(error);

        mockEventLogsServiceApiClient.post.mockRejectedValueOnce(error);

        await service.sendEvent(mockEvent);

        expect(loggerWarnSpy).toBeCalledWith(`sendEvent Error: ${errorMessage}, form id: 1`);
      });
    });

    describe('sendBatchProcessTransactionFailureEvent', () => {
      const mockFailure = {
        application: 'mockApplication',
        reason: 'mockReason',
        subType: 'mockSubType',
        transaction: 'mockTransaction',
        transactionUuid: 'mockTransactionUuid',
        type: 'mockType',
      } as unknown as FormSgProcessBatchCreateTxnFailure;

      it('should be defined', () => {
        expect(service.sendBatchProcessTransactionFailureEvent).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        jest.useFakeTimers();

        const sendEventSpy = jest.spyOn(service, 'sendEvent');

        await service.sendBatchProcessTransactionFailureEvent(mockSubmissionId, mockFailure);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE,
          id: mockSubmissionId,
          timestamp: new Date().toISOString(),
          failure: mockFailure,
        });

        jest.useRealTimers();
      });
    });
  });

  describe('Error handlers', () => {
    describe('transactionErrorHandler', () => {
      const { createFileTransactionRequestData } = mockBatchIssuanceSingleTransactionDataList[0];
      let sendBatchProcessTransactionFailureEventSpy: jest.SpyInstance;

      beforeEach(() => {
        sendBatchProcessTransactionFailureEventSpy = jest.spyOn(service, 'sendBatchProcessTransactionFailureEvent');
      });

      it('should be defined', () => {
        expect(service.transactionErrorHandler).toBeDefined();
      });

      describe('should call correct methods for create transaction errors', () => {
        const mockFailure = {
          application: 'mockApplication',
          reason: 'mockReason',
          subType: 'mockSubType',
          transaction: 'mockTransaction',
          type: 'mockType',
        };

        beforeEach(() => {
          mockSingleIssuanceFormService.generateCreateTransactionFailure.mockReturnValueOnce(mockFailure);
        });

        it('FormSgNonRetryableCreateTransactionError', async () => {
          const error = new FormSgNonRetryableCreateTransactionError('mockError', COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'mockFailSubType');

          await service.transactionErrorHandler(error, mockSubmissionId, createFileTransactionRequestData);

          expect(mockSingleIssuanceFormService.generateCreateTransactionFailure).toBeCalledWith(error, createFileTransactionRequestData);
        });

        it('FormSgCreateTransactionError', async () => {
          const error = new FormSgCreateTransactionError('mockError', COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'mockFailSubType');

          await service.transactionErrorHandler(error, mockSubmissionId, createFileTransactionRequestData);

          expect(mockSingleIssuanceFormService.generateCreateTransactionFailure).toBeCalledWith(error, createFileTransactionRequestData);
        });

        afterEach(() => {
          expect(sendBatchProcessTransactionFailureEventSpy).toBeCalledWith(mockSubmissionId, mockFailure);
        });
      });

      describe('should call correct methods for file upload errors', () => {
        const mockFailure = {
          application: 'mockApplication',
          reason: 'mockReason',
          subType: 'mockSubType',
          transaction: 'mockTransaction',
          type: 'mockType',
        };
        beforeEach(() => {
          mockSingleIssuanceFormService.generateFileUploadFailure.mockReturnValueOnce(mockFailure);
        });

        it('FormSgNonRetryableUploadFileError', async () => {
          const error = new FormSgNonRetryableUploadFileError('mockError', COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'mockFailSubType');

          await service.transactionErrorHandler(
            error,
            mockSubmissionId,
            createFileTransactionRequestData,
            mockCreateFormSgFileTransactionResponse,
          );

          expect(mockSingleIssuanceFormService.generateFileUploadFailure).toBeCalledWith(
            error,
            createFileTransactionRequestData,
            mockCreateFormSgFileTransactionResponse,
          );
        });

        it('FormSgUploadFileError', async () => {
          const error = new FormSgUploadFileError('mockError', COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'mockFailSubType');

          await service.transactionErrorHandler(
            error,
            mockSubmissionId,
            createFileTransactionRequestData,
            mockCreateFormSgFileTransactionResponse,
          );

          expect(mockSingleIssuanceFormService.generateFileUploadFailure).toBeCalledWith(
            error,
            createFileTransactionRequestData,
            mockCreateFormSgFileTransactionResponse,
          );
        });

        afterEach(() => {
          expect(sendBatchProcessTransactionFailureEventSpy).toBeCalledWith(mockSubmissionId, mockFailure);
        });
      });

      it('should call correct methods for other errors', async () => {
        const error = new Error('Other error');

        await service.transactionErrorHandler(
          error,
          mockSubmissionId,
          createFileTransactionRequestData,
          mockCreateFormSgFileTransactionResponse,
        );

        expect(
          mockSingleIssuanceFormService.sendProcessFailureEvent(mockSubmissionId, {
            type: FORMSG_PROCESS_FAIL_TYPE.OTHERS,
            reason: error.message,
          }),
        );
      });
    });

    describe('formProcessErrorHandler', () => {
      let sendEventSpy: jest.SpyInstance;

      beforeAll(() => {
        jest.useFakeTimers();
      });

      beforeEach(() => {
        sendEventSpy = jest.spyOn(service, 'sendEvent');
      });

      it('should be defined', () => {
        expect(service.formProcessErrorHandler).toBeDefined();
      });

      describe('should call sendProcessFailureEvent for common process failure errors', () => {
        const errorMessage = 'sendProcessFailureEvent error';

        it('FormSgWebhookAuthenticationError', async () => {
          const error = new FormSgWebhookAuthenticationError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE);

          await expect(service.formProcessErrorHandler(error, mockSubmissionId)).rejects.toThrowError(error);

          expect(mockSingleIssuanceFormService.sendProcessFailureEvent).toBeCalledWith(mockSubmissionId, {
            type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
            reason: error.message,
          });
        });

        it('FormSgIdMismatchError', async () => {
          const error = new FormSgIdMismatchError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE);

          await expect(service.formProcessErrorHandler(error, mockSubmissionId)).rejects.toThrowError(error);

          expect(mockSingleIssuanceFormService.sendProcessFailureEvent).toBeCalledWith(mockSubmissionId, {
            type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
            reason: error.message,
          });
        });

        it('FormSgDecryptionError', async () => {
          const error = new FormSgDecryptionError(COMPONENT_ERROR_CODE.FORMSG_SERVICE);

          await expect(service.formProcessErrorHandler(error, mockSubmissionId)).rejects.toThrowError(error);

          expect(mockSingleIssuanceFormService.sendProcessFailureEvent).toBeCalledWith(mockSubmissionId, {
            type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
            reason: error.message,
          });
        });
      });

      it('should call sendEvent with correct values for BatchIssuancePackageZipFileException', async () => {
        const errorMessage = 'BatchIssuancePackageZipFileException';
        const error = new BatchIssuancePackageZipFileException(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'mockFailSubType');

        await expect(service.formProcessErrorHandler(error, mockSubmissionId, mockRequestorEmail)).rejects.toThrowError(error);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE,
          id: mockSubmissionId,
          timestamp: new Date().toISOString(),
          failure: {
            type: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION,
            reason: error.message,
            subType: error.formsgFailSubType,
            requestorEmail: mockRequestorEmail,
          },
        });
      });

      it('should call sendEvent with correct values for other errors', async () => {
        const errorMessage = 'other errors';
        const error = new Error(errorMessage);

        await expect(service.formProcessErrorHandler(error, mockSubmissionId, mockRequestorEmail)).rejects.toThrowError(error);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE,
          id: mockSubmissionId,
          timestamp: new Date().toISOString(),
          failure: {
            type: FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS,
            reason: error.message,
          },
        });
      });

      afterAll(() => {
        jest.useRealTimers();
      });
    });
  });
});
