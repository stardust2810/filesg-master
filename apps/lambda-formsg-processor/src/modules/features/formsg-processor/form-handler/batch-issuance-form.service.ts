import {
  checkForMissingFilesInDir,
  convertCsvToJson,
  createDir,
  EVENT_LOGGING_EVENTS,
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgBatchProcessCompleteEvent,
  FormSgBatchProcessFailureEvent,
  FormSgBatchProcessTransactionFailureEvent,
  FormSgBatchProcessTransactionSuccessEvent,
  FormSgBatchProcessUpdateEvent,
  FormSgProcessBatchCreateTxnFailure,
  FormSgProcessBatchFileUploadFailure,
  FormSgProcessFailureEvent,
  FormSgProcessInitEvent,
  generateChecksum,
  listDirContent,
  maskUin,
  rmDir,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, CreateFormSgFileTransactionResponse, File, FORMSG_FAIL_CATEGORY } from '@filesg/common';
import { FormField, FormSgDecryptionError, FormSgIdMismatchError, FormSgService, FormSgWebhookAuthenticationError } from '@filesg/formsg';
import { UnzipService } from '@filesg/zipper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { DecryptedAttachments } from '@opengovsg/formsg-sdk/dist/types';
import { AxiosInstance } from 'axios';
import { plainToClass } from 'class-transformer';
import { fromBuffer } from 'file-type';
import { existsSync, readFileSync } from 'fs';
import { v4 } from 'uuid';

import {
  BatchIssuancePackageZipFileException,
  FormSgCreateTransactionError,
  FormSgNonRetryableCreateTransactionError,
  FormSgNonRetryableUploadFileError,
  FormSgUploadFileError,
} from '../../../../common/custom-exceptions';
import {
  EVENT_LOG_PATH,
  EVENT_LOGS_API_CLIENT_PROVIDER,
  FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_KEY,
  FORMSG_BATCH_ISSUANCE_FORM_SECRET_NAME,
  SECRET_MANAGER_FSG_APP_PREFIX,
} from '../../../../const';
import {
  DOWNLOAD_DIR,
  LOCAL_EXTRACTED_SUBPATH,
  TRANSACTIONS_SIDECAR_FILENAME,
  TRANSACTIONS_SIDECAR_HEADERS,
} from '../../../../const/batch-issuance';
import {
  BATCH_ISSUANCE_FORM_FIELD,
  BATCH_ISSUANCE_QUESTION_FIELD_MAP,
  SINGLE_ISSUANCE_FORM_FIELD,
} from '../../../../const/formsg-question-field-map';
import {
  BatchIssuanceSidecarData,
  BatchIssuanceSingleTransactionData,
  FormSgSqsRecord,
  IssuanceFileRecord,
  IssuanceRecipientRecord,
  PreParsedCreateTransactionRequestData,
  SingleIssuanceFormData,
} from '../../../../typings';
import { formUtils } from '../../../../utils';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { SmService } from '../../aws/sm.service';
import { SingleIssuanceFormService } from './single-issuance-form.service';

export interface FileMetadata {
  checksum: string;
  base64: string;
}

export type FileMap = Record<string, FileMetadata>;

// =============================================================================
// Consts for processing transactions
// =============================================================================
export const MAX_ALLOWED_TRANSACTION_COUNT = 20;
const CONCURRENT_TRANSACTION_PROCESS_COUNT = 10;

@Injectable()
export class BatchIssuanceFormService {
  private readonly logger = new Logger(BatchIssuanceFormService.name);
  private formUtitlsWithInjects;
  private getBatchIssuanceFieldId;
  private getBatchIssuanceFormResponse;

  constructor(
    private readonly fileSgConfigService: FileSGConfigService,
    private readonly smService: SmService,
    private readonly formSgService: FormSgService,
    @Inject(EVENT_LOGS_API_CLIENT_PROVIDER)
    private readonly eventLogsServiceClient: AxiosInstance,
    private readonly unzipService: UnzipService,
    private readonly singleTransactionFormService: SingleIssuanceFormService,
  ) {
    this.formUtitlsWithInjects = formUtils(
      this.fileSgConfigService.formSGConfig.formSgBatchIssuanceFormId,
      BATCH_ISSUANCE_QUESTION_FIELD_MAP,
    );
    this.getBatchIssuanceFieldId = this.formUtitlsWithInjects.getFieldId;
    this.getBatchIssuanceFormResponse = this.formUtitlsWithInjects.getFormResponse;
  }

