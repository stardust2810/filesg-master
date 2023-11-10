import {
  FormSgBatchProcessCompleteEvent,
  FormSgBatchProcessFailureEvent,
  FormSgBatchProcessTransactionFailureEvent,
  FormSgBatchProcessTransactionSuccessEvent,
  FormSgBatchProcessUpdateEvent,
  FormSgProcessBatchCreateTxnFailure,
  FormSgProcessBatchFileUploadFailure,
  FormSgProcessFailureEvent,
  FormSgProcessInitEvent,
} from '@filesg/backend-common';
import { CreateFormSgFileTransactionResponse, NOTIFICATION_CHANNEL } from '@filesg/common';
import { FileSgEncryptedFormData, FormField } from '@filesg/formsg';
import { UnzipService } from '@filesg/zipper';
import { DecryptedAttachments, DecryptedContentAndAttachments } from '@opengovsg/formsg-sdk/dist/types';

import { FORMSG_FORM_TYPE } from '../../../../../const';
import { FORM_ID } from '../../../../../const/formsg-question-field-map';
import {
  BatchIssuanceSidecarData,
  BatchIssuanceSingleTransactionData,
  FormSgSqsRecord,
  SingleIssuanceFormData,
} from '../../../../../typings';
import { MockService } from '../../../../../typings/common.mock';
import { BatchIssuanceFormService, FileMap, FileMetadata } from '../batch-issuance-form.service';

export class TestBatchIssuanceFormService extends BatchIssuanceFormService {
  // ===========================================================================
  // Form data processing
  // ===========================================================================
  public processFormData(responses: FormField[]): {
    requestorEmail: string;
    applicationType: string;
    transaction: { name: string; longCustomMessage: string };
  } {
    return super.processFormData(responses);
  }

  public getApplicationType(responses: FormField[]): string {
    return super.getApplicationType(responses);
  }

  // ===========================================================================
  // Package zip processing
  // ===========================================================================
  public generateFilePaths(formSubmissionId: string): { localWorkingDir: string; extractedZipDir: string; sidecarFileDir: string } {
    return super.generateFilePaths(formSubmissionId);
  }

  public async processPackageZipFile(
    attachments: DecryptedAttachments,
    paths: { localWorkingDir: string; extractedZipDir: string; sidecarFileDir: string },
  ): Promise<{ sidecarDataList: BatchIssuanceSidecarData[]; fileMap: { [x: string]: FileMetadata } }> {
    return await super.processPackageZipFile(attachments, paths);
  }

  public async checkFileIsZip(file: Buffer): Promise<void> {
    return await super.checkFileIsZip(file);
  }

  public checkSidecarFileExistsOrThrow(sidecarFileDir: string): void {
    return super.checkSidecarFileExistsOrThrow(sidecarFileDir);
  }

  public async parseSidecarFile(sidecarFileDir: string): Promise<BatchIssuanceSidecarData[]> {
    return await super.parseSidecarFile(sidecarFileDir);
  }

  public async checkForMissingIssuanceFiles(extractedZipDir: string, fileNames: string[]): Promise<void> {
    return await super.checkForMissingIssuanceFiles(extractedZipDir, fileNames);
  }

  public async checkForExtraIssuanceFiles(extractedZipDir: string, uniqueSidecarIssuanceFiles: string[]): Promise<void> {
    return await super.checkForExtraIssuanceFiles(extractedZipDir, uniqueSidecarIssuanceFiles);
  }

  public generateFileMap(extractedZipDir: string, fileNames: string[]): { [x: string]: FileMetadata } {
    return super.generateFileMap(extractedZipDir, fileNames);
  }

  // ===========================================================================
  // Transaction process handlers
  // ===========================================================================
  public generateTransactionRequestsInfo(
    issuanceFormData: { requestorEmail: string; applicationType: string; transaction: { name: string; longCustomMessage: string } },
    sidecarData: BatchIssuanceSidecarData[],
    fileMap: { [x: string]: FileMetadata },
    formSubmissionId: string,
  ): BatchIssuanceSingleTransactionData[] {
    return super.generateTransactionRequestsInfo(issuanceFormData, sidecarData, fileMap, formSubmissionId);
  }

