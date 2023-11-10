import {
  EVENT_LOGGING_EVENTS,
  FormSgProcessCreateTxnFailureAgencyFileAsset,
  FormSgProcessCreateTxnFailureRecipientActivity,
  FormSgProcessCreateTxnFailureTransaction,
  FormSgProcessFailureEvent,
  FormSgProcessFileUploadFailureAgencyFileAsset,
  FormSgProcessInitEvent,
  FormSgProcessSuccessEvent,
} from '@filesg/backend-common';
import { CreateFormSgFileTransactionRequest, CreateFormSgFileTransactionResponse, NOTIFICATION_CHANNEL } from '@filesg/common';
import { FileSgEncryptedFormData, FormSgService } from '@filesg/formsg';
import { DecryptedAttachments, DecryptedContentAndAttachments, FormField } from '@opengovsg/formsg-sdk/dist/types';
import { AxiosError } from 'axios';

import { FormSgNonRetryableCreateTransactionError } from '../../../../../common/custom-exceptions';
import { FORMSG_FORM_TYPE } from '../../../../../const';
import { FORM_ID } from '../../../../../const/formsg-question-field-map';
import {
  FormSgSqsRecord,
  IssuanceFileRecord,
  IssuanceRecipientRecord,
  SingleIssuanceFormData,
  SingleIssuanceTransactionRecord,
} from '../../../../../typings';
import { MockService } from '../../../../../typings/common.mock';
import { SingleIssuanceFormService } from '../single-issuance-form.service';

export class TestSingleIssuanceFormService extends SingleIssuanceFormService {
  // ===========================================================================
  // FormSg data utils
  // ===========================================================================
  public processFormData(responses: FormField[], attachments: DecryptedAttachments) {
    return super.processFormData(responses, attachments);
  }

  public createRecipientsObject(esponses: FormField[]) {
    return super.createRecipientsObject(esponses);
  }

  public createTransactionFilesObject(responses: FormField[], attachments: DecryptedAttachments) {
    return super.createTransactionFilesObject(responses, attachments);
  }

  public getApplicationType(responses: FormField[]): string {
    return super.getApplicationType(responses);
  }

  public getAttachmentByIndex(index: number, attachments: DecryptedAttachments) {
    return super.getAttachmentByIndex(index, attachments);
  }

  // ===========================================================================
  // Event sending handlers
  // ===========================================================================
  public async sendEvent(event: FormSgProcessInitEvent | FormSgProcessSuccessEvent | FormSgProcessFailureEvent): Promise<void> {
    return super.sendEvent(event);
  }

  public async sendProcessSuccessEvent(
    submissionId: string,
    createFileTransactionRequestData: SingleIssuanceFormData,
    createFileTransactionResponse: CreateFormSgFileTransactionResponse,
  ): Promise<void> {
    return super.sendProcessSuccessEvent(submissionId, createFileTransactionRequestData, createFileTransactionResponse);
  }

  // ===========================================================================
  // Error Handlers
  // ===========================================================================
  public createFileTransactionAxiosErrorHandler(error: AxiosError<any, any>): void {
    return super.createFileTransactionAxiosErrorHandler(error);
  }

  public uploadFileToServerAxiosErrorHandler(error: AxiosError<any, any>): void {
    return super.uploadFileToServerAxiosErrorHandler(error);
  }

  public formSgNonRetryableCreateTransactionErrorHandler(
    error: FormSgNonRetryableCreateTransactionError,
    transaction: SingleIssuanceTransactionRecord,
    files: IssuanceFileRecord[],
  ): Omit<FormSgProcessCreateTxnFailureTransaction, 'name'> {
    return super.formSgNonRetryableCreateTransactionErrorHandler(error, transaction, files);
  }

  public constructCreateTransactionFailureTransaction(
    transaction: SingleIssuanceTransactionRecord,
    files: IssuanceFileRecord[],
  ): Omit<FormSgProcessCreateTxnFailureTransaction, 'name'> {
    return super.constructCreateTransactionFailureTransaction(transaction, files);
  }

  public reconstructRecipientActivitiesWithBlacklistedEmails(
    blacklistedEmails: string[],
    formSgFailSubType: string,
    recipients: IssuanceRecipientRecord[],
  ): FormSgProcessCreateTxnFailureRecipientActivity[] {
    return super.reconstructRecipientActivitiesWithBlacklistedEmails(blacklistedEmails, formSgFailSubType, recipients);
  }