  public async batchIssuanceFormHandler(queueEventRecord: FormSgSqsRecord) {
    const formData = queueEventRecord.parsedBodyData!;
    const { submissionId, formId } = formData;
    let requestorEmail: string | undefined = undefined;

    const taskMessage = `Creating FormSG batch issuance for form submission id: ${submissionId}`;
    this.logger.log(taskMessage);

    const paths = this.generateFilePaths(submissionId);

    try {
      const { formSgBatchIssuanceFormId, formSgBatchIssuanceWebhookUrl } = this.fileSgConfigService.formSGConfig;
      const { formsgSignature } = queueEventRecord.parsedMessageAttributes!;

      // broadcast process init event data
      await this.singleTransactionFormService.sendProcessInitEvent(submissionId, queueEventRecord.attributes.SentTimestamp);

      // validate form id & auth webhook
      this.formSgService.validateFormId(formId, formSgBatchIssuanceFormId);
      this.formSgService.authenticateWebhook(formsgSignature!, formSgBatchIssuanceWebhookUrl);

      const { formSgBatchIssuanceFormSecret } = await this.fetchAndPreCacheSecrets();

      // Decrypt form response
      const { content: formContent, attachments: formAttachments } = await this.formSgService.decryptFormDataWithAttachments(
        formData,
        formSgBatchIssuanceFormSecret,
      );

      // Process form response
      const { responses: formResponses } = formContent;
      const issuanceFormData = this.processFormData(formResponses);
      requestorEmail = issuanceFormData.requestorEmail;

      // Validate package zip file
      const { sidecarDataList, fileMap } = await this.processPackageZipFile(formAttachments, paths);

      const batchIssuanceSingleTransactionDataList = this.generateTransactionRequestsInfo(
        issuanceFormData,
        sidecarDataList,
        fileMap,
        submissionId,
      );

      // Update batch record with notification counts
      await this.sendEvent({
        type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE,
        id: submissionId,
        requestorEmail,
        batchSize: batchIssuanceSingleTransactionDataList.length,
      });

      // Create all txn init records
      await this.sendEvent({
        type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
        ids: batchIssuanceSingleTransactionDataList.map(({ id }) => id),
        processorStartedTimestamp: new Date().toISOString(),
        queueEventTimestamp: new Date(parseInt(queueEventRecord.attributes.SentTimestamp)).toISOString(),
        batchId: submissionId,
      });

      let next = true;
      let startIndex = 0;
      let endIndex = CONCURRENT_TRANSACTION_PROCESS_COUNT;
      while (next) {
        if (endIndex >= batchIssuanceSingleTransactionDataList.length) {
          endIndex = batchIssuanceSingleTransactionDataList.length;
          next = false;
        }

        const transactionsToProcess = batchIssuanceSingleTransactionDataList.slice(startIndex, endIndex);
        await Promise.allSettled(
          transactionsToProcess.map((singleTransactionData) => this.issuanceHandler(singleTransactionData, fileMap)),
        );

        startIndex = endIndex;
        endIndex = endIndex + CONCURRENT_TRANSACTION_PROCESS_COUNT;
      }

      await this.sendEvent({
        type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE,
        id: submissionId,
        timestamp: new Date().toISOString(),
      });

      this.logger.log(`[Success] ${taskMessage}`);
    } catch (error: any) {
      const errorMessage = error?.message ? error.message : JSON.stringify(error);
      this.logger.warn(`[Failed] ${taskMessage}, error: ${errorMessage}`);

      await this.formProcessErrorHandler(error, submissionId, requestorEmail);
      throw error;
    } finally {
      await rmDir(paths.localWorkingDir);
    }
  }

