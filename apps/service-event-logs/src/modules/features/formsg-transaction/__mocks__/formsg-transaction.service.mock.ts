import {
  AgencyFileAsset,
  Application,
  EVENT_LOGGING_EVENTS,
  FORMSG_PROCESS_FAIL_TYPE,
  FORMSG_TRANSACTION_FAIL_TYPE,
  FormSgBatchProcessCompleteEvent,
  FormSgBatchProcessUpdateEvent,
  FormSgIssuanceBatchProcessFailureMessagePayload,
  FormSgIssuanceFailureMessagePayload,
  FormSgIssuanceSuccessMessageBasePayload,
  FormSgIssuanceSuccessMessagePayload,
  FormSgProcessCreateTxnFailureTransaction,
  FormSgProcessFailureEvent,
  FormSgProcessInitEvent,
  FormSgProcessSuccessEvent,
  FormSgRecipientNotificationDeliveryFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  FormSgTransactionFailureEvent,
  FormSgTransactionSuccessEvent,
  RESULT_STATUS,
  Transaction,
} from '@filesg/backend-common';
import { FORMSG_FAIL_CATEGORY, NOTIFICATION_CHANNEL } from '@filesg/common';

import { FormSgTransaction } from '../../../../entities/formsg-transaction';
import { MockService } from '../../../../typings/common.mock';
import { FormSgTransactionService } from '../formsg-transaction.service';

export class TestFormSgTransactionService extends FormSgTransactionService {
  public async sendIssuanceSuccessMessageToQueueCoreEvents(payload: FormSgIssuanceSuccessMessagePayload) {
    return super.sendIssuanceSuccessMessageToQueueCoreEvents(payload);
  }

  public async sendIssuanceFailureMessageToQueueCoreEvents(payload: FormSgIssuanceFailureMessagePayload) {
    return super.sendIssuanceFailureMessageToQueueCoreEvents(payload);
  }

  public generateIssuanceMessagePayload(
    formSgTransaction: FormSgTransaction,
  ): FormSgIssuanceSuccessMessagePayload | FormSgIssuanceFailureMessagePayload {
    return super.generateIssuanceMessagePayload(formSgTransaction);
  }

  public generateBatchIssuanceMessagePayload(
    batchHeaderRecord: FormSgTransaction,
  ): FormSgIssuanceSuccessMessageBasePayload | FormSgIssuanceBatchProcessFailureMessagePayload {
    return super.generateBatchIssuanceMessagePayload(batchHeaderRecord);
  }

  public async validateAgencyFileAssetUuids(newFileAssetUuids: string[], existingAgencyFileAssetUuids: string[], transactionUuid: string) {
    return super.validateAgencyFileAssetUuids(newFileAssetUuids, existingAgencyFileAssetUuids, transactionUuid);
  }

  public async validateAndHandleFailureTxnCompletion(formSgTransaction: FormSgTransaction) {
    return super.validateAndHandleFailureTxnCompletion(formSgTransaction);
  }
}

export const mockFormSgTransactionService: MockService<FormSgTransactionService> = {
  handleProcessInit: jest.fn(),
  handleProcessUpdate: jest.fn(),
  handleBatchProcessComplete: jest.fn(),
  handleProcessSuccess: jest.fn(),
  handleProcessFailure: jest.fn(),
  handleTransactionSuccess: jest.fn(),
  handleTransactionFailure: jest.fn(),
  handleRecipientNotificationDelivery: jest.fn(),
};

