import {
  EVENT_LOGGING_EVENTS,
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgProcessAuthDecryptFailure,
  FormSgProcessCreateTxnFailure,
  FormSgProcessCreateTxnFailureAgencyFileAsset,
  FormSgProcessCreateTxnFailureRecipientActivity,
  FormSgProcessCreateTxnFailureTransaction,
  FormSgProcessFailureEvent,
  FormSgProcessFileUploadFailure,
  FormSgProcessFileUploadFailureAgencyFileAsset,
  FormSgProcessInitEvent,
  FormSgProcessOthersFailure,
  FormSgProcessSuccessEvent,
  generateChecksum,
  isClassValidatorErrors,
  maskUin,
  transformValidationErrorsToErrorData,
  transformValidationErrorsToFormSgSubTypes,
} from '@filesg/backend-common';
import {
  COMPONENT_ERROR_CODE,
  constructErrorMessageFromAxiosResponse,
  CreateFormSgFileTransactionRequest,
  CreateFormSgFileTransactionResponse,
  EXCEPTION_ERROR_CODE,
  File,
  FilesUploadRequest,
  FORMSG_FAIL_CATEGORY,
  getExceptionCodeFromErrorException,
  getFailCategoryFromErrorException,
} from '@filesg/common';
import { FormField, FormSgDecryptionError, FormSgIdMismatchError, FormSgService, FormSgWebhookAuthenticationError } from '@filesg/formsg';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DecryptedAttachments } from '@opengovsg/formsg-sdk/dist/types';
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { plainToClass } from 'class-transformer';

import {
  AdditionalCreateTransactionErrorData,
  AdditionalUploadFileErrorData,
  FormSgCreateTransactionError,
  FormSgNonRetryableCreateTransactionError,
  FormSgNonRetryableUploadFileError,
  FormSgUploadFileError,
} from '../../../../common/custom-exceptions';
import {
  CORE_API_CLIENT_PROVIDER,
  CREATE_SINGLE_ISSUANCE_TRANSACTION_PATH,
  EVENT_LOG_PATH,
  EVENT_LOGS_API_CLIENT_PROVIDER,
  FILE_UPLOAD_PATH,
  FORMSG_SINGLE_ISSUANCE_FORM_SECRET_NAME,
  SECRET_MANAGER_FSG_APP_PREFIX,
  TRANSFER_API_CLIENT_PROVIDER,
} from '../../../../const';
import { SINGLE_ISSUANCE_FORM_FIELD, SINGLE_ISSUANCE_QUESTION_FIELD_MAP } from '../../../../const/formsg-question-field-map';
import {
  FormSgSqsRecord,
  IssuanceFileRecord,
  IssuanceRecipientRecord,
  SingleIssuanceFormData,
  SingleIssuanceTransactionRecord,
} from '../../../../typings';
import { formUtils } from '../../../../utils';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { SmService } from '../../aws/sm.service';

@Injectable()
export class SingleIssuanceFormService {
  private readonly logger = new Logger(SingleIssuanceFormService.name);
  private formUtitlsWithInjects;
  private getSingleIssuanceFieldId;
  private getSingleIssuanceFormResponse;

  constructor(
    private readonly fileSgConfigService: FileSGConfigService,
    private readonly smService: SmService,
    private readonly formSgService: FormSgService,
    @Inject(CORE_API_CLIENT_PROVIDER)
    private readonly coreServiceClient: AxiosInstance,
    @Inject(TRANSFER_API_CLIENT_PROVIDER)
    private readonly transferServiceClient: AxiosInstance,
    @Inject(EVENT_LOGS_API_CLIENT_PROVIDER)
    private readonly eventLogsServiceClient: AxiosInstance,
  ) {
    this.formUtitlsWithInjects = formUtils(
      this.fileSgConfigService.formSGConfig.formSgSingleIssuanceFormId,
      SINGLE_ISSUANCE_QUESTION_FIELD_MAP,
    );
    this.getSingleIssuanceFieldId = this.formUtitlsWithInjects.getFieldId;
    this.getSingleIssuanceFormResponse = this.formUtitlsWithInjects.getFormResponse;
  }

