/* eslint-disable sonarjs/no-duplicate-string */
import * as backendCommon from '@filesg/backend-common';
import {
  FormSgProcessAuthDecryptFailure,
  FormSgProcessCreateTxnFailure,
  FormSgProcessCreateTxnFailureTransaction,
  FormSgProcessFileUploadFailure,
  FormSgProcessFileUploadFailureAgencyFileAsset,
} from '@filesg/backend-common';
import * as common from '@filesg/common';
import { FormField, FormSgDecryptionError, FormSgIdMismatchError, FormSgService, FormSgWebhookAuthenticationError } from '@filesg/formsg';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AxiosError, AxiosInstance } from 'axios';
import { classToPlain, plainToClass } from 'class-transformer';

import {
  AdditionalCreateTransactionErrorData,
  FormSgCreateTransactionError,
  FormSgNonRetryableCreateTransactionError,
  FormSgNonRetryableUploadFileError,
  FormSgUploadFileError,
} from '../../../../../common/custom-exceptions';
import {
  EVENT_LOG_PATH,
  EVENT_LOGS_API_CLIENT_PROVIDER,
  FORMSG_SINGLE_ISSUANCE_FORM_SECRET_NAME,
  SECRET_MANAGER_FSG_APP_PREFIX,
} from '../../../../../const';
import { SingleIssuanceFormData } from '../../../../../typings';
import {
  MockCoreServiceClientProvider,
  MockEventLogsServiceClientProvider,
  MockTransferServiceClientProvider,
} from '../../../../setups/api-client/__mocks__/api-client.mock';
import { mockApiResponse, MockCoreApiOperation, mockServer } from '../../../../setups/api-client/__mocks__/backend-server.mock';
import { mockFileSGConfigService } from '../../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../../setups/config/config.service';
import { mockKey, mockSmService } from '../../../aws/__mocks__/sm.service.mock';
import { SmService } from '../../../aws/sm.service';
import { generateMockAxiosError, mockAxiosErrorMessage, mockFormSgService } from '../__mocks__/common.mock';
import {
  mockBlacklistedEmails,
  mockContentWithOneNSPRecipient,
  mockCreateTransactionAxiosResponse,
  mockCreateTransactionPayload,
  mockCreateTransactionResponse,
  mockDecryptedFormSgData,
  mockDeteleAtDateInputValidationError,
  mockDuplicatedFileNames,
  mockDuplicatedUins,
  mockDuplicateFileNamesError,
  mockDuplicateRecipientUinsError,
  mockFailSubType,
  mockFailureReason,
  mockFormData,
  mockFormSgProcessInitEvent,
  mockFormSgSignature,
  mockFormSgSqsRecord,
  mockISOTimestamp,
  mockRecipientEmailBlacklistedError,
  mockSingleAttachment,
  mockSingleIssuanceFormData,
  mockSubmissionId,
  mockTimestamp,
  mockTransactionUuid,
  mockUnsupportedTypeFileNames,
  TestSingleIssuanceFormService,
} from '../__mocks__/single-issuance-form.service.mock';
const { EVENT_LOGGING_EVENTS, FORMSG_PROCESS_FAIL_TYPE, maskUin, transformValidationErrorsToErrorData } = backendCommon;
const { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE, FORMSG_FAIL_CATEGORY, constructErrorMessageFromAxiosResponse } = common;

jest.mock('@filesg/backend-common', () => ({ __esModule: true, ...jest.requireActual('@filesg/backend-common') }));
jest.mock('@filesg/common', () => ({ __esModule: true, ...jest.requireActual('@filesg/common') }));