export const mockId = 'record-uuid-1';
export const mockTransactionUuid = 'transaction-1234567812345678-1234567812345678';
export const mockTransactionName = 'mock-txn-name';
export const mockTimestamp = '2023-08-08T05:04:46.064Z';
export const mockRequestorEmail = 'sample.gov.sg';
export const mockProcessAuthDecryptError = 'some auth decrypt error';
export const mockProcessCreateTxnError = 'some create txn error';
export const mockProcessFileUploadError = 'some file upload error';
export const mockTransactionFailSubType = FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR;
export const mockTransactionOthersError = 'some others error';
export const mockTransactionVirusScanFailSubType = FORMSG_FAIL_CATEGORY.FILE_SCAN_FAILED;
export const mockTransactionVirusScanError = 'some virus scan error';
export const mockNotificationDeliveryFailSubType = 'some notification delivery fail sub type';
export const mockNotificationDeliveryFailedReason = 'some notification delivery error';
export const mockAgencyFileAssetUuid1 = 'fileasset-1689839329575-4d22840956ac3db8';
export const mockAgencyFileAssetUuid2 = 'fileasset-1689839329575-3cc9afa743b62076';
export const mockVirusAgencyFileAssetUuid = mockAgencyFileAssetUuid1;
export const mockNotificationsToSendCount = 6;

export const mockMaskedUin1 = 'S****123A';
export const mockMaskedUin2 = 'S****124A';
export const mockRecipientActivityUuid1 = 'FSG-12345678-123456781234';
export const mockRecipientActivityUuid2 = 'FSG-12345678-123456781235';
export const mockName1 = 'User A';
export const mockName2 = 'User B';
export const mockEmail1 = '123A@gmail.com';
export const mockEmail2 = '124A@gmail.com';
export const mockBatchSize = 2;
export const mockProcessedTransactionCount = 2;
export const mockBatchId = 'mock-batch-id';

export const mockApplication: Application = {
  type: 'LTVP',
  externalRefId: 'LTVP-EXT-1',
};

export const mockAgencyFileAssets: AgencyFileAsset[] = [
  {
    name: 'multiple-page-01.pdf',
    uuid: mockAgencyFileAssetUuid1,
  },
  {
    name: 'multiple-page-02.pdf',
    uuid: mockAgencyFileAssetUuid2,
  },
];

export const mockTransaction: Transaction = {
  uuid: mockTransactionUuid,
  name: mockTransactionName,
  recipientActivities: [
    {
      uuid: mockRecipientActivityUuid1,
      maskedUin: mockMaskedUin1,
      name: mockName1,
    },
    {
      uuid: mockRecipientActivityUuid2,
      maskedUin: mockMaskedUin2,
      name: mockName2,
    },
  ],
  agencyFileAssets: mockAgencyFileAssets,
};

export const mockFormSgProcessCreateTxnFailureTransaction: FormSgProcessCreateTxnFailureTransaction = {
  name: mockTransactionName,
  recipientActivities: [
    {
      maskedUin: mockMaskedUin1,
      email: mockEmail1,
      name: mockName1,
    },
    {
      maskedUin: mockMaskedUin2,
      email: mockEmail2,
      name: mockName2,
    },
  ],
  agencyFileAssets: [
    {
      name: 'multiple-page-01.pdf',
    },
    {
      name: 'multiple-page-02.pdf',
    },
  ],
};

export const mockFormSgTransaction = new FormSgTransaction();
mockFormSgTransaction.id = mockId;
mockFormSgTransaction.requestorEmail = mockRequestorEmail;
mockFormSgTransaction.transaction = mockTransaction;
mockFormSgTransaction.application = mockApplication;
mockFormSgTransaction.notificationsSent = [
  {
    channel: NOTIFICATION_CHANNEL.EMAIL,
    email: mockEmail1,
    status: RESULT_STATUS.SUCCESS,
    maskedUin: mockMaskedUin1,
    recipientActivityUuid: mockRecipientActivityUuid1,
  },
  {
    channel: NOTIFICATION_CHANNEL.EMAIL,
    email: mockEmail2,
    status: RESULT_STATUS.SUCCESS,
    maskedUin: mockMaskedUin2,
    recipientActivityUuid: mockRecipientActivityUuid2,
  },
];

