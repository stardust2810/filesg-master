import { RESULT_STATUS } from '@filesg/backend-common';
import { NOTIFICATION_CHANNEL } from '@filesg/common';

import {
  AgencyFileAsset,
  Application,
  EmailNotificationInfo,
  FormSgTransaction,
  Process,
  RecipientActivity,
  SgNotifyNotificationInfo,
  Transaction,
} from '../../../../entities/formsg-transaction';
import { MockService } from '../../../../typings/common.mock';
import { FormSgIssuanceRecord, FormSgIssuanceRecordContent, ReportingService } from '../reporting.service';

export class TestReportingService extends ReportingService {
  public generateFormSgIssuanceRecords(
    transactions: FormSgTransaction[],
    formSubmissionId: string,
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    return super.generateFormSgIssuanceRecords(transactions, formSubmissionId, excludeFailureDetails);
  }

  public generateFormSgIssuanceSuccessReport(
    formsgTransaction: FormSgTransaction,
    id: string,
    index: number,
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    return super.generateFormSgIssuanceSuccessReport(formsgTransaction, id, index, excludeFailureDetails);
  }

  public generateFormSgIssuanceFailureReport(
    formsgTransaction: FormSgTransaction,
    id: string,
    index: number,
    excludeFailureDetails?: boolean,
  ): FormSgIssuanceRecord[] {
    return super.generateFormSgIssuanceFailureReport(formsgTransaction, id, index, excludeFailureDetails);
  }

  public generateFormSgIssuanceTransactionRecords(
    formSgSubmissionId: string,
    transaction: Transaction,
    application: Application,
    index: number,
    transactionStatus: RESULT_STATUS,
    failSubType?: string,
    failureReason?: string,
    notificationsSent?: (EmailNotificationInfo | SgNotifyNotificationInfo)[],
  ): FormSgIssuanceRecord[] {
    return super.generateFormSgIssuanceTransactionRecords(
      formSgSubmissionId,
      transaction,
      application,
      index,
      transactionStatus,
      failSubType,
      failureReason,
      notificationsSent,
    );
  }

  public generateFormSgIssuanceCsvRecord(record: FormSgIssuanceRecordContent): FormSgIssuanceRecord {
    return super.generateFormSgIssuanceCsvRecord(record);
  }
}

export const mockReportingService: MockService<ReportingService> = {
  generateFormSgIssuanceReport: jest.fn(),
};

// =============================================================================
// Mock
// =============================================================================
export const mockRecordId = 'formsg-submission-id';
const mockTransactionUuid = 'transaction-1234567812345678-12345678123456781121';
const mockTransactionName = 'mock-txn-name';
const mockMaskedUin1 = 'S****123A';
const mockMaskedUin2 = 'S****124A';
const mockRecipientActivityUuid1 = 'FSG-12345678-123456781234';
const mockRecipientActivityUuid2 = 'FSG-12345678-123456781235';
const mockEmail1 = '123A@gmail.com';
const mockEmail2 = '124A@gmail.com';

export const mockNotificationDeliverFailureReason = 'bounce error';

const mockProcesses: Process[] = [
  {
    timestamp: new Date().toISOString(),
    result: RESULT_STATUS.SUCCESS,
  },
];

export const mockApplication: Application = {
  type: 'LTVP',
};

const mockRecipientActivities: RecipientActivity[] = [
  {
    uuid: mockRecipientActivityUuid1,
    name: 'User A',
    maskedUin: mockMaskedUin1,
    email: mockEmail1,
    dob: '1995-01-01',
    contact: '+6588661234',
    isNonSingpassRetrievable: true,
  },
  {
    uuid: mockRecipientActivityUuid2,
    name: 'User B',
    maskedUin: mockMaskedUin2,
    email: mockEmail2,
    dob: '1995-01-01',
    contact: '+6588665678',
    isNonSingpassRetrievable: true,
  },
];