describe('SingleIssuanceFormService', () => {
  let service: TestSingleIssuanceFormService;
  let axiosInstance: AxiosInstance;

  beforeAll(() => {
    mockServer.listen();
  });

  afterAll(() => {
    mockServer.close();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestSingleIssuanceFormService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: SmService, useValue: mockSmService },
        { provide: FormSgService, useValue: mockFormSgService },
        MockCoreServiceClientProvider,
        MockEventLogsServiceClientProvider,
        MockTransferServiceClientProvider,
      ],
    }).compile();

    service = module.get<TestSingleIssuanceFormService>(TestSingleIssuanceFormService);
    axiosInstance = module.get<AxiosInstance>(EVENT_LOGS_API_CLIENT_PROVIDER);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('singleIssuanceFormHandler', () => {
    it('should not throw error when data is correct', async () => {
      const { env } = mockFileSGConfigService.systemConfig;
      const { formSgSingleIssuanceFormId, formSgSingleIssuanceWebhookUrl } = mockFileSGConfigService.formSGConfig;
      const { content, attachments } = mockDecryptedFormSgData;
      const { submissionId, formId } = mockFormData;

      mockFormSgService.validateFormId.mockReturnThis();
      mockFormSgService.authenticateWebhook.mockReturnThis();
      mockSmService.getSecretValue.mockResolvedValueOnce(mockKey);
      mockFormSgService.decryptFormDataWithAttachments.mockResolvedValueOnce(mockDecryptedFormSgData);

      const sendProcessInitEventSpy = jest.spyOn(service, 'sendProcessInitEvent');
      const processFormDataSpy = jest.spyOn(service, 'processFormData');
      const createFileTransactionSpy = jest.spyOn(service, 'createFileTransaction');
      const uploadFileToServerSpy = jest.spyOn(service, 'uploadFileToServer');
      const sendProcessSuccessEventSpy = jest.spyOn(service, 'sendProcessSuccessEvent');

      mockApiResponse(MockCoreApiOperation.CreateFormsgTransaction, 200, mockCreateTransactionAxiosResponse);

      const issuanceFormData = service.processFormData(content.responses, attachments);

      const mockCreateFileTransactionRequestData = plainToClass(SingleIssuanceFormData, issuanceFormData, {
        exposeUnsetFields: false,
      });

      const files = issuanceFormData.files.map((file, index) => {
        const fileBase64 = Buffer.from(service.getAttachmentByIndex(index, attachments)!).toString('base64');
        return {
          fileName: file.name,
          isOA: false,
          fileData: fileBase64,
        };
      });

      await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).resolves.not.toThrow();

      expect(sendProcessInitEventSpy).toBeCalledWith(submissionId, mockFormSgSqsRecord.attributes.SentTimestamp);
      expect(mockFormSgService.validateFormId).toBeCalledWith(formId, formSgSingleIssuanceFormId);
      expect(mockFormSgService.authenticateWebhook).toBeCalledWith(mockFormSgSignature, formSgSingleIssuanceWebhookUrl);

      expect(mockSmService.getSecretValue).toBeCalledWith(
        `${SECRET_MANAGER_FSG_APP_PREFIX}/${env}/${FORMSG_SINGLE_ISSUANCE_FORM_SECRET_NAME}`,
      );
      expect(mockFormSgService.decryptFormDataWithAttachments).toBeCalledWith(mockFormData, mockKey);

      expect(processFormDataSpy).toBeCalledWith(content.responses, attachments);
      expect(createFileTransactionSpy).toBeCalledWith(mockCreateFileTransactionRequestData);
      expect(uploadFileToServerSpy).toBeCalledWith(files, mockCreateTransactionResponse);
      expect(sendProcessSuccessEventSpy).toBeCalledWith(submissionId, mockCreateFileTransactionRequestData, mockCreateTransactionResponse);
    });

    describe('when catching webhook processing errors', () => {
      const { submissionId } = mockFormData;
      let error: FormSgWebhookAuthenticationError | FormSgIdMismatchError | FormSgDecryptionError;

      let sendProcessInitEventSpy: jest.SpyInstance;
      let sendProcessFailureEventSpy: jest.SpyInstance;

      beforeEach(() => {
        sendProcessInitEventSpy = jest.spyOn(service, 'sendProcessInitEvent');
        sendProcessFailureEventSpy = jest.spyOn(service, 'sendProcessFailureEvent');
      });

      afterEach(() => {
        expect(sendProcessInitEventSpy).toBeCalledWith(submissionId, mockFormSgSqsRecord.attributes.SentTimestamp);
        expect(sendProcessFailureEventSpy).toBeCalledWith(submissionId, {
          type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
          reason: error.message,
        });
      });

      it('should call sendProcessAuthDecryptFailureEvent when FormSgWebhookAuthenticationError error occurs', async () => {
        error = new FormSgWebhookAuthenticationError('webhook auth error', COMPONENT_ERROR_CODE.FORMSG_SERVICE);

        mockFormSgService.authenticateWebhook.mockImplementationOnce(() => {
          throw error;
        });

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgWebhookAuthenticationError);
      });

      it('should call sendProcessAuthDecryptFailureEvent when FormSgIdMismatchError error occurs', async () => {
        error = new FormSgIdMismatchError('formId mismatch', COMPONENT_ERROR_CODE.FORMSG_SERVICE);

        mockFormSgService.validateFormId.mockImplementationOnce(() => {
          throw error;
        });

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgIdMismatchError);
      });

      it('should call sendProcessAuthDecryptFailureEvent when FormSgDecryptionError error occurs', async () => {
        error = new FormSgDecryptionError(COMPONENT_ERROR_CODE.FORMSG_SERVICE);

        mockFormSgService.decryptFormDataWithAttachments.mockImplementationOnce(() => {
          throw error;
        });

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgDecryptionError);
      });
    });

    describe('when catching create tranasction errors', () => {
      const { submissionId } = mockFormData;
      let error: FormSgNonRetryableCreateTransactionError | FormSgCreateTransactionError;
      let mockCreateFileTransactionRequestData: SingleIssuanceFormData;

      let createFileTransactionSpy: jest.SpyInstance;
      let generateCreateTransactionFailureSpy: jest.SpyInstance;
      let sendProcessFailureEventSpy: jest.SpyInstance;

      beforeEach(() => {
        createFileTransactionSpy = jest.spyOn(service, 'createFileTransaction');
        generateCreateTransactionFailureSpy = jest.spyOn(service, 'generateCreateTransactionFailure');
        mockFormSgService.decryptFormDataWithAttachments.mockResolvedValueOnce(mockDecryptedFormSgData);
        sendProcessFailureEventSpy = jest.spyOn(service, 'sendProcessFailureEvent');

        const { content, attachments } = mockDecryptedFormSgData;
        const issuanceFormData = service.processFormData(content.responses, attachments);

        mockCreateFileTransactionRequestData = plainToClass(SingleIssuanceFormData, issuanceFormData, {
          exposeUnsetFields: false,
        });
      });

      afterEach(() => {
        expect(generateCreateTransactionFailureSpy).toBeCalledWith(error, mockCreateFileTransactionRequestData);
      });

      it('should call createTransactionErrorExceptionHandler when FormSgNonRetryableCreateTransactionError error occurs', async () => {
        error = new FormSgNonRetryableCreateTransactionError(
          'some error',
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
          FORMSG_FAIL_CATEGORY.CRITICAL_ERROR,
        );

        createFileTransactionSpy.mockRejectedValueOnce(error);

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgNonRetryableCreateTransactionError);

        const mockFailure = service.generateCreateTransactionFailure(error, mockCreateFileTransactionRequestData);

        expect(sendProcessFailureEventSpy).toBeCalledWith(submissionId, mockFailure);
      });

      it('should call createTransactionErrorExceptionHandler when FormSgCreateTransactionError error occurs', async () => {
        error = new FormSgCreateTransactionError('some error', COMPONENT_ERROR_CODE.FORMSG_SERVICE, FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR);

        createFileTransactionSpy.mockRejectedValueOnce(error);

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgCreateTransactionError);
      });
    });

    describe('when catching file upload errors', () => {
      const { submissionId } = mockFormData;

      let error: FormSgNonRetryableUploadFileError | FormSgUploadFileError;
      let mockCreateFileTransactionRequestData: SingleIssuanceFormData;

      let uploadFileToServerSpy: jest.SpyInstance;
      let generateFileUploadFailureSpy: jest.SpyInstance;
      let sendProcessFailureEventSpy: jest.SpyInstance;

      beforeEach(() => {
        uploadFileToServerSpy = jest.spyOn(service, 'uploadFileToServer');
        generateFileUploadFailureSpy = jest.spyOn(service, 'generateFileUploadFailure');
        mockFormSgService.decryptFormDataWithAttachments.mockResolvedValueOnce(mockDecryptedFormSgData);
        sendProcessFailureEventSpy = jest.spyOn(service, 'sendProcessFailureEvent');

        const { content, attachments } = mockDecryptedFormSgData;
        const issuanceFormData = service.processFormData(content.responses, attachments);

        mockCreateFileTransactionRequestData = plainToClass(SingleIssuanceFormData, issuanceFormData, {
          exposeUnsetFields: false,
        });

        mockApiResponse(MockCoreApiOperation.CreateFormsgTransaction, 200, mockCreateTransactionAxiosResponse);
      });

      afterEach(() => {
        expect(generateFileUploadFailureSpy).toBeCalledWith(error, mockCreateFileTransactionRequestData, mockCreateTransactionResponse);
      });

      it('should call uploadFileErrorExceptionHandler when FormSgNonRetryableUploadFileError error occurs', async () => {
        error = new FormSgNonRetryableUploadFileError(
          'some error',
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
          FORMSG_FAIL_CATEGORY.CRITICAL_ERROR,
        );

        uploadFileToServerSpy.mockRejectedValueOnce(error);

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgNonRetryableUploadFileError);

        const mockFailure = service.generateFileUploadFailure(
          error,
          mockCreateFileTransactionRequestData,
          mockCreateTransactionAxiosResponse.data,
        );

        expect(sendProcessFailureEventSpy).toBeCalledWith(submissionId, mockFailure);
      });

      it('should call uploadFileErrorExceptionHandler when FormSgUploadFileError error occurs', async () => {
        error = new FormSgUploadFileError('some error', COMPONENT_ERROR_CODE.FORMSG_SERVICE, FORMSG_FAIL_CATEGORY.CRITICAL_ERROR);

        uploadFileToServerSpy.mockRejectedValueOnce(error);

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(FormSgUploadFileError);

        const mockFailure = service.generateFileUploadFailure(
          error,
          mockCreateFileTransactionRequestData,
          mockCreateTransactionAxiosResponse.data,
        );

        expect(sendProcessFailureEventSpy).toBeCalledWith(submissionId, mockFailure);
      });
    });

    describe('when catching any other errors', () => {
      it('should call sendProcessOthersFailureEvent', async () => {
        const { submissionId } = mockFormData;
        const error = new Error('any other error');

        const sendProcessInitEventSpy = jest.spyOn(service, 'sendProcessInitEvent');
        sendProcessInitEventSpy.mockRejectedValueOnce(error);

        const sendProcessFailureEventSpy = jest.spyOn(service, 'sendProcessFailureEvent');

        await expect(service.singleIssuanceFormHandler(mockFormSgSqsRecord)).rejects.toThrow(error);

        expect(sendProcessFailureEventSpy).toBeCalledWith(submissionId, {
          type: FORMSG_PROCESS_FAIL_TYPE.OTHERS,
          reason: error.message,
        });
      });
    });
  });

  describe('processFormData', () => {
    it('should process form data that can be transformed to expected request dto', async () => {
      const { content, attachments } = mockDecryptedFormSgData;
      const result = service.processFormData(content.responses as FormField[], attachments);
      const req = plainToClass(SingleIssuanceFormData, result, { exposeUnsetFields: false });
      const plainReq = JSON.parse(JSON.stringify(req));
      const expectedPlainResult = classToPlain({
        ...mockCreateTransactionPayload,
        transaction: { ...mockCreateTransactionPayload.transaction, recipients: [mockCreateTransactionPayload.transaction.recipients[0]] },
      });

      expect(plainReq).toStrictEqual(expectedPlainResult);
    });

    it('should process form data with single NSP recipient and single file', async () => {
      const result = service.processFormData(mockContentWithOneNSPRecipient.responses as FormField[], mockSingleAttachment);
      const req = plainToClass(SingleIssuanceFormData, result, { exposeUnsetFields: false });
      const plainReq = JSON.parse(JSON.stringify(req));
      const expectedPlainResult = {
        requestorEmail: 'filesgsqa+formsguser@gmail.com',
        application: { externalRefId: 'REF-EXT-TEST-001', type: 'LTVP' },
        transaction: {
          name: 'Issuance with 2 files',
          longCustomMessage: ['Long', 'Custom', 'Message'],
          recipients: [
            {
              email: 'testEmail@notadomain.com',
              name: 'test Recipient name',
              uin: 'S3002610A',
              isNonSingpassRetrievable: true,
            },
          ],
        },
        files: [
          {
            name: 'single-page.pdf',
            checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          },
        ],
      };

      expect(plainReq).toStrictEqual(expectedPlainResult);
    });
  });

  // ===========================================================================
  // Event sending handlers
  // ===========================================================================
  describe('sendEvent', () => {
    it('should call methods with right params', async () => {
      const eventLogsClientPostSpy = jest.spyOn(axiosInstance, 'post');

      await service.sendEvent(mockFormSgProcessInitEvent);

      expect(eventLogsClientPostSpy).toBeCalledWith(EVENT_LOG_PATH, { event: mockFormSgProcessInitEvent });
    });
  });

  describe('sending specific events', () => {
    let sendEventSpy: jest.SpyInstance;

    beforeEach(() => {
      sendEventSpy = jest.spyOn(service, 'sendEvent');
      jest.useFakeTimers().setSystemTime(new Date(parseInt(mockTimestamp)));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    describe('sendProcessInitEvent', () => {
      it('should call sendEvent with right params', async () => {
        await service.sendProcessInitEvent(mockSubmissionId, mockTimestamp);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
          ids: [mockSubmissionId],
          processorStartedTimestamp: mockISOTimestamp,
          queueEventTimestamp: new Date(parseInt(mockTimestamp)).toISOString(),
        });
      });
    });

    describe('sendProcessSuccessEvent', () => {
      it('should call sendEvent with right params', async () => {
        const {
          application,
          transaction: { name: transactionName, recipients: requestRecipients },
          requestorEmail,
          files: requestFiles,
        } = mockSingleIssuanceFormData;
        const { recipients, notificationChannels, transactionUuid, files } = mockCreateTransactionResponse;

        await service.sendProcessSuccessEvent(mockSubmissionId, mockSingleIssuanceFormData, mockCreateTransactionResponse);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS,
          id: mockSubmissionId,
          application,
          notificationsToSendCount: recipients.length * notificationChannels.length,
          requestorEmail,
          timestamp: mockISOTimestamp,
          transaction: {
            uuid: transactionUuid,
            name: transactionName,
            agencyFileAssets: files.map(({ name, uuid }, index) => ({ name, uuid, deleteAt: requestFiles[index].deleteAt })),
            recipientActivities: recipients.map(({ activityUuid, uin, isNonSingpassRetrievable }, index) => {
              const { name, email, dob, contact } = requestRecipients[index];
              return {
                uuid: activityUuid,
                name,
                maskedUin: maskUin(uin),
                email,
                dob,
                contact,
                isNonSingpassRetrievable,
              };
            }),
          },
          transactionUuid: mockTransactionUuid,
        });
      });
    });

    describe('sendProcessFailureEvent', () => {
      it('should call sendEvent with right params', async () => {
        const mockFailure: FormSgProcessAuthDecryptFailure = {
          type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
          reason: mockFailureReason,
        };
        await service.sendProcessFailureEvent(mockSubmissionId, mockFailure);

        expect(sendEventSpy).toBeCalledWith({
          type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE,
          id: mockSubmissionId,
          timestamp: mockISOTimestamp,
          failure: mockFailure,
        });
      });
    });
  });

  // ===========================================================================
  // Error Handlers
  // ===========================================================================
  describe('createFileTransactionAxiosErrorHandler', () => {
    describe('when response status is 400 >= status < 500', () => {
      it('should call methods with right param when error is thrown by class-validator', async () => {
        const mockAxiosError = generateMockAxiosError(
          HttpStatus.BAD_REQUEST,
          EXCEPTION_ERROR_CODE.BAD_REQUEST,
          mockDeteleAtDateInputValidationError,
        );
        const errorData = mockAxiosError.response?.data.data;

        const constructErrorMessageFromAxiosResponseSpy = jest.spyOn(common, 'constructErrorMessageFromAxiosResponse');

        const mockFailSubTypes = [mockFailSubType];
        const transformValidationErrorsToFormSgSubTypesSpy = jest.spyOn(backendCommon, 'transformValidationErrorsToFormSgSubTypes');
        transformValidationErrorsToFormSgSubTypesSpy.mockReturnValueOnce(mockFailSubTypes);

        const transformValidationErrorsToErrorDataSpy = jest.spyOn(backendCommon, 'transformValidationErrorsToErrorData');

        const expectedErrorMessage = `${errorData.message} | ${JSON.stringify(transformValidationErrorsToErrorData(errorData.error))}`;

        expect(() => service.createFileTransactionAxiosErrorHandler(mockAxiosError)).toThrowError(
          new FormSgNonRetryableCreateTransactionError(
            expectedErrorMessage,
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            mockFailSubTypes.join(', '),
            undefined,
          ),
        );
        expect(constructErrorMessageFromAxiosResponseSpy).toBeCalledWith(mockAxiosError.response);
        expect(transformValidationErrorsToFormSgSubTypesSpy).toBeCalledWith(errorData.error);
        expect(transformValidationErrorsToErrorDataSpy).toBeCalledWith(errorData.error);
      });

      describe('when the error is not thrown by class-validator', () => {
        let mockAxiosError: AxiosError;
        let additionalErrorData: AdditionalCreateTransactionErrorData;
        let expectedErrorMessage: string;
        let errorToThrow: FormSgNonRetryableCreateTransactionError;

        let constructErrorMessageFromAxiosResponseSpy: jest.SpyInstance;
        let getFailCategoryFromErrorExceptionSpy: jest.SpyInstance;

        beforeEach(() => {
          constructErrorMessageFromAxiosResponseSpy = jest.spyOn(common, 'constructErrorMessageFromAxiosResponse');
          getFailCategoryFromErrorExceptionSpy = jest.spyOn(common, 'getFailCategoryFromErrorException');
        });

        afterEach(() => {
          expect(() => service.createFileTransactionAxiosErrorHandler(mockAxiosError)).toThrowError(errorToThrow);
          expect(constructErrorMessageFromAxiosResponseSpy).toBeCalledWith(mockAxiosError.response);
          expect(getFailCategoryFromErrorExceptionSpy).toBeCalledWith(mockAxiosError);

          try {
            throw errorToThrow;
          } catch (error: unknown) {
            expect((error as FormSgNonRetryableCreateTransactionError).additionalErrorData).toEqual(additionalErrorData);
          }
        });

        describe('when exception code is RECIPIENT_EMAIL_BLACKLISTED', () => {
          it('should throw FormSgNonRetryableCreateTransactionError and call methods with the right param', async () => {
            mockAxiosError = generateMockAxiosError(
              HttpStatus.BAD_REQUEST,
              EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED,
              mockRecipientEmailBlacklistedError,
            );

            additionalErrorData = {
              exceptionCode: EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED,
              blacklistedEmails: mockRecipientEmailBlacklistedError.blacklistedEmails,
            };

            expectedErrorMessage = constructErrorMessageFromAxiosResponse(mockAxiosError.response!);

            errorToThrow = new FormSgNonRetryableCreateTransactionError(
              expectedErrorMessage,
              COMPONENT_ERROR_CODE.FORMSG_SERVICE,
              FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED,
              additionalErrorData,
            );
          });
        });

        describe('when exception code is DUPLICATE_RECIPIENT_UINS', () => {
          it('should throw FormSgNonRetryableCreateTransactionError and call methods with the right param', async () => {
            mockAxiosError = generateMockAxiosError(
              HttpStatus.BAD_REQUEST,
              EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS,
              mockDuplicateRecipientUinsError,
            );

            additionalErrorData = {
              exceptionCode: EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS,
              duplicatedUins: mockDuplicateRecipientUinsError.duplicatedUins,
            };
            expectedErrorMessage = constructErrorMessageFromAxiosResponse(mockAxiosError.response!);

            errorToThrow = new FormSgNonRetryableCreateTransactionError(
              expectedErrorMessage,
              COMPONENT_ERROR_CODE.FORMSG_SERVICE,
              FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS,
              additionalErrorData,
            );
          });
        });

        describe('when exception code is DUPLICATE_FILE_NAMES', () => {
          it('should throw FormSgNonRetryableCreateTransactionError and call methods with the right param', async () => {
            mockAxiosError = generateMockAxiosError(
              HttpStatus.BAD_REQUEST,
              EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES,
              mockDuplicateFileNamesError,
            );

            additionalErrorData = {
              exceptionCode: EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES,
              duplicatedFileNames: mockDuplicateFileNamesError.duplicatedFileNames,
            };
            expectedErrorMessage = constructErrorMessageFromAxiosResponse(mockAxiosError.response!);

            errorToThrow = new FormSgNonRetryableCreateTransactionError(
              expectedErrorMessage,
              COMPONENT_ERROR_CODE.FORMSG_SERVICE,
              FORMSG_FAIL_CATEGORY.DUPLICATE_FILE_NAMES,
              additionalErrorData,
            );
          });
        });
      });
    });

    describe('when response status is NOT 400 >= status < 500', () => {
      it('should just throw FormSgCreateTransactionError', async () => {
        const mockAxiosError = generateMockAxiosError(HttpStatus.BAD_GATEWAY, EXCEPTION_ERROR_CODE.BAD_GATEWAY);

        expect(() => service.createFileTransactionAxiosErrorHandler(mockAxiosError)).toThrowError(
          new FormSgCreateTransactionError(
            mockAxiosErrorMessage,
            COMPONENT_ERROR_CODE.FORMSG_SERVICE,
            FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
          ),
        );
      });
    });
  });

  describe('generateCreateTransactionFailure', () => {
    let constructCreateTransactionFailureTransactionSpy: jest.SpyInstance;
    let formSgNonRetryableCreateTransactionErrorHandlerSpy: jest.SpyInstance;
    let normalFailureTransaction: Omit<FormSgProcessCreateTxnFailureTransaction, 'name'>;

    const { transaction, files, requestorEmail, application } = mockSingleIssuanceFormData;

    beforeEach(() => {
      constructCreateTransactionFailureTransactionSpy = jest.spyOn(service, 'constructCreateTransactionFailureTransaction');
      formSgNonRetryableCreateTransactionErrorHandlerSpy = jest.spyOn(service, 'formSgNonRetryableCreateTransactionErrorHandler');

      normalFailureTransaction = service.constructCreateTransactionFailureTransaction(transaction, files);
    });

    afterEach(() => {
      expect(constructCreateTransactionFailureTransactionSpy).toBeCalledWith(transaction, files);
    });

    it('should return correct failure object when error is NOT of type FormSgNonRetryableCreateTransactionError', async () => {
      const error = new FormSgCreateTransactionError(
        mockAxiosErrorMessage,
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
      );

      const { agencyFileAssets, recipientActivities } = normalFailureTransaction;
      const mockFailureTransaction: FormSgProcessCreateTxnFailureTransaction = {
        name: transaction.name,
        agencyFileAssets,
        recipientActivities,
      };

      const { formSgFailSubType: subType, message: reason } = error;
      const mockFailure: FormSgProcessCreateTxnFailure = {
        type: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN,
        requestorEmail,
        reason,
        subType,
        application,
        transaction: mockFailureTransaction,
      };

      expect(await service.generateCreateTransactionFailure(error, mockSingleIssuanceFormData)).toEqual(mockFailure);

      expect(formSgNonRetryableCreateTransactionErrorHandlerSpy).not.toBeCalled();
    });

    it('should call methods with the right params when error is of type FormSgNonRetryableCreateTransactionError', async () => {
      const error = new FormSgNonRetryableCreateTransactionError(
        'some message',
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED,
        { exceptionCode: EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED, blacklistedEmails: mockBlacklistedEmails },
      );

      const result = service.formSgNonRetryableCreateTransactionErrorHandler(error, transaction, files);

      const agencyFileAssets = result.agencyFileAssets.length > 0 ? result.agencyFileAssets : normalFailureTransaction.agencyFileAssets;
      const recipientActivities =
        result.recipientActivities.length > 0 ? result.recipientActivities : normalFailureTransaction.recipientActivities;

      const mockFailureTransaction: FormSgProcessCreateTxnFailureTransaction = {
        name: transaction.name,
        agencyFileAssets,
        recipientActivities,
      };

      const { formSgFailSubType: subType, message: reason } = error;
      const mockFailure: FormSgProcessCreateTxnFailure = {
        type: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN,
        requestorEmail,
        reason,
        subType,
        application,
        transaction: mockFailureTransaction,
      };

      expect(await service.generateCreateTransactionFailure(error, mockSingleIssuanceFormData)).toEqual(mockFailure);

      expect(formSgNonRetryableCreateTransactionErrorHandlerSpy).toBeCalledWith(error, transaction, files);
    });
  });

  describe('formSgNonRetryableCreateTransactionErrorHandler', () => {
    let reconstructRecipientActivitiesWithBlacklistedEmailsSpy: jest.SpyInstance;
    let reconstructRecipientActivitiesWithDuplicatedRecipientUinsSpy: jest.SpyInstance;
    let reconstructAgencyFileAssetsWithDuplicatedFileNamesSpy: jest.SpyInstance;

    beforeEach(() => {
      reconstructRecipientActivitiesWithBlacklistedEmailsSpy = jest.spyOn(service, 'reconstructRecipientActivitiesWithBlacklistedEmails');
      reconstructRecipientActivitiesWithDuplicatedRecipientUinsSpy = jest.spyOn(
        service,
        'reconstructRecipientActivitiesWithDuplicatedRecipientUins',
      );
      reconstructAgencyFileAssetsWithDuplicatedFileNamesSpy = jest.spyOn(service, 'reconstructAgencyFileAssetsWithDuplicatedFileNames');
    });

    it('should call methods with the right params when exceptionCode is RECIPIENT_EMAIL_BLACKLISTED', async () => {
      const { transaction, files } = mockSingleIssuanceFormData;

      const error = new FormSgNonRetryableCreateTransactionError(
        'some error message',
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED,
        { exceptionCode: EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED, blacklistedEmails: mockBlacklistedEmails },
      );

      service.formSgNonRetryableCreateTransactionErrorHandler(error, transaction, files);

      expect(reconstructRecipientActivitiesWithBlacklistedEmailsSpy).toBeCalledWith(
        mockBlacklistedEmails,
        FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED,
        transaction.recipients,
      );
      expect(reconstructRecipientActivitiesWithDuplicatedRecipientUinsSpy).not.toBeCalled();
      expect(reconstructAgencyFileAssetsWithDuplicatedFileNamesSpy).not.toBeCalled();
    });

    it('should call methods with the right params when exceptionCode is DUPLICATE_RECIPIENT_UINS', async () => {
      const { transaction, files } = mockSingleIssuanceFormData;

      const error = new FormSgNonRetryableCreateTransactionError(
        'some error message',
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS,
        { exceptionCode: EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS, duplicatedUins: mockDuplicatedUins },
      );

      service.formSgNonRetryableCreateTransactionErrorHandler(error, transaction, files);

      expect(reconstructRecipientActivitiesWithDuplicatedRecipientUinsSpy).toBeCalledWith(
        mockDuplicatedUins,
        FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS,
        transaction.recipients,
      );
      expect(reconstructRecipientActivitiesWithBlacklistedEmailsSpy).not.toBeCalled();
      expect(reconstructAgencyFileAssetsWithDuplicatedFileNamesSpy).not.toBeCalled();
    });

    it('should call methods with the right params when exceptionCode is DUPLICATE_FILE_NAMES', async () => {
      const { transaction, files } = mockSingleIssuanceFormData;

      const error = new FormSgNonRetryableCreateTransactionError(
        'some error message',
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.DUPLICATE_FILE_NAMES,
        { exceptionCode: EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES, duplicatedFileNames: mockDuplicatedFileNames },
      );

      service.formSgNonRetryableCreateTransactionErrorHandler(error, transaction, files);

      expect(reconstructAgencyFileAssetsWithDuplicatedFileNamesSpy).toBeCalledWith(
        mockDuplicatedFileNames,
        FORMSG_FAIL_CATEGORY.DUPLICATE_FILE_NAMES,
        files,
      );
      expect(reconstructRecipientActivitiesWithBlacklistedEmailsSpy).not.toBeCalled();
      expect(reconstructRecipientActivitiesWithDuplicatedRecipientUinsSpy).not.toBeCalled();
    });
  });

  describe('reconstructRecipientActivitiesWithBlacklistedEmails', () => {
    it('should only add failSubType and failedReason to the recipient object when the recipient email is in the blacklist', async () => {
      const recipientActivities = service.reconstructRecipientActivitiesWithBlacklistedEmails(
        mockBlacklistedEmails,
        FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED,
        mockSingleIssuanceFormData.transaction.recipients,
      );

      recipientActivities.forEach((activity) => {
        if (mockBlacklistedEmails.includes(activity.email!)) {
          expect(activity).toHaveProperty('failSubType', FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED);
          expect(activity).toHaveProperty('failedReason', 'Email is blacklisted');
        } else {
          expect(activity).not.toHaveProperty('failSubType', FORMSG_FAIL_CATEGORY.RECIPIENT_EMAIL_BLACKLISTED);
          expect(activity).not.toHaveProperty('failedReason', 'Email is blacklisted');
        }
      });
    });
  });

  describe('reconstructRecipientActivitiesWithDuplicatedRecipientUins', () => {
    it('should only add failSubType and failedReason to the recipient object when the recipient uin is in duplicate uin list', async () => {
      const recipientActivities = service.reconstructRecipientActivitiesWithDuplicatedRecipientUins(
        mockDuplicatedUins,
        FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS,
        mockSingleIssuanceFormData.transaction.recipients,
      );

      recipientActivities.forEach((activity, index) => {
        if (mockDuplicatedUins.includes(mockSingleIssuanceFormData.transaction.recipients[index].uin)) {
          expect(activity).toHaveProperty('failSubType', FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS);
          expect(activity).toHaveProperty('failedReason', 'Uin is duplicated');
        } else {
          expect(activity).not.toHaveProperty('failSubType', FORMSG_FAIL_CATEGORY.DUPLICATE_RECIPIENT_UINS);
          expect(activity).not.toHaveProperty('failedReason', 'Uin is duplicated');
        }
      });
    });
  });

  describe('reconstructAgencyFileAssetsWithDuplicatedFileNames', () => {
    it('should only add failSubType and failedReason to the recipient object when the file name is in duplicate file name list', async () => {
      const fileAssets = service.reconstructAgencyFileAssetsWithDuplicatedFileNames(
        mockDuplicatedFileNames,
        FORMSG_FAIL_CATEGORY.DUPLICATE_FILE_NAMES,
        mockSingleIssuanceFormData.files,
      );

      fileAssets.forEach((fileAsset) => {
        if (mockDuplicatedFileNames.includes(fileAsset.name)) {
          expect(fileAsset).toHaveProperty('failSubType', FORMSG_FAIL_CATEGORY.DUPLICATE_FILE_NAMES);
          expect(fileAsset).toHaveProperty('failedReason', 'File name is duplicated');
        } else {
          expect(fileAsset).not.toHaveProperty('failSubType', EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES);
          expect(fileAsset).not.toHaveProperty('failedReason', 'File name is duplicated');
        }
      });
    });
  });

  describe('generateFileUploadFailure', () => {
    const { files: requestFiles } = mockSingleIssuanceFormData;
    const { files } = mockCreateTransactionResponse;
    it('should return the correct failure object when error is not of type FormSgNonRetryableUploadFileError', async () => {
      const error = new FormSgUploadFileError('some error', COMPONENT_ERROR_CODE.FORMSG_SERVICE, EXCEPTION_ERROR_CODE.UNEXPECTED_ERROR);

      const { message: reason, formSgFailSubType: subType } = error;
      const { application, requestorEmail, transaction } = mockSingleIssuanceFormData;
      const { transactionUuid, recipients } = mockCreateTransactionResponse;

      const agencyFileAssets = files.map(({ name, uuid }, index) => ({ name, uuid, deleteAt: requestFiles[index].deleteAt }));

      const mockFailure: FormSgProcessFileUploadFailure = {
        type: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD,
        subType,
        application,
        transaction: {
          name: transaction.name,
          uuid: transactionUuid,
          agencyFileAssets,
          recipientActivities: recipients.map(({ activityUuid, uin }, index) => {
            const { name, email, dob, contact, isNonSingpassRetrievable } = transaction.recipients[index];
            return {
              uuid: activityUuid,
              name,
              maskedUin: maskUin(uin),
              email,
              dob,
              contact,
              isNonSingpassRetrievable,
            };
          }),
        },
        transactionUuid,
        reason,
        requestorEmail,
      };

      expect(await service.generateFileUploadFailure(error, mockSingleIssuanceFormData, mockCreateTransactionResponse)).toEqual(
        mockFailure,
      );
    });

    describe('when the error is of type FormSgNonRetryableUploadFileError', () => {
      describe('when the exceptionCode is of type FILE_UPLOAD_FAILED', () => {
        it('should add failSubType and failedReason to the file obj when the file name is in the unsupported file list', async () => {
          const subType = FORMSG_FAIL_CATEGORY.FILE_UPLOAD_FAILED;

          const error = new FormSgNonRetryableUploadFileError('some error', COMPONENT_ERROR_CODE.FORMSG_SERVICE, subType, {
            exceptionCode: EXCEPTION_ERROR_CODE.FILE_UPLOAD_FAILED,
            unsupportedTypeFileNames: mockUnsupportedTypeFileNames,
          });

          const agencyFileAssets = files.map(({ name, uuid }, index) => {
            const obj: FormSgProcessFileUploadFailureAgencyFileAsset = { name, uuid, deleteAt: requestFiles[index].deleteAt };

            if (mockUnsupportedTypeFileNames.includes(name)) {
              obj['failSubType'] = subType;
              obj['failedReason'] = 'File type is unsupported';
            }

            return obj;
          });

          const { message: reason } = error;
          const { application, requestorEmail, transaction } = mockSingleIssuanceFormData;
          const { transactionUuid, recipients } = mockCreateTransactionResponse;

          const mockFailure = {
            type: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD,
            subType,
            application,
            transaction: {
              name: transaction.name,
              uuid: transactionUuid,
              agencyFileAssets,
              recipientActivities: recipients.map(({ activityUuid, uin }, index) => {
                const { name, email, dob, contact, isNonSingpassRetrievable } = transaction.recipients[index];
                return {
                  uuid: activityUuid,
                  name,
                  maskedUin: maskUin(uin),
                  email,
                  dob,
                  contact,
                  isNonSingpassRetrievable,
                };
              }),
            },
            transactionUuid,
            reason,
            requestorEmail,
          };

          expect(await service.generateFileUploadFailure(error, mockSingleIssuanceFormData, mockCreateTransactionResponse)).toEqual(
            mockFailure,
          );
        });
      });
    });
  });
});