  public reconstructRecipientActivitiesWithDuplicatedRecipientUins(
    duplicatedUins: string[],
    formSgFailSubType: string,
    recipients: IssuanceRecipientRecord[],
  ): FormSgProcessCreateTxnFailureRecipientActivity[] {
    return super.reconstructRecipientActivitiesWithDuplicatedRecipientUins(duplicatedUins, formSgFailSubType, recipients);
  }

  public reconstructAgencyFileAssetsWithDuplicatedFileNames(
    duplicatedFileNames: string[],
    formSgFailSubType: string,
    files: IssuanceFileRecord[],
  ): FormSgProcessCreateTxnFailureAgencyFileAsset[] {
    return super.reconstructAgencyFileAssetsWithDuplicatedFileNames(duplicatedFileNames, formSgFailSubType, files);
  }
}

export const mockSingleIssuanceFormService: MockService<SingleIssuanceFormService> = {
  singleIssuanceFormHandler: jest.fn(),
  createFileTransaction: jest.fn(),
  uploadFileToServer: jest.fn(),
  sendProcessInitEvent: jest.fn(),
  sendProcessFailureEvent: jest.fn(),
  generateCreateTransactionFailure: jest.fn(),
  generateFileUploadFailure: jest.fn(),
};

export const mockFormSgService: MockService<FormSgService> = {
  decryptFormDataWithAttachments: jest.fn(),
  decryptFormData: jest.fn(),
  validateFormId: jest.fn(),
  authenticateWebhook: jest.fn(),
};

export const mockRequestorEmail = 'filesgsqa+formsguser@gmail.com';
export const mockFirstFileName = 'single-page.pdf';
export const mockFirstFileUuid = 'first-file-uuid';
export const mockSecondFileName = 'multi-page.pdf';
export const mockSecondFileUuid = 'second-file-uuid';

export const mockTransactionUuid = 'mock-txn-uuid';
export const mockTransactionName = 'mock-txn-name';
export const mockFormSgSignature = 'mock-signature';
export const mockFormId = FORM_ID.SINGLE_ISSUANCE_DEV;
export const mockSubmissionId = 'mock-sub-id';
export const mockFormData: FileSgEncryptedFormData = {
  formId: mockFormId,
  submissionId: mockSubmissionId,
  encryptedContent: 'mock-content',
  version: 1,
};

export const mockTimestamp = '1696219069120';
export const mockISOTimestamp = new Date(parseInt(mockTimestamp)).toISOString();

export const mockJwt = 'mock-jwt';

export const mockFirstRecipientName = 'recipient 1';
export const mockFirstRecipientUin = 'S3002610A';
export const mockFirstRecipientActivityUuid = 'mock-recipient-uuid-1';
export const mockFirstRecipientEmail = 'recipient-1@gmail.com';

export const mockSecondRecipientName = 'recipient 2';
export const mockSecondRecipientUin = 'S3002607A';
export const mockSecondRecipientActivityUuid = 'mock-recipient-uuid-2';
export const mockSecondRecipientEmail = 'recipient-2@gmail.com';

export const mockFailureReason = 'some reason';
export const mockFailSubType = 'some sub type';
export const mockBlacklistedEmails = [mockFirstRecipientEmail];
export const mockDuplicatedUins = [mockFirstRecipientUin];
export const mockDuplicatedFileNames = [mockFirstFileName];
export const mockUnsupportedTypeFileNames = [mockSecondFileName];

export const mockFormSgSqsRecord: FormSgSqsRecord = {
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
    type: FORMSG_FORM_TYPE.SINGLE_ISSUANCE,
  },
  attributes: {
    ApproximateFirstReceiveTimestamp: new Date().getTime().toString(),
    ApproximateReceiveCount: '1',
    SenderId: 'mock-senderid',
    SentTimestamp: mockTimestamp,
  },
  messageAttributes: {},
};