const mockAgencyFileAssets: AgencyFileAsset[] = [
  {
    name: 'multiple-page-01.pdf',
    uuid: 'fileasset-1689839329575-4d22840956ac3db8',
  },
  {
    name: 'multiple-page-02.pdf',
    uuid: 'fileasset-1689839329575-3cc9afa743b62076',
  },
];

export const mockFailureAgencyFileAssets: AgencyFileAsset[] = [
  {
    name: 'multiple-page-01.pdf',
    uuid: 'fileasset-1689839329575-4d22840956ac3db8',
    failSubType: 'fail sub type',
    failedReason: 'virus error',
  },
  {
    name: 'multiple-page-02.pdf',
    uuid: 'fileasset-1689839329575-3cc9afa743b62076',
    failSubType: 'fail sub type',
    failedReason: 'scan error',
  },
];

export const mockTransaction: Transaction = {
  uuid: mockTransactionUuid,
  name: mockTransactionName,
  recipientActivities: mockRecipientActivities,
  agencyFileAssets: mockAgencyFileAssets,
};

export const mockNotificationsSent: (EmailNotificationInfo | SgNotifyNotificationInfo)[] = [
  {
    status: RESULT_STATUS.SUCCESS,
    channel: NOTIFICATION_CHANNEL.EMAIL,
    email: mockEmail1,
    maskedUin: mockMaskedUin1,
    recipientActivityUuid: mockRecipientActivityUuid1,
  },
  {
    status: RESULT_STATUS.SUCCESS,
    channel: NOTIFICATION_CHANNEL.EMAIL,
    email: mockEmail2,
    maskedUin: mockMaskedUin2,
    recipientActivityUuid: mockRecipientActivityUuid2,
  },
];

export const mockFailureNotificationsSent: (EmailNotificationInfo | SgNotifyNotificationInfo)[] = [
  {
    status: RESULT_STATUS.FAILURE,
    channel: NOTIFICATION_CHANNEL.EMAIL,
    email: mockEmail1,
    maskedUin: mockMaskedUin1,
    recipientActivityUuid: mockRecipientActivityUuid1,
    failedReason: mockNotificationDeliverFailureReason,
  },
  {
    status: RESULT_STATUS.FAILURE,
    channel: NOTIFICATION_CHANNEL.EMAIL,
    email: mockEmail2,
    maskedUin: mockMaskedUin2,
    recipientActivityUuid: mockRecipientActivityUuid2,
    failedReason: mockNotificationDeliverFailureReason,
  },
];

export const mockSuccessFormSgTransaction = new FormSgTransaction();
mockSuccessFormSgTransaction.id = mockRecordId;
mockSuccessFormSgTransaction.processorStartedTimestamp = new Date().toISOString();
mockSuccessFormSgTransaction.processorEndedTimestamp = new Date().toISOString();
mockSuccessFormSgTransaction.queueEventTimestamp = new Date().toISOString();
mockSuccessFormSgTransaction.processes = mockProcesses;
mockSuccessFormSgTransaction.requestorEmail = 'requestor@gmail.com';
mockSuccessFormSgTransaction.application = mockApplication;
mockSuccessFormSgTransaction.transaction = mockTransaction;
mockSuccessFormSgTransaction.transactionUuid = mockTransactionUuid;
mockSuccessFormSgTransaction.result = RESULT_STATUS.SUCCESS;
mockSuccessFormSgTransaction.notificationsToSendCount = mockNotificationsSent.length;
mockSuccessFormSgTransaction.notificationsSent = mockNotificationsSent;

export let mockFailureFormSgTransaction = new FormSgTransaction();
mockFailureFormSgTransaction = { ...mockSuccessFormSgTransaction };
mockFailureFormSgTransaction.result = RESULT_STATUS.FAILURE;
mockFailureFormSgTransaction.failedReason = 'some error';

export let mockUnknownFormSgTransaction = new FormSgTransaction();
mockUnknownFormSgTransaction = { ...mockSuccessFormSgTransaction };
mockUnknownFormSgTransaction.result = undefined;
