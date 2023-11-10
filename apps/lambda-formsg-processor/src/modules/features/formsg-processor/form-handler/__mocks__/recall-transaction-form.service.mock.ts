import { CreateFormSgRecallTransactionRequest } from '@filesg/common';
import { FileSgEncryptedFormData } from '@filesg/formsg';
import { FormField } from '@opengovsg/formsg-sdk/dist/types';

import { FORMSG_FORM_TYPE } from '../../../../../const';
import { FORM_ID } from '../../../../../const/formsg-question-field-map';
import { FormSgSqsRecord } from '../../../../../typings';
import { MockService } from '../../../../../typings/common.mock';
import { RecallTransactionFormService } from '../recall-transaction-form.service';

export class TestRecallTransactionFormService extends RecallTransactionFormService {
  public processFormData(responses: FormField[]) {
    return super.processFormData(responses);
  }

  public recallTransaction(recallTransactionData: CreateFormSgRecallTransactionRequest & { transactionUuid: string }) {
    return super.recallTransaction(recallTransactionData);
  }
}

export const mockRecallTransactionFormService: MockService<RecallTransactionFormService> = { recallTransactionHandler: jest.fn() };

// =============================================================================
// Mock data
// =============================================================================
// recallTransactionHandler
const mockSubmissionId = 'mock-sub-id';
const mockFormSgSignature = 'mock-signature';
const mockTimestamp = '1696219069120';

const mockRequestorEmail = 'mockRequestorEmail';
const mockTransactionUuid = 'mockTransactionUuid';

const mockFormData: FileSgEncryptedFormData = {
  formId: FORM_ID.RECALL_TRANSACTION_DEV,
  submissionId: mockSubmissionId,
  encryptedContent: 'mock-content',
  version: 1,
};

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
    type: FORMSG_FORM_TYPE.RECALL_TRANSACTION,
  },
  attributes: {
    ApproximateFirstReceiveTimestamp: new Date().getTime().toString(),
    ApproximateReceiveCount: '1',
    SenderId: 'mock-senderid',
    SentTimestamp: mockTimestamp,
  },
  messageAttributes: {},
};

export const mockRecallTransactionData: ReturnType<RecallTransactionFormService['processFormData']> = {
  requestorEmail: mockRequestorEmail,
  transactionUuid: mockTransactionUuid,
};

// processFormData
export const mockResponses: FormField[] = [
  {
    _id: '6509207a27ff0e001157cdfc',
    question: 'Email',
    answer: mockRequestorEmail,
    fieldType: 'email',
  },

  {
    _id: '650920ca27ff0e001157de22',
    question: 'Transaction Uuid',
    answer: mockTransactionUuid,
    fieldType: 'textfield',
  },
];