export const mockDecryptedFormSgData: DecryptedContentAndAttachments = {
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
        _id: '64c32466c0415f0011608187',
        question: 'External Reference Id',
        answer: 'REF-EXT-TEST-001',
        fieldType: 'textfield',
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
      {
        _id: '64d090834d0bb70012dc3887',
        question: 'Does the application require any of the following notification service(s)?',
        answer: '',
        fieldType: 'yes_no',
      },
      {
        _id: '64c3251236f2ba0011999374',
        question: 'Short Custom Message',
        answer: '',
        fieldType: 'textarea',
      },
      {
        _id: '64c38708889c880011e1fb22',
        question: 'Is acknowledgement required?',
        answer: '',
        fieldType: 'yes_no',
      },
      {
        _id: '64c3257bcbb9630011b73304',
        question: 'Recipients',
        answer: '',
        isHeader: true,
        fieldType: 'section',
      },
      {
        _id: '64c3858dfc37110011e9ed3e',
        question: 'Number of Recipients',
        answer: '2',
        fieldType: 'dropdown',
      },
      {
        _id: '64c3846bcd126c00125106f8',
        question: 'Name',
        answer: mockFirstRecipientName,
        fieldType: 'textfield',
      },
      {
        _id: '64c3259a889c880011cec500',
        question: 'NRIC / FIN',
        answer: mockFirstRecipientUin,
        fieldType: 'nric',
      },
      {
        _id: '64c384a54f5bcd00112d6996',
        question: 'Email',
        answer: mockFirstRecipientEmail,
        fieldType: 'email',
      },
      {
        _id: '64d0976aa3a1e10012b046a4',
        question: 'Is Non-Singpass retrieval required',
        answer: 'Yes',
        fieldType: 'yes_no',
      },
      {
        _id: '64c384fe889c880011e19659',
        question: 'Mobile number',
        answer: '+6588888888',
        fieldType: 'mobile',
      },
      {
        _id: '64c384e48e0955001156d609',
        question: 'Date of Birth',
        answer: '01 Jan 1995',
        fieldType: 'date',
      },
      {
        _id: '64c38a974f5bcd00112e6caa',
        question: 'Name',
        answer: mockSecondRecipientName,
        fieldType: 'textfield',
      },
      {
        _id: '64c38a9c36f2ba0011ad5b8e',
        question: 'NRIC / FIN',
        answer: mockSecondRecipientUin,
        fieldType: 'nric',
      },
      {
        _id: '64c38aa3c0415f0011745a01',
        question: 'Email',
        answer: mockSecondRecipientEmail,
        fieldType: 'email',
      },
      {
        _id: '64d097d6e49602001125d976',
        question: 'Is Non-Singpass retrieval required',
        answer: 'Yes',
        fieldType: 'yes_no',
      },
      {
        _id: '64c38aa74f5bcd00112e6f22',
        question: 'Mobile number',
        answer: '+6588888888',
        fieldType: 'mobile',
      },
      {
        _id: '64c38aacfc37110011eac02c',
        question: 'Date of Birth',
        answer: '01 Jan 1995',
        fieldType: 'date',
      },
      {
        _id: '64c325d3c0415f001160d998',
        question: 'Files',
        answer: '',
        isHeader: true,
        fieldType: 'section',
      },
      {
        _id: '64c385ce889c880011e1bf78',
        question: 'Number of Files',
        answer: '2',
        fieldType: 'dropdown',
      },
      {
        _id: '64c383e3fc37110011e99ffc',
        question: 'File to upload',
        answer: mockFirstFileName,
        fieldType: 'attachment',
      },
      {
        _id: '64c386d86dd36a0011d7b1f0',
        question: 'Delete-At Date',
        answer: '',
        fieldType: 'date',
      },
      {
        _id: '64c387774f5bcd00112dedd9',
        question: 'Is password encryption required?',
        answer: '',
        fieldType: 'yes_no',
      },
      {
        _id: '64c3840bc0415f001173374b',
        question: 'File to upload',
        answer: mockSecondFileName,
        fieldType: 'attachment',
      },
      {
        _id: '64c38b4c6dd36a0011d8657f',
        question: 'Delete-At Date',
        answer: '',
        fieldType: 'date',
      },
      {
        _id: '64c38c77fa6e8f00129d9458',
        question: 'Is password encryption required?',
        answer: '',
        fieldType: 'yes_no',
      },
    ],
  },
  attachments: {
    '64c383e3fc37110011e99ffc': {
      filename: mockFirstFileName,
      content: new Uint8Array(),
    },
    '64c3840bc0415f001173374b': {
      filename: mockSecondFileName,
      content: new Uint8Array(),
    },
  },
};

