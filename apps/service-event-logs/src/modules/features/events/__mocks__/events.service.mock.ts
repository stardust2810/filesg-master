import {
  EVENT_LOGGING_EVENTS,
  FORMSG_PROCESS_FAIL_TYPE,
  FORMSG_TRANSACTION_FAIL_TYPE,
  FormSgProcessFailureEvent,
  FormSgProcessInitEvent,
  FormSgProcessSuccessEvent,
  FormSgRecipientNotificationDeliveryFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  FormSgTransactionFailureEvent,
  FormSgTransactionSuccessEvent,
} from '@filesg/backend-common';
import { NOTIFICATION_CHANNEL } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { EventsService } from '../events.service';

export const mockEventsService: MockService<EventsService> = {
  handleEvents: jest.fn(),
};

export const mockId = 'record-uuid-1';
export const mockTransactionUuid = 'transaction-1234567812345678-1234567812345678';
export const mockTransactionName = 'mock-txn-name';
export const mockRecipientActivityUuid = 'FSG-12345678-12345678';
export const mockMaskedUin = 'S****610A';
export const mockFailSubType = 'mock fail sub type';
export const mockFailedReason = 'some error';

export const formSgProcessInitEvent: FormSgProcessInitEvent = {
  ids: [mockId],
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_INIT,
  queueEventTimestamp: '2023-08-08T05:04:46.064Z',
  processorStartedTimestamp: '2023-08-08T05:04:46.064Z',
};

export const formSgProcessSuccessEvent: FormSgProcessSuccessEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS,
  timestamp: '2023-08-08T05:04:46.064Z',
  requestorEmail: 'sample.gov.sg',
  application: {
    type: 'LTVP',
    externalRefId: 'LTVP-EXT-1',
  },
  transaction: {
    uuid: mockTransactionUuid,
    name: mockTransactionName,
    recipientActivities: [
      {
        uuid: 'FSG-12345678-123456781234',
        maskedUin: 'S****123A',
        name: 'User A',
      },
      {
        uuid: 'FSG-12345678-123456781235',
        maskedUin: 'S****124A',
        name: 'User B',
      },
    ],
    agencyFileAssets: [
      {
        name: 'multiple-page-01.pdf',
        uuid: 'fileasset-1689839329575-4d22840956ac3db8',
      },
      {
        name: 'multiple-page-02.pdf',
        uuid: 'fileasset-1689839329575-3cc9afa743b62076',
      },
    ],
  },
  transactionUuid: mockTransactionUuid,
  notificationsToSendCount: 6,
};

export const formSgProcessFailureEvent: FormSgProcessFailureEvent = {
  id: mockId,
  type: EVENT_LOGGING_EVENTS.FORMSG_PROCESS_FAILURE,
  timestamp: '2023-08-08T05:04:46.064Z',
  failure: {
    type: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
    reason: 'some auth decrypt error',
  },
};

export const formSgTransactionSuccessEvent: FormSgTransactionSuccessEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS,
  transactionUuid: mockTransactionUuid,
};

export const formSgTransactionFailureEvent: FormSgTransactionFailureEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
  transactionUuid: mockTransactionUuid,
  failure: {
    type: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS,
    subType: 'some sub type',
    reason: 'some weird reason',
  },
};

export const formSgRecipientNotificationDeliverySuccessEvent: FormSgRecipientNotificationDeliverySuccessEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS,
  transactionUuid: mockTransactionUuid,
  recipientActivityUuid: mockRecipientActivityUuid,
  channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  maskedUin: mockMaskedUin,
};

export const formSgRecipientNotificationDeliveryFailureEvent: FormSgRecipientNotificationDeliveryFailureEvent = {
  type: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
  transactionUuid: mockTransactionUuid,
  recipientActivityUuid: mockRecipientActivityUuid,
  channel: NOTIFICATION_CHANNEL.SG_NOTIFY,
  maskedUin: mockMaskedUin,
  failSubType: mockFailSubType,
  failedReason: mockFailedReason,
};