  public async singleIssuanceFormHandler(queueEventRecord: FormSgSqsRecord) {
    let createFileTransactionRequestData: SingleIssuanceFormData;
    let createFileTransactionResponse: CreateFormSgFileTransactionResponse;

    const formData = queueEventRecord.parsedBodyData!;
    const { submissionId, formId } = formData;

    const taskMessage = `Creating FormSG single issuance for form submission id: ${submissionId}`;
    this.logger.log(taskMessage);

    try {
      const { env } = this.fileSgConfigService.systemConfig;
      const { formSgSingleIssuanceFormId, formSgSingleIssuanceWebhookUrl } = this.fileSgConfigService.formSGConfig;
      const { formsgSignature } = queueEventRecord.parsedMessageAttributes!;

      // broadcast process init event data
      await this.sendProcessInitEvent(submissionId, queueEventRecord.attributes.SentTimestamp);

      // validate form id & auth webhook
      this.formSgService.validateFormId(formId, formSgSingleIssuanceFormId);
      this.formSgService.authenticateWebhook(formsgSignature!, formSgSingleIssuanceWebhookUrl);

      const formSecretKey = `${SECRET_MANAGER_FSG_APP_PREFIX}/${env}/${FORMSG_SINGLE_ISSUANCE_FORM_SECRET_NAME}`;
      const formSgSingleIssuanceFormSecret = await this.smService.getSecretValue(formSecretKey);

      // transform message to formsg creation request
      const { content: formContent, attachments: formAttachments } = await this.formSgService.decryptFormDataWithAttachments(
        formData,
        formSgSingleIssuanceFormSecret,
      );

      const { responses: formResponses } = formContent;
      const issuanceFormData = this.processFormData(formResponses, formAttachments);

      // send create transaction request
      createFileTransactionRequestData = plainToClass(SingleIssuanceFormData, issuanceFormData, { exposeUnsetFields: false });

      createFileTransactionResponse = await this.createFileTransaction(createFileTransactionRequestData);

      const files: File[] = issuanceFormData.files.map((file, index) => {
        const fileBase64 = Buffer.from(this.getAttachmentByIndex(index, formAttachments)!).toString('base64');
        return {
          fileName: file.name,
          isOA: false,
          fileData: fileBase64,
        };
      });

      // upload file to server
      await this.uploadFileToServer(files, createFileTransactionResponse);

      await this.sendProcessSuccessEvent(submissionId, createFileTransactionRequestData, createFileTransactionResponse);

      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error: unknown) {
      const { submissionId } = queueEventRecord.parsedBodyData!;

      // broadcast process failure event data
      switch (true) {
        case error instanceof FormSgWebhookAuthenticationError:
        case error instanceof FormSgIdMismatchError:
        case error instanceof FormSgDecryptionError:
          await this.sendProcessFailureEvent(submissionId, {
            type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
            reason: (error as Error).message,
          });
          break;

        case error instanceof FormSgNonRetryableCreateTransactionError:
        case error instanceof FormSgCreateTransactionError: {
          const failure = this.generateCreateTransactionFailure(error, createFileTransactionRequestData!);

          await this.sendProcessFailureEvent(submissionId, failure);
          break;
        }

        case error instanceof FormSgNonRetryableUploadFileError:
        case error instanceof FormSgUploadFileError: {
          const failure = this.generateFileUploadFailure(
            error as FormSgNonRetryableUploadFileError | FormSgUploadFileError,
            createFileTransactionRequestData!,
            createFileTransactionResponse!,
          );

          await this.sendProcessFailureEvent(submissionId, failure);
          break;
        }

        default:
          await this.sendProcessFailureEvent(submissionId, {
            type: FORMSG_PROCESS_FAIL_TYPE.OTHERS,
            reason: (error as Error).message,
          });
          break;
      }

      // rethrow error
      const errorMessage = (error as Error).message ?? JSON.stringify(error);
      this.logger.warn(`[Failed] ${taskMessage}, error: ${errorMessage}`);

      throw error;
    }
  }