  public async issuanceHandler(
    singleTransactionData: BatchIssuanceSingleTransactionData,
    fileMap: { [x: string]: FileMetadata },
  ): Promise<void> {
    return await super.issuanceHandler(singleTransactionData, fileMap);
  }

  // ===========================================================================
  // Event logs handling
  // ===========================================================================
  public async sendEvent(
    event:
      | FormSgProcessInitEvent
      | FormSgBatchProcessUpdateEvent
      | FormSgBatchProcessCompleteEvent
      | FormSgBatchProcessTransactionSuccessEvent
      | FormSgBatchProcessTransactionFailureEvent
      | FormSgProcessFailureEvent
      | FormSgBatchProcessFailureEvent,
  ): Promise<void> {
    return await super.sendEvent(event);
  }

  public async sendBatchProcessTransactionFailureEvent(
    submissionId: string,
    failure: FormSgProcessBatchCreateTxnFailure | FormSgProcessBatchFileUploadFailure,
  ) {
    return super.sendBatchProcessTransactionFailureEvent(submissionId, failure);
  }

  // ===========================================================================
  // Error handlers
  // ===========================================================================
  public async transactionErrorHandler(
    error: unknown,
    id: string,
    createFileTransactionRequestData: SingleIssuanceFormData,
    createFormSgFileTransactionResponse?: CreateFormSgFileTransactionResponse | undefined,
  ): Promise<void> {
    return await super.transactionErrorHandler(error, id, createFileTransactionRequestData, createFormSgFileTransactionResponse);
  }

  public async formProcessErrorHandler(error: unknown, id: string, requestorEmail?: string): Promise<void> {
    return await super.formProcessErrorHandler(error, id, requestorEmail);
  }
}

// =============================================================================
// Mocks
// =============================================================================
export const mockBatchIssuanceFormService: MockService<BatchIssuanceFormService> = {
  batchIssuanceFormHandler: jest.fn(),
};

export const mockUnzipService: MockService<UnzipService> = {
  unzipToZipStream: jest.fn(),
  unzipToDisk: jest.fn(),
};

export const mockTimestamp = '1696219069120';

export const mockFormSgSignature = 'mock-signature';
export const mockFormId = FORM_ID.BATCH_ISSUANCE_DEV;
export const mockSubmissionId = 'mock-sub-id';

const mockRecipientUin = 'mockRecipientUin';
const mockRecipientName = 'mockRecipientName';
const mockRecipientEmail = 'mockRecipientEmail';

export const mockFileName = 'mockFileName';
export const mockChecksum = 'mockChecksum';
const mockBase64 = 'mockBase64';
export const mockBuffer = Buffer.from('mockBuffer');

const mockNotificationChannels = [NOTIFICATION_CHANNEL.EMAIL];
const mockAccessToken = 'mockAccessToken';
const mockTransactionUuid = 'mockTransactionUuid';
const mockFileAssetUuid = 'mockFileAssetUuid';
const mockActivityUuid = 'mockActivityUuid';

export const mockFormData: FileSgEncryptedFormData = {
  formId: mockFormId,
  submissionId: mockSubmissionId,
  encryptedContent: 'mock-content',
  version: 1,
};

export const mockBatchFormSgSqsRecord: FormSgSqsRecord = {
  messageId: 'mock-messageId',
  receiptHandle: 'mock-receiptHandle',
  body: 'mock-body',
  md5OfBody: 'mock-md5OfBody',
  eventSource: 'aws:sqs',
  eventSourceARN: 'mock-arn',
  awsRegion: 'ap-southeast-1',
  parsedBodyData: mockFormData,
  parsedMessageAttributes: {
    formsgSignature: mockFormSgSignature,
    type: FORMSG_FORM_TYPE.BATCH_ISSUANCE,
  },
  attributes: {
    ApproximateFirstReceiveTimestamp: new Date().getTime().toString(),
    ApproximateReceiveCount: '1',
    SenderId: 'mock-senderid',
    SentTimestamp: mockTimestamp,
  },
  messageAttributes: {},
};