export const mockSingleAttachment = {
  '64c383e3fc37110011e99ffc': {
    filename: mockFirstFileName,
    content: new Uint8Array(),
  },
};

export const mockMultipleAttachments = {
  '64c383e3fc37110011e99ffc': {
    filename: mockFirstFileName,
    content: new Uint8Array(),
  },
};

export const mockSingleIssuanceFormData: SingleIssuanceFormData = {
  requestorEmail: mockRequestorEmail,
  application: {
    externalRefId: 'REF-EXT-TEST-001',
    type: 'LTVP',
  },
  transaction: {
    name: 'Issuance with 2 files',
    longCustomMessage: ['Long', 'Custom', 'Message'],
    recipients: [
      {
        name: mockFirstRecipientName,
        uin: mockFirstRecipientUin,
        email: mockFirstRecipientEmail,
        contact: '+6588888888',
        dob: '1995-01-01',
        isNonSingpassRetrievable: true,
      },
      {
        name: mockSecondRecipientName,
        uin: mockSecondRecipientUin,
        email: mockSecondRecipientEmail,
        contact: '+6588888888',
        dob: '1995-01-01',
        isNonSingpassRetrievable: true,
      },
    ],
  },
  files: [
    {
      name: mockFirstFileName,
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      name: mockSecondFileName,
      checksum: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
  ],
};

export const mockCreateTransactionPayload: CreateFormSgFileTransactionRequest = { ...mockSingleIssuanceFormData };

export const mockCreateTransactionResponse: CreateFormSgFileTransactionResponse = {
  accessToken: mockJwt,
  transactionUuid: mockTransactionUuid,
  files: [
    {
      name: mockFirstFileName,
      uuid: mockFirstFileUuid,
    },
    {
      name: mockSecondFileName,
      uuid: mockSecondFileUuid,
    },
  ],
  recipients: [
    {
      uin: mockFirstRecipientUin,
      activityUuid: mockFirstRecipientActivityUuid,
    },
  ],
  notificationChannels: [NOTIFICATION_CHANNEL.EMAIL],
};

export const mockCreateTransactionAxiosResponse = {
  data: mockCreateTransactionResponse,
};

export const mockUploadFileRequest = {
  files: [
    { fileName: mockFirstFileName, isOA: false, fileData: '' },
    { fileName: mockSecondFileName, isOA: false, fileData: '' },
  ],
};
export const mockContentWithOneNSPRecipientReq = {};
export const mockContentWithOneNSPRecipient = {
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
      _id: '64c32466c0415f0011608187',
      question: 'External Reference Id',
      answer: 'REF-EXT-TEST-001',
      fieldType: 'textfield',
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
    {
      _id: '64d090834d0bb70012dc3887',
      question: 'Does the application require any of the following notification service(s)?',
      answer: '',
      fieldType: 'yes_no',
    },
    {
      _id: '64c3251236f2ba0011999374',
      question: 'Short Custom Message',
      answer: '',
      fieldType: 'textarea',
    },
    {
      _id: '64c38708889c880011e1fb22',
      question: 'Is acknowledgement required?',
      answer: '',
      fieldType: 'yes_no',
    },
    {
      _id: '64c3257bcbb9630011b73304',
      question: 'Recipients',
      answer: '',
      isHeader: true,
      fieldType: 'section',
    },
    {
      _id: '64c3858dfc37110011e9ed3e',
      question: 'Number of Recipients',
      answer: '1',
      fieldType: 'dropdown',
    },
    {
      _id: '64c3846bcd126c00125106f8',
      question: 'Name',
      answer: 'test Recipient name',
      fieldType: 'textfield',
    },
    {
      _id: '64c3259a889c880011cec500',
      question: 'NRIC / FIN',
      answer: 'S3002610A',
      fieldType: 'nric',
    },
    {
      _id: '64c384a54f5bcd00112d6996',
      question: 'Email',
      answer: 'testEmail@notadomain.com',
      fieldType: 'email',
    },
    {
      _id: '64d0976aa3a1e10012b046a4',
      question: 'Is Non-Singpass retrieval required',
      answer: 'Yes',
      fieldType: 'yes_no',
    },
    {
      _id: '64c384fe889c880011e19659',
      question: 'Mobile number',
      answer: '',
      fieldType: 'mobile',
    },
    {
      _id: '64c384e48e0955001156d609',
      question: 'Date of Birth',
      answer: '',
      fieldType: 'date',
    },
    {
      _id: '64c38a974f5bcd00112e6caa',
      question: 'Name',
      answer: '',
      fieldType: 'textfield',
    },
    {
      _id: '64c38a9c36f2ba0011ad5b8e',
      question: 'NRIC / FIN',
      answer: '',
      fieldType: 'nric',
    },
    {
      _id: '64c38aa3c0415f0011745a01',
      question: 'Email',
      answer: '',
      fieldType: 'email',
    },
    {
      _id: '64d097d6e49602001125d976',
      question: 'Is Non-Singpass retrieval required',
      answer: '',
      fieldType: 'yes_no',
    },
    {
      _id: '64c38aa74f5bcd00112e6f22',
      question: 'Mobile number',
      answer: '',
      fieldType: 'mobile',
    },
    {
      _id: '64c38aacfc37110011eac02c',
      question: 'Date of Birth',
      answer: '',
      fieldType: 'date',
    },
    {
      _id: '64c325d3c0415f001160d998',
      question: 'Files',
      answer: '',
      isHeader: true,
      fieldType: 'section',
    },
    {
      _id: '64c385ce889c880011e1bf78',
      question: 'Number of Files',
      answer: '1',
      fieldType: 'dropdown',
    },
    {
      _id: '64c383e3fc37110011e99ffc',
      question: 'File to upload',
      answer: mockFirstFileName,
      fieldType: 'attachment',
    },
    {
      _id: '64c386d86dd36a0011d7b1f0',
      question: 'Delete-At Date',
      answer: '',
      fieldType: 'date',
    },
    {
      _id: '64c387774f5bcd00112dedd9',
      question: 'Is password encryption required?',
      answer: '',
      fieldType: 'yes_no',
    },
    {
      _id: '64c3840bc0415f001173374b',
      question: 'File to upload',
      answer: '',
      fieldType: 'attachment',
    },
    {
      _id: '64c38b4c6dd36a0011d8657f',
      question: 'Delete-At Date',
      answer: '',
      fieldType: 'date',
    },
    {
      _id: '64c38c77fa6e8f00129d9458',
      question: 'Is password encryption required?',
      answer: '',
      fieldType: 'yes_no',
    },
  ],
};