  // ===========================================================================
  // Form data parsing
  // ===========================================================================
  protected processFormData(responses: FormField[], attachments: DecryptedAttachments) {
    return {
      requestorEmail: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.AGENCY_OFFICER_EMAIL)!,
      application: {
        externalRefId: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.EXTERNAL_REF_ID),
        type: this.getApplicationType(responses),
      },
      transaction: {
        name: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.TRANSACTION_NAME)!,
        longCustomMessage: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.LONG_CUSTOM_MESSAGE)!,
        recipients: this.createRecipientsObject(responses),
      },
      files: this.createTransactionFilesObject(responses, attachments),
    };
  }

  protected createRecipientsObject(responses: FormField[]) {
    return [
      {
        name: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.RECIPIENT_ONE_NAME)!,
        uin: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.RECIPIENT_ONE_UIN)!,
        email: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.RECIPIENT_ONE_EMAIL)!,
        contact: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.RECIPIENT_ONE_CONTACT),
        dob: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.RECIPIENT_ONE_DATE_OF_BIRTH),
        isNonSingpassRetrievable: this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.IS_NON_SINGPASS_RETRIEVAL),
      },
    ];
  }

  protected createTransactionFilesObject(responses: FormField[], attachments: DecryptedAttachments) {
    const firstFile = attachments[this.getSingleIssuanceFieldId(SINGLE_ISSUANCE_FORM_FIELD.FILE_ONE)];
    const secondFile = attachments[this.getSingleIssuanceFieldId(SINGLE_ISSUANCE_FORM_FIELD.FILE_TWO)];

    const deleteAt = this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.FILE_DELETE_AT);
    const fileObjects = [
      {
        name: firstFile ? firstFile.filename : '',
        deleteAt,
        checksum: firstFile ? generateChecksum(firstFile.content) : '',
      },
    ];

    if (secondFile) {
      fileObjects.push({
        name: secondFile ? secondFile.filename : '',
        deleteAt,
        checksum: secondFile ? generateChecksum(secondFile.content) : '',
      });
    }

    return fileObjects;
  }

  /**
   * Application Type values in the form are written as this format `<Agency Code> - <ApplicationType Code>`
   * This method returns the application type code
   */
  protected getApplicationType(responses: FormField[]): string {
    const agencyCodeApplicationTypeString = this.getSingleIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.APPLICATION_TYPE)!;
    return agencyCodeApplicationTypeString.split(' - ')[1];
  }

  protected getAttachmentByIndex(index: number, attachments: DecryptedAttachments) {
    // Manual mapping for index to file in formsg
    if (index === 0) {
      return attachments[this.getSingleIssuanceFieldId(SINGLE_ISSUANCE_FORM_FIELD.FILE_ONE)].content;
    }
    if (index === 1) {
      return attachments[this.getSingleIssuanceFieldId(SINGLE_ISSUANCE_FORM_FIELD.FILE_TWO)].content;
    }
    return null;
  }

  // ===========================================================================
  // Transaction process handlers
  // ===========================================================================
  public async createFileTransaction(issuanceFormData: SingleIssuanceFormData, id?: string): Promise<CreateFormSgFileTransactionResponse> {
    const taskMessage = `Calling service-core - creating file transaction${id ? ' for id: ' + id : ''}`;
    this.logger.log(taskMessage);

    try {
      const { data } = await this.coreServiceClient.post<
        { data: CreateFormSgFileTransactionResponse },
        AxiosResponse<{ data: CreateFormSgFileTransactionResponse }>,
        CreateFormSgFileTransactionRequest
      >(CREATE_SINGLE_ISSUANCE_TRANSACTION_PATH, issuanceFormData);

      this.logger.log(`[Success] ${taskMessage}`);
      return data.data;
    } catch (error: unknown) {
      this.logger.warn(`[Failed] ${taskMessage}`);

      // Handle the error return from the server responded with a status code
      if (axios.isAxiosError(error)) {
        this.createFileTransactionAxiosErrorHandler(error);
      }

      // Handle the error when the request was made but no response was received
      // or any other error
      const errorMessage = (error as Error).message || JSON.stringify(error);
      this.logger.warn(`Create transaction error encountered: ${errorMessage}`);
      throw new FormSgCreateTransactionError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE, FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR);
    }
  }

  public async uploadFileToServer(files: File[], fileTransaction: CreateFormSgFileTransactionResponse, id?: string): Promise<void> {
    const taskMessage = `Calling service-transfer - uploading filen${id ? ' for id: ' + id : ''}`;
    this.logger.log(taskMessage);

    try {
      await this.transferServiceClient.post<string, AxiosResponse<string>, FilesUploadRequest>(
        FILE_UPLOAD_PATH,
        { files },
        {
          headers: {
            Authorization: `Bearer ${fileTransaction.accessToken}`,
          },
        },
      );

      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error: any) {
      this.logger.warn(`[Failed] ${taskMessage}`);

      if (axios.isAxiosError(error)) {
        this.uploadFileToServerAxiosErrorHandler(error);
      }

      // Handle the error when the request was made but no response was received
      // or any other error
      const errorMessage = error.message ?? JSON.stringify(error);
      this.logger.warn(`Create transaction error encountered: ${errorMessage}`);
      throw new FormSgUploadFileError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE, FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR);
    }
  }

  // ===========================================================================
  // Event sending handlers
  // ===========================================================================
  protected async sendEvent(event: FormSgProcessInitEvent | FormSgProcessSuccessEvent | FormSgProcessFailureEvent): Promise<void> {
    try {
      await this.eventLogsServiceClient.post(EVENT_LOG_PATH, { event });
    } catch (error: any) {
      const errorMessage = error?.message ? error.message : JSON.stringify(error);
      this.logger.warn(
        `sendEvent Error: ${errorMessage}, form id: ${event instanceof FormSgProcessInitEvent ? event.ids.join(',') : event.id}`,
      );
    }
  }

  public async sendProcessInitEvent(submissionId: string, queueEventRecordSentTimestamp: string): Promise<void> {
    await this.sendEvent({
      type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
      ids: [submissionId],
      processorStartedTimestamp: new Date().toISOString(),
      queueEventTimestamp: new Date(parseInt(queueEventRecordSentTimestamp)).toISOString(),
    });
  }

  protected async sendProcessSuccessEvent(
    submissionId: string,
    createFileTransactionRequestData: SingleIssuanceFormData,
    createFileTransactionResponse: CreateFormSgFileTransactionResponse,
  ): Promise<void> {
    const {
      application,
      transaction: { name: transactionName, recipients: requestRecipients },
      requestorEmail,
      files: requestFiles,
    } = createFileTransactionRequestData;
    const { recipients, notificationChannels, transactionUuid, files } = createFileTransactionResponse;

    await this.sendEvent({
      type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS,
      id: submissionId,
      application,
      notificationsToSendCount: recipients.length * notificationChannels.length,
      requestorEmail,
      timestamp: new Date().toISOString(),
      transaction: {
        uuid: transactionUuid,
        name: transactionName,
        agencyFileAssets: files.map(({ name, uuid }, index) => ({ name, uuid, deleteAt: requestFiles[index].deleteAt })),
        recipientActivities: recipients.map(({ activityUuid, uin }, index) => {
          const { name, email, dob, contact } = requestRecipients[index];
          return { uuid: activityUuid, name, maskedUin: maskUin(uin), email, dob, contact, isNonSingpassRetrievable: !!dob && !!contact };
        }),
      },
      transactionUuid: createFileTransactionResponse.transactionUuid,
    });
  }

  public async sendProcessFailureEvent(
    submissionId: string,
    failure: FormSgProcessAuthDecryptFailure | FormSgProcessCreateTxnFailure | FormSgProcessFileUploadFailure | FormSgProcessOthersFailure,
  ): Promise<void> {
    await this.sendEvent({
      type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE,
      id: submissionId,
      timestamp: new Date().toISOString(),
      failure,
    });
  }

  // ===========================================================================
  // Error Handlers
  // ===========================================================================
  protected createFileTransactionAxiosErrorHandler(error: AxiosError<any, any>): void {
    const { response: errorResponse } = error;

    if (errorResponse) {
      let additionalErrorData: AdditionalCreateTransactionErrorData | undefined = undefined;

      const errorData = errorResponse.data.data;
      let errorMessage = constructErrorMessageFromAxiosResponse(errorResponse);

      if (errorResponse.status >= 400 && errorResponse.status < 500) {
        let subType: string | undefined = undefined;

        const exceptionCode = getExceptionCodeFromErrorException(error);

        if (isClassValidatorErrors(errorData.error) && errorResponse.status === 400 && exceptionCode === EXCEPTION_ERROR_CODE.BAD_REQUEST) {
          subType = transformValidationErrorsToFormSgSubTypes(errorData.error).join(', ');
          errorMessage = `${errorData.message} | ${JSON.stringify(transformValidationErrorsToErrorData(errorData.error))}`;
        } else {
          subType = getFailCategoryFromErrorException(error) ?? FORMSG_FAIL_CATEGORY.CRITICAL_ERROR;

          if (exceptionCode) {
            switch (exceptionCode) {
              case EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED: {
                additionalErrorData = { exceptionCode, blacklistedEmails: errorData.error['blacklistedEmails'] };
                break;
              }

              case EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS: {
                additionalErrorData = { exceptionCode, duplicatedUins: errorData.error['duplicatedUins'] };
                break;
              }

              case EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES: {
                additionalErrorData = { exceptionCode, duplicatedFileNames: errorData.error['duplicatedFileNames'] };
              }
            }
          }
        }

        this.logger.warn(`Create transaction error encountered: ${errorMessage}`);
        throw new FormSgNonRetryableCreateTransactionError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE, subType, additionalErrorData);
      }

      this.logger.warn(`Create transaction error encountered: ${errorMessage}`);
      throw new FormSgCreateTransactionError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE, FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR);
    }
  }

  protected uploadFileToServerAxiosErrorHandler(error: AxiosError<any, any>) {
    // Handle the error return from the server responded with a status code
    const { response: errorResponse } = error;

    if (errorResponse) {
      let additionalErrorData: AdditionalUploadFileErrorData | undefined = undefined;

      const errorData = errorResponse.data.data;

      const errorMessage = constructErrorMessageFromAxiosResponse(errorResponse);
      this.logger.warn(`Create transaction error encountered: ${errorMessage}`);

      if (errorResponse.status >= 400 && errorResponse.status < 500) {
        const exceptionCode = getExceptionCodeFromErrorException(error);
        const subType = getFailCategoryFromErrorException(error);

        if (exceptionCode === EXCEPTION_ERROR_CODE.FILE_UPLOAD_FAILED) {
          additionalErrorData = { exceptionCode, unsupportedTypeFileNames: errorData['unsupportedTypeFileNames'] };
        }

        throw new FormSgNonRetryableUploadFileError(
          errorMessage,
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
          subType ?? FORMSG_FAIL_CATEGORY.CRITICAL_ERROR,
          additionalErrorData,
        );
      }

      throw new FormSgUploadFileError(errorMessage, COMPONENT_ERROR_CODE.FORMSG_SERVICE, FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR);
    }
  }

  public generateCreateTransactionFailure(
    error: unknown,
    createFileTransactionRequestData: SingleIssuanceFormData,
  ): FormSgProcessCreateTxnFailure {
    const { transaction, files, requestorEmail, application } = createFileTransactionRequestData;

    let agencyFileAssets: FormSgProcessCreateTxnFailureAgencyFileAsset[] = [];
    let recipientActivities: FormSgProcessCreateTxnFailureRecipientActivity[] = [];

    const result = this.constructCreateTransactionFailureTransaction(transaction, files);
    agencyFileAssets = result.agencyFileAssets;
    recipientActivities = result.recipientActivities;

    if (error instanceof FormSgNonRetryableCreateTransactionError) {
      const result = this.formSgNonRetryableCreateTransactionErrorHandler(error, transaction, files);
      agencyFileAssets = result.agencyFileAssets.length > 0 ? result.agencyFileAssets : agencyFileAssets;
      recipientActivities = result.recipientActivities.length > 0 ? result.recipientActivities : recipientActivities;
    }

    const { formSgFailSubType: subType, message: reason } = error as
      | FormSgNonRetryableCreateTransactionError
      | FormSgCreateTransactionError;

    const failureTransaction: FormSgProcessCreateTxnFailureTransaction = { name: transaction.name, agencyFileAssets, recipientActivities };

    return {
      type: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN,
      requestorEmail,
      reason,
      subType,
      application,
      transaction: failureTransaction,
    };
  }

  protected formSgNonRetryableCreateTransactionErrorHandler(
    error: FormSgNonRetryableCreateTransactionError,
    transaction: SingleIssuanceTransactionRecord,
    files: IssuanceFileRecord[],
  ): Omit<FormSgProcessCreateTxnFailureTransaction, 'name'> {
    let agencyFileAssets: FormSgProcessCreateTxnFailureAgencyFileAsset[] = [];
    let recipientActivities: FormSgProcessCreateTxnFailureRecipientActivity[] = [];

    if (error.additionalErrorData) {
      const { formSgFailSubType, additionalErrorData } = error;

      switch (additionalErrorData.exceptionCode) {
        case EXCEPTION_ERROR_CODE.RECIPIENT_EMAIL_BLACKLISTED: {
          const { blacklistedEmails } = additionalErrorData;
          recipientActivities = this.reconstructRecipientActivitiesWithBlacklistedEmails(
            blacklistedEmails,
            formSgFailSubType,
            transaction.recipients,
          );
          break;
        }

        case EXCEPTION_ERROR_CODE.DUPLICATE_RECIPIENT_UINS: {
          const { duplicatedUins } = additionalErrorData;
          recipientActivities = this.reconstructRecipientActivitiesWithDuplicatedRecipientUins(
            duplicatedUins,
            formSgFailSubType,
            transaction.recipients,
          );
          break;
        }

        case EXCEPTION_ERROR_CODE.DUPLICATE_FILE_NAMES: {
          const { duplicatedFileNames } = additionalErrorData;
          agencyFileAssets = this.reconstructAgencyFileAssetsWithDuplicatedFileNames(duplicatedFileNames, formSgFailSubType, files);
          break;
        }

        default: {
          this.logger.log('shoud nt be reaching here');
          break;
        }
      }
    }

    return { agencyFileAssets, recipientActivities };
  }

  protected constructCreateTransactionFailureTransaction(
    transaction: SingleIssuanceTransactionRecord,
    files: IssuanceFileRecord[],
  ): Omit<FormSgProcessCreateTxnFailureTransaction, 'name'> {
    const agencyFileAssets: FormSgProcessCreateTxnFailureAgencyFileAsset[] = files.map(({ name, deleteAt }) => ({ name, deleteAt }));

    const recipientActivities: FormSgProcessCreateTxnFailureRecipientActivity[] = transaction.recipients.map(
      ({ uin, name, email, dob, contact }) => ({
        name,
        maskedUin: maskUin(uin),
        email,
        dob,
        contact,
        isNonSingpassRetrievable: !!dob && !!contact,
      }),
    );

    return { agencyFileAssets, recipientActivities };
  }

  protected reconstructRecipientActivitiesWithBlacklistedEmails(
    blacklistedEmails: string[],
    formSgFailSubType: string,
    recipients: IssuanceRecipientRecord[],
  ): FormSgProcessCreateTxnFailureRecipientActivity[] {
    return recipients.map(({ uin, name, email, dob, contact }) => {
      const obj: FormSgProcessCreateTxnFailureRecipientActivity = {
        name,
        maskedUin: maskUin(uin),
        email,
        dob,
        contact,
        isNonSingpassRetrievable: !!dob && !!contact,
      };

      if (blacklistedEmails.includes(email)) {
        obj['failSubType'] = formSgFailSubType;
        obj['failedReason'] = 'Email is blacklisted';
      }

      return obj;
    });
  }

  protected reconstructRecipientActivitiesWithDuplicatedRecipientUins(
    duplicatedUins: string[],
    formSgFailSubType: string,
    recipients: IssuanceRecipientRecord[],
  ): FormSgProcessCreateTxnFailureRecipientActivity[] {
    return recipients.map(({ uin, name, email, dob, contact }) => {
      const obj: FormSgProcessCreateTxnFailureRecipientActivity = {
        name,
        maskedUin: maskUin(uin),
        email,
        dob,
        contact,
        isNonSingpassRetrievable: !!dob && !!contact,
      };

      if (duplicatedUins.includes(uin)) {
        obj['failSubType'] = formSgFailSubType;
        obj['failedReason'] = 'Uin is duplicated';
      }

      return obj;
    });
  }

  protected reconstructAgencyFileAssetsWithDuplicatedFileNames(
    duplicatedFileNames: string[],
    formSgFailSubType: string,
    files: IssuanceFileRecord[],
  ): FormSgProcessCreateTxnFailureAgencyFileAsset[] {
    return files.map(({ name, deleteAt }) => {
      const obj: FormSgProcessCreateTxnFailureAgencyFileAsset = { name, deleteAt };

      if (duplicatedFileNames.includes(name)) {
        obj['failSubType'] = formSgFailSubType;
        obj['failedReason'] = 'File name is duplicated';
      }

      return obj;
    });
  }

  public generateFileUploadFailure(
    error: unknown,
    createFileTransactionRequestData: SingleIssuanceFormData,
    createFileTransactionResponse: CreateFormSgFileTransactionResponse,
  ): FormSgProcessFileUploadFailure {
    const { files: requestFiles, application, transaction, requestorEmail } = createFileTransactionRequestData!;
    const { files } = createFileTransactionResponse!;

    let agencyFileAssets: FormSgProcessFileUploadFailureAgencyFileAsset[] = [];
    agencyFileAssets = files.map(({ name, uuid }, index) => ({ name, uuid, deleteAt: requestFiles[index].deleteAt }));

    if (error instanceof FormSgNonRetryableUploadFileError && error.additionalErrorData) {
      const { formSgFailSubType, additionalErrorData } = error;

      if (additionalErrorData.exceptionCode === EXCEPTION_ERROR_CODE.FILE_UPLOAD_FAILED) {
        agencyFileAssets = files.map(({ name, uuid }, index) => {
          const obj: FormSgProcessFileUploadFailureAgencyFileAsset = { name, uuid, deleteAt: requestFiles[index].deleteAt };

          if (additionalErrorData.unsupportedTypeFileNames.includes(name)) {
            obj['failSubType'] = formSgFailSubType;
            obj['failedReason'] = 'File type is unsupported';
          }

          return obj;
        });
      }
    }

    const { formSgFailSubType: subType, message: reason } = error as FormSgNonRetryableUploadFileError | FormSgUploadFileError;
    const { recipients, transactionUuid } = createFileTransactionResponse;

    return {
      type: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD,
      subType,
      application,
      transaction: {
        uuid: transactionUuid,
        name: transaction.name,
        agencyFileAssets,
        recipientActivities: recipients.map(({ activityUuid, uin }, index) => {
          const { name, email, dob, contact } = transaction.recipients[index];
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
      transactionUuid,
      reason,
      requestorEmail,
    };
  }
}