export const mockPaths = {
  localWorkingDir: 'mockLocalWorkingDir',
  extractedZipDir: 'mockExtractedZipDir',
  sidecarFileDir: 'mockSidecarFileDir',
};

export const mockDecryptedAttachments: DecryptedAttachments = {
  '64c383e3fc37110011e99ffc': {
    filename: 'mockPackageZip',
    content: new Uint8Array(),
  },
};

export const mockDecryptedContentAndAttachments: DecryptedContentAndAttachments = {
  content: {
    responses: [
      {
        _id: '64c38d0dfc37110011eb1157',
        question: 'Agency User',
        answer: '',
        isHeader: true,
        fieldType: 'section',
      },
      {
        _id: '64c322ca36f2ba0011990bbc',
        question: 'Email',
        answer: 'filesgsqa+formsguser@gmail.com',
        fieldType: 'email',
      },
      {
        _id: '64c324376dd36a0011c483bd',
        question: 'Application Information',
        answer: '',
        isHeader: true,
        fieldType: 'section',
      },
      {
        _id: '64c32349fc37110011d66de8',
        question: 'Application Type',
        answer: 'ICA - LTVP',
        fieldType: 'dropdown',
      },
      {
        _id: '64c324694f5bcd00111a9737',
        question: 'Transaction Information',
        answer: '',
        isHeader: true,
        fieldType: 'section',
      },
      {
        _id: '64c324cd8e09550011440327',
        question: 'Transaction Name',
        answer: 'Issuance with 2 files',
        fieldType: 'textfield',
      },
      {
        _id: '64c3250836f2ba0011999116',
        question: 'Long Custom Message',
        answer: 'Long\nCustom\nMessage',
        fieldType: 'textarea',
      },
    ],
  },
  attachments: mockDecryptedAttachments,
};

export const mockProcessFormDataResult = {
  requestorEmail: 'mockRequestorEmail',
  applicationType: 'mockApplicationType',
  transaction: {
    name: 'mockTransactionName',
    longCustomMessage: 'mockLongCustomMessage',
  },
};

export const mockBatchIssuanceSingleTransactionDataList: BatchIssuanceSingleTransactionData[] = [
  {
    id: 'mockBatchTransactionId-01',
    createFileTransactionRequestData: {
      transaction: {
        name: mockProcessFormDataResult.transaction.name,
        longCustomMessage: [mockProcessFormDataResult.transaction.longCustomMessage],
        recipients: [{ uin: mockRecipientUin, name: mockRecipientName, email: mockRecipientEmail }],
      },
      application: { type: mockProcessFormDataResult.applicationType },
      files: [{ name: mockFileName, checksum: mockChecksum }],
      requestorEmail: mockProcessFormDataResult.requestorEmail,
    },
    fileUploadRequestData: { fileNames: [mockFileName] },
  },
];

export const mockBatchIssuanceSidecarDataList: BatchIssuanceSidecarData[] = [
  {
    uin: mockRecipientUin,
    name: mockRecipientName,
    email: mockRecipientEmail,
    files: [mockFileName],
  },
];

export const mockFileMap: FileMap = {
  [mockFileName]: {
    checksum: mockChecksum,
    base64: mockBase64,
  },
};

export const mockCreateFormSgFileTransactionResponse: CreateFormSgFileTransactionResponse = {
  notificationChannels: mockNotificationChannels,
  accessToken: mockAccessToken,
  transactionUuid: mockTransactionUuid,
  files: [
    {
      name: mockFileName,
      uuid: mockFileAssetUuid,
    },
  ],
  recipients: [
    {
      uin: mockRecipientUin,
      activityUuid: mockActivityUuid,
    },
  ],
};
