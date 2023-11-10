import {
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgIssuanceFailureMessage,
  FormSgIssuanceSuccessMessage,
  FormSgIssuanceSuccessPayloadTransaction,
} from '@filesg/backend-common';
import { EVENT } from '@filesg/common';

import { MockService } from '../../../../typings/common.mock';
import { FormSgEventService } from '../events/formsg-event.service';

export class TestFormSgEventService extends FormSgEventService {
  public async getFormSgIssuanceReport(issuanceId: string) {
    return super.getFormSgIssuanceReport(issuanceId);
  }
}

export const mockFormSgEventService: MockService<FormSgEventService> = {
  formSgIssuanceHandler: jest.fn(),
};

export const mockRecordId = 'mock-record-id';
export const mockRequestorEmail = 'test@gmail.com';
export const mockQueueEventTimestamp = '2023-07-18T05:30:30.123Z';
export const mockFormSgIssuanceSuccessPayloadTransaction: FormSgIssuanceSuccessPayloadTransaction = {
  applicationType: 'LTVP',
  uuid: 'mock-txn-1',
  name: 'some name',
  fileNames: ['file-1.png', 'file-2.jpg'],
  recipientNames: ['user-1', 'user-2'],
};

export const mockContentType = 'text/csv';
export const mockReportFileName = 'report.csv';
export const mockReportDataInBase64 = 'dump data';

export const mockSuccessMessageBody: FormSgIssuanceSuccessMessage = {
  event: EVENT.FORMSG_ISSUANCE_SUCCESS,
  payload: {
    issuanceId: mockRecordId,
    requestorEmail: mockRequestorEmail,
    queueEventTimestamp: mockQueueEventTimestamp,
    hasNotificationToRecipientFailure: false,
    transaction: mockFormSgIssuanceSuccessPayloadTransaction,
  },
};

export const mockFailureMessageBody: FormSgIssuanceFailureMessage = {
  event: EVENT.FORMSG_ISSUANCE_FAILURE,
  payload: {
    issuanceId: mockRecordId,
    requestorEmail: mockRequestorEmail,
    queueEventTimestamp: mockQueueEventTimestamp,
    failType: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
    transaction: mockFormSgIssuanceSuccessPayloadTransaction,
  },
};

export const mockBatchValidationFailureMessageBody: FormSgIssuanceFailureMessage = {
  event: EVENT.FORMSG_ISSUANCE_FAILURE,
  payload: {
    issuanceId: mockRecordId,
    requestorEmail: mockRequestorEmail,
    queueEventTimestamp: mockQueueEventTimestamp,
    failType: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION,
    failSubType: 'some csv parsing error',
  },
};