  // ===========================================================================
  // Form data processing
  // ===========================================================================
  protected processFormData(responses: FormField[]) {
    return {
      requestorEmail: this.getBatchIssuanceFormResponse(responses, BATCH_ISSUANCE_FORM_FIELD.AGENCY_OFFICER_EMAIL)!,
      applicationType: this.getApplicationType(responses),
      transaction: {
        name: this.getBatchIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.TRANSACTION_NAME)!,
        longCustomMessage: this.getBatchIssuanceFormResponse(responses, SINGLE_ISSUANCE_FORM_FIELD.LONG_CUSTOM_MESSAGE)!,
      },
    };
  }

  /**
   * Application Type values in the form are written as this format `<Agency Code> - <ApplicationType Code>`
   * This method returns the application type code
   */
  protected getApplicationType(responses: FormField[]): string {
    const agencyCodeApplicationTypeString = this.getBatchIssuanceFormResponse(responses, BATCH_ISSUANCE_FORM_FIELD.APPLICATION_TYPE)!;
    return agencyCodeApplicationTypeString.split(' - ')[1];
  }

  // ===========================================================================
  // Package zip processing
  // ===========================================================================
  protected generateFilePaths(formSubmissionId: string) {
    const localWorkingDir = `${DOWNLOAD_DIR}/${formSubmissionId}`;
    const extractedZipDir = `${localWorkingDir}/${LOCAL_EXTRACTED_SUBPATH}`;
    const sidecarFileDir = `${extractedZipDir}/${TRANSACTIONS_SIDECAR_FILENAME}`;

    return {
      localWorkingDir,
      extractedZipDir,
      sidecarFileDir,
    };
  }

  protected async processPackageZipFile(attachments: DecryptedAttachments, paths: ReturnType<typeof this.generateFilePaths>) {
    const { localWorkingDir, extractedZipDir, sidecarFileDir } = paths;

    const packageZipFile = Buffer.from(attachments[this.getBatchIssuanceFieldId(BATCH_ISSUANCE_FORM_FIELD.PACKAGE_ZIP_FILE)]!.content);

    // Check if attachment is zip
    await this.checkFileIsZip(packageZipFile);

    // Create working dir and extract zip
    await createDir(localWorkingDir);
    await this.unzipService.unzipToDisk(packageZipFile, extractedZipDir);

    // Check if sidecar file exist
    this.checkSidecarFileExistsOrThrow(sidecarFileDir);

    // Parse CSV and validate schema
    const sidecarDataList = await this.parseSidecarFile(sidecarFileDir);

    // Remove duplicates fileNames across recipients/transactions for checks, as recipients can be issued the same files
    const uniqueFileNames = [...new Set(sidecarDataList.flatMap(({ files }) => files))];

    // Check for missing / extra files
    await this.checkForMissingIssuanceFiles(extractedZipDir, uniqueFileNames);
    await this.checkForExtraIssuanceFiles(extractedZipDir, uniqueFileNames);

    // Generate file checksum map, so that file is not read multiple times, for each transaction that uses the same file
    const fileMap = this.generateFileMap(extractedZipDir, uniqueFileNames);

    return {
      sidecarDataList,
      fileMap,
    };
  }

  /**
   * Checks of buffer provided is a zip file. If not, throw Exception
   * @param file Zip file in buffer
   */
  protected async checkFileIsZip(file: Buffer): Promise<void> {
    const result = await fromBuffer(file);

    if (!result || result.ext !== 'zip' || result.mime !== 'application/zip') {
      throw new BatchIssuancePackageZipFileException(
        'File is not a zip file',
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.SIDECAR_FILE_NOT_ZIP,
      );
    }
  }

  protected checkSidecarFileExistsOrThrow(sidecarFileDir: string): void {
    const doesSidecarFileExist = existsSync(sidecarFileDir);

    if (!doesSidecarFileExist) {
      throw new BatchIssuancePackageZipFileException(
        'Missing sidecar file',
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.SIDECAR_CSV_DOESNT_EXIST,
      );
    }
  }

  /**
   * Note: method will check for number of transactions given in sidecar file, and throw if number exceeds max
   */
  protected async parseSidecarFile(sidecarFileDir: string): Promise<BatchIssuanceSidecarData[]> {
    let serializedSidecarData;
    try {
      serializedSidecarData = await convertCsvToJson(sidecarFileDir, TRANSACTIONS_SIDECAR_HEADERS, true, []);
    } catch (error: any) {
      const errorMessage = error?.message ? error.message : JSON.stringify(error);
      throw new BatchIssuancePackageZipFileException(
        errorMessage,
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.SIDECAR_CSV_HEADER_INCORRECT,
      );
    }

    if (serializedSidecarData.length > MAX_ALLOWED_TRANSACTION_COUNT) {
      throw new BatchIssuancePackageZipFileException(
        `Number of transactions exceed maximum allowed number of ${MAX_ALLOWED_TRANSACTION_COUNT}`,
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.EXCEED_MAX_TRANSACTION_COUNT,
      );
    }

    return plainToClass(BatchIssuanceSidecarData, serializedSidecarData);
  }

  protected async checkForMissingIssuanceFiles(extractedZipDir: string, fileNames: string[]): Promise<void> {
    const missingFiles = await checkForMissingFilesInDir(extractedZipDir, fileNames);

    if (missingFiles.length > 0) {
      throw new BatchIssuancePackageZipFileException(
        `Missing file(s) for issuance: ${missingFiles.join(',')}`,
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.FILES_MISMATCH,
      );
    }
  }

  protected async checkForExtraIssuanceFiles(extractedZipDir: string, uniqueSidecarIssuanceFiles: string[]): Promise<void> {
    const filesInDir = await listDirContent(extractedZipDir);
    const requiredFiles = [...uniqueSidecarIssuanceFiles, TRANSACTIONS_SIDECAR_FILENAME];

    const extraFiles = filesInDir.filter((dirFile) => !requiredFiles.includes(dirFile));

    if (extraFiles.length > 0) {
      throw new BatchIssuancePackageZipFileException(
        `Extra file(s) in package zip: ${extraFiles.join(', ')}`,
        COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        FORMSG_FAIL_CATEGORY.FILES_MISMATCH,
      );
    }
  }

  protected generateFileMap(extractedZipDir: string, fileNames: string[]): FileMap {
    const fileMap: FileMap = {};

    fileNames.forEach((fileName) => {
      if (fileMap[fileName]) {
        return;
      }
      const fileBuffer = readFileSync(`${extractedZipDir}/${fileName}`);
      fileMap[fileName] = { checksum: generateChecksum(fileBuffer), base64: fileBuffer.toString('base64') };
    });

    return fileMap;
  }

  // ===========================================================================
  // Transaction process handlers
  // ===========================================================================
  protected generateTransactionRequestsInfo(
    issuanceFormData: ReturnType<typeof this.processFormData>,
    sidecarData: BatchIssuanceSidecarData[],
    fileMap: FileMap,
    formSubmissionId: string,
  ): BatchIssuanceSingleTransactionData[] {
    return sidecarData.map<BatchIssuanceSingleTransactionData>(
      ({ externalRefId, uin, name, email, dob, contact, files: fileNames, deleteAt, isNonSingpassRetrievable }) => {
        const uuid = v4();
        const id = `${formSubmissionId}-${uuid}`;

        const { transaction: formTransactionData, applicationType, requestorEmail } = issuanceFormData;
        const { name: transactionName, longCustomMessage } = formTransactionData;

        // Batch issuance transactions only cater for 1 recipient
        const recipient: IssuanceRecipientRecord = {
          name,
          uin,
          email,
          dob,
          contact,
          isNonSingpassRetrievable,
        };

        const files: IssuanceFileRecord[] = fileNames.map((fileName) => {
          const checksum = fileMap[fileName].checksum;
          return { name: fileName, checksum, deleteAt };
        });

        const preParsedCreateTransactionRequestData: PreParsedCreateTransactionRequestData = {
          transaction: { name: transactionName, longCustomMessage, recipients: [recipient] },
          application: {
            type: applicationType,
            externalRefId,
          },
          files,
          requestorEmail,
        };

        const createFileTransactionRequestData = plainToClass(SingleIssuanceFormData, preParsedCreateTransactionRequestData, {
          exposeUnsetFields: false,
        });

        return {
          id,
          createFileTransactionRequestData,
          fileUploadRequestData: {
            fileNames,
          },
        };
      },
    );
  }

  protected async issuanceHandler(singleTransactionData: BatchIssuanceSingleTransactionData, fileMap: FileMap) {
    const { id, createFileTransactionRequestData, fileUploadRequestData } = singleTransactionData;
    let createFormSgFileTransactionResponse: CreateFormSgFileTransactionResponse | undefined;
    try {
      // Call create transaction
      createFormSgFileTransactionResponse = await this.singleTransactionFormService.createFileTransaction(
        createFileTransactionRequestData,
        id,
      );

      const filesToUpload: File[] = fileUploadRequestData.fileNames.map((fileName) => {
        const fileBase64 = fileMap[fileName].base64;
        return {
          fileName,
          isOA: false,
          fileData: fileBase64,
        };
      });

      // Call fileUpload
      await this.singleTransactionFormService.uploadFileToServer(filesToUpload, createFormSgFileTransactionResponse, id);

      // Call sendEvent
      const {
        application,
        transaction: { name: transactionName, recipients: requestRecipients },
        files: requestFiles,
      } = createFileTransactionRequestData;
      const { recipients, notificationChannels, transactionUuid, files } = createFormSgFileTransactionResponse;

      await this.sendEvent({
        type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_SUCCESS,
        id,
        application,
        notificationsToSendCount: recipients.length * notificationChannels.length,
        timestamp: new Date().toISOString(),
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
        transactionUuid: createFormSgFileTransactionResponse.transactionUuid,
      });
    } catch (error) {
      await this.transactionErrorHandler(error, id, createFileTransactionRequestData, createFormSgFileTransactionResponse);
    }
  }

  // ===========================================================================
  // Event logs handling
  // ===========================================================================
  protected async sendEvent(
    event:
      | FormSgProcessInitEvent
      | FormSgBatchProcessUpdateEvent
      | FormSgBatchProcessCompleteEvent
      | FormSgBatchProcessTransactionSuccessEvent
      | FormSgBatchProcessTransactionFailureEvent
      | FormSgProcessFailureEvent
      | FormSgBatchProcessFailureEvent,
  ): Promise<void> {
    try {
      await this.eventLogsServiceClient.post(EVENT_LOG_PATH, { event });
    } catch (error: any) {
      const errorMessage = error?.message ? error.message : JSON.stringify(error);

      this.logger.warn(`sendEvent Error: ${errorMessage}, form id: ${'ids' in event ? event.ids.join(',') : event.id}`);
    }
  }

  protected async sendBatchProcessTransactionFailureEvent(
    submissionId: string,
    failure: FormSgProcessBatchCreateTxnFailure | FormSgProcessBatchFileUploadFailure,
  ): Promise<void> {
    await this.sendEvent({
      type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_TRANSACTION_FAILURE,
      id: submissionId,
      timestamp: new Date().toISOString(),
      failure,
    });
  }

  // ===========================================================================
  // Error handlers
  // ===========================================================================
  protected async transactionErrorHandler(
    error: unknown,
    id: string,
    createFileTransactionRequestData: SingleIssuanceFormData,
    createFormSgFileTransactionResponse?: CreateFormSgFileTransactionResponse,
  ) {
    switch (true) {
      case error instanceof FormSgNonRetryableCreateTransactionError:
      case error instanceof FormSgCreateTransactionError: {
        const { type, reason, subType, application, transaction } = this.singleTransactionFormService.generateCreateTransactionFailure(
          error,
          createFileTransactionRequestData,
        );

        await this.sendBatchProcessTransactionFailureEvent(id, { type, reason, subType, application, transaction });
        break;
      }

      case error instanceof FormSgNonRetryableUploadFileError:
      case error instanceof FormSgUploadFileError: {
        const { type, subType, application, transaction, transactionUuid, reason } =
          this.singleTransactionFormService.generateFileUploadFailure(
            error,
            createFileTransactionRequestData,
            createFormSgFileTransactionResponse!,
          );

        await this.sendBatchProcessTransactionFailureEvent(id, {
          type,
          subType,
          application,
          transaction,
          transactionUuid,
          reason,
        });
        break;
      }

      default:
        await this.singleTransactionFormService.sendProcessFailureEvent(id, {
          type: FORMSG_PROCESS_FAIL_TYPE.OTHERS,
          reason: (error as Error).message,
        });
        break;
    }
  }

  protected async formProcessErrorHandler(error: unknown, id: string, requestorEmail?: string) {
    switch (true) {
      case error instanceof FormSgWebhookAuthenticationError:
      case error instanceof FormSgIdMismatchError:
      case error instanceof FormSgDecryptionError:
        await this.singleTransactionFormService.sendProcessFailureEvent(id, {
          type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
          reason: (error as Error).message,
        });
        break;

      case error instanceof BatchIssuancePackageZipFileException: {
        await this.sendEvent({
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE,
          id,
          timestamp: new Date().toISOString(),
          failure: {
            type: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION,
            reason: (error as Error).message,
            subType: (error as BatchIssuancePackageZipFileException).formsgFailSubType,
            requestorEmail: requestorEmail!,
          },
        });
        break;
      }

      default: {
        await this.sendEvent({
          type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_FAILURE,
          id,
          timestamp: new Date().toISOString(),
          failure: {
            type: FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS,
            reason: (error as Error).message,
          },
        });
        break;
      }
    }

    // rethrow error
    throw error;
  }

  // ===========================================================================
  // Secrets handler
  // ===========================================================================
  private async fetchAndPreCacheSecrets() {
    const { env } = this.fileSgConfigService.systemConfig;
    const formSecretKey = `${SECRET_MANAGER_FSG_APP_PREFIX}/${env}/${FORMSG_BATCH_ISSUANCE_FORM_SECRET_NAME}`;

    const formSgBatchIssuanceFormSecret = await this.smService.getSecretValue(formSecretKey);
    const fileSgSystemIntegrationClientSecret = await this.smService.getSecretValue(FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_KEY);

    return { formSgBatchIssuanceFormSecret, fileSgSystemIntegrationClientSecret };
  }
}