export const mockFormSgProcessInitEvent: FormSgProcessInitEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
  ids: ['mock-id-1'],
  queueEventTimestamp: mockISOTimestamp,
  processorStartedTimestamp: mockISOTimestamp,
};

export const mockFormSgProcessCreateTxnFailureTransaction: FormSgProcessCreateTxnFailureTransaction = {
  name: mockTransactionName,
  agencyFileAssets: [],
  recipientActivities: [],
};

export const mockFormSgProcessFileUploadFailureAgencyFileAssets: FormSgProcessFileUploadFailureAgencyFileAsset[] = [
  {
    name: mockFirstFileName,
    uuid: mockFirstFileUuid,
    failedReason: mockFailureReason,
    failSubType: mockFailSubType,
  },
  {
    name: mockSecondFileName,
    uuid: mockSecondFileUuid,
    failedReason: mockFailureReason,
    failSubType: mockFailSubType,
  },
];

export const mockDeteleAtDateInputValidationError = [
  {
    property: 'files',
    children: [
      {
        property: '0',
        children: [
          {
            property: 'deleteAt',
            children: [],
            constraints: {
              IsValidFileSGDate: 'Date input must be valid, larger than current date, and in the format of (yyyy-mm-dd)',
            },
          },
        ],
      },
    ],
  },
];

export const mockRecipientEmailBlacklistedError = {
  message: `The following email(s): ${mockBlacklistedEmails.join(
    ', ',
  )} belong to a blacklist. Please provide an alternative email address for the above mentioned.`,
  blacklistedEmails: mockBlacklistedEmails,
};

export const mockDuplicateRecipientUinsError = {
  message: `The recipient uins provided contain duplicates: ${mockDuplicatedUins.join(
    ', ',
  )}. Please provide unique uin for each recipient.`,
  duplicatedUins: mockDuplicatedUins,
};

export const mockDuplicateFileNamesError = {
  message: `The file names provided contain duplicates: ${mockDuplicatedFileNames.join(', ')}. Please provide unique name for each file.`,
  duplicatedFileNames: mockDuplicatedFileNames,
};