export const mockFormSgBatchHeader = new FormSgTransaction();
mockFormSgBatchHeader.id = mockId;
mockFormSgBatchHeader.requestorEmail = mockRequestorEmail;
mockFormSgBatchHeader.batchSize = mockBatchSize;
mockFormSgBatchHeader.processedTransactionCount = mockProcessedTransactionCount;
mockFormSgBatchHeader.queueEventTimestamp = mockTimestamp;
mockFormSgBatchHeader.failedNotificationCount = 0;

export const formSgProcessInitEvent: FormSgProcessInitEvent = {
  ids: [mockId],
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
  queueEventTimestamp: mockTimestamp,
  processorStartedTimestamp: mockTimestamp,
};

export const formSgProcessUpdateEvent: FormSgBatchProcessUpdateEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_UPDATE,
  requestorEmail: mockRequestorEmail,
  batchSize: mockBatchSize,
};

export const formSgBatchProcessCompleteEvent: FormSgBatchProcessCompleteEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_BATCH_PROCESS_COMPLETE,
  timestamp: mockTimestamp,
};

export const formSgProcessSuccessEvent: FormSgProcessSuccessEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS,
  timestamp: mockTimestamp,
  requestorEmail: mockRequestorEmail,
  application: mockApplication,
  transaction: mockTransaction,
  transactionUuid: mockTransactionUuid,
  notificationsToSendCount: mockNotificationsToSendCount,
};

export const formSgProcessAuthDecryptFailureEvent: FormSgProcessFailureEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE,
  timestamp: mockTimestamp,
  failure: {
    type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
    reason: mockProcessAuthDecryptError,
  },
};

export const formSgProcessCreateTxnFailureEvent: FormSgProcessFailureEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE,
  timestamp: mockTimestamp,
  failure: {
    type: FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN,
    reason: mockProcessCreateTxnError,
    requestorEmail: mockRequestorEmail,
    application: mockApplication,
    transaction: mockFormSgProcessCreateTxnFailureTransaction,
  },
};

export const formSgProcessFileUploadFailureEvent: FormSgProcessFailureEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE,
  timestamp: mockTimestamp,
  failure: {
    type: FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD,
    reason: mockProcessFileUploadError,
    requestorEmail: mockRequestorEmail,
    application: mockApplication,
    transaction: mockTransaction,
    transactionUuid: mockTransactionUuid,
  },
};

export const formSgTransactionSuccessEvent: FormSgTransactionSuccessEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS,
  transactionUuid: mockTransactionUuid,
};

export const formSgTransactionOthersFailureEvent: FormSgTransactionFailureEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
  transactionUuid: mockTransactionUuid,
  failure: {
    type: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS,
    subType: mockTransactionFailSubType,
    reason: mockTransactionOthersError,
  },
};

export const formSgTransactionVirusScanFailureEvent: FormSgTransactionFailureEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
  transactionUuid: mockTransactionUuid,
  failure: {
    type: FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN,
    subType: mockTransactionVirusScanFailSubType,
    reason: mockTransactionVirusScanError,
    agencyFileAssets: [
      {
        uuid: mockVirusAgencyFileAssetUuid,
        failSubType: FORMSG_FAIL_CATEGORY.FILE_CONTAINS_VIRUS,
        failedReason: mockTransactionVirusScanError,
      },
    ],
  },
};

export const formSgRecipientNotificationDeliverySuccessEvent: FormSgRecipientNotificationDeliverySuccessEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
  transactionUuid: mockTransactionUuid,
  recipientActivityUuid: mockRecipientActivityUuid1,
  channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  maskedUin: mockMaskedUin1,
};

export const formSgRecipientNotificationDeliveryFailureEvent: FormSgRecipientNotificationDeliveryFailureEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
  transactionUuid: mockTransactionUuid,
  recipientActivityUuid: mockRecipientActivityUuid1,
  channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  maskedUin: mockMaskedUin1,
  failSubType: mockNotificationDeliveryFailSubType,
  failedReason: mockNotificationDeliveryFailedReason,
};
