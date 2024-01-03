/* eslint-disable sonarjs/no-duplicate-string */
import {
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgIssuanceBatchProcessFailureMessagePayload,
  FormSgIssuanceBatchTransactionFailureMessagePayload,
  FormSgIssuanceFailureMessage,
  FormSgIssuanceFailureMessagePayload,
  FormSgIssuanceSuccessMessage,
  FormSgIssuanceSuccessMessagePayload,
  FormSgIssuanceSuccessPayloadTransaction,
} from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  EVENT,
  FILE_STATUS,
  FILE_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TEMPLATE_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { EmailDeliveryFailureTemplateArgs } from '../../../../common/email-template/email-delivery-faliure.class';
import { FORMSG_TRANSACTION_EMAIL_TYPE } from '../../../../common/email-template/formsg-transaction-email-to-agency.class';
import { GeneralInfoSection } from '../../../../common/email-template/formsg-transaction-email-to-agency.email-template';
import { Activity } from '../../../../entities/activity';
import { NotificationMessageInput } from '../../../../entities/notification-message-input';
import { EmailNotificationOptions, FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockNotificationMessageInput } from '../../../entities/notification-message-input/__mocks__/notification-message-input.mock';
import { createMockNotificationMessageTemplate } from '../../../entities/notification-message-template/__mocks__/notification-message-template.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { EmailService, TransactionalEmailDetails } from '../email.service';

export class TestEmailService extends EmailService {
  public getFormSgTxnEmailType(messageBody: FormSgIssuanceSuccessMessage | FormSgIssuanceFailureMessage): FORMSG_TRANSACTION_EMAIL_TYPE {
    return super.getFormSgTxnEmailType(messageBody);
  }

  public constructFormSgTxnEmailGeneralInfoSectionArgs(
    emailType: FORMSG_TRANSACTION_EMAIL_TYPE,
    payload: FormSgIssuanceSuccessMessagePayload | FormSgIssuanceFailureMessagePayload,
  ): GeneralInfoSection {
    return super.constructFormSgTxnEmailGeneralInfoSectionArgs(emailType, payload);
  }

  public constructTransactionalEmail(
    notificationMessageInput: NotificationMessageInput | null,
    emailNotificationOptions: EmailNotificationOptions,
    activity: Activity,
  ): TransactionalEmailDetails {
    return super.constructTransactionalEmail(notificationMessageInput, emailNotificationOptions, activity);
  }

  public async transactionalEmailHandler(
    email: string,
    activity: Activity,
    notificationMessageInput: NotificationMessageInput | null,
    emailNotificationOptions: EmailNotificationOptions,
  ) {
    return super.transactionalEmailHandler(email, activity, notificationMessageInput, emailNotificationOptions);
  }

  public async saveEventLogs(
    transactionUuid: string,
    recipientActivityUuid: string,
    maskedUin: string,
    email: string,
    failSubType: string,
    failedReason: string,
  ) {
    return super.saveEventLogs(transactionUuid, recipientActivityUuid, maskedUin, email, failSubType, failedReason);
  }
}

export const mockEmailService: MockService<EmailService> = {
  sendNotification: jest.fn(),
  sendAgencyDeliveryFailureEmail: jest.fn(),
  sendFormSgIssuanceReportToRequestor: jest.fn(),
  sendEmail: jest.fn(),
  sendRecallSucessEmailToAgency: jest.fn(),
  sendRecallFailureEmailToAgency: jest.fn(),
};

export const mockEmailNotificationOptions: EmailNotificationOptions = {
  templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  encryptionDetailsList: [
    {
      activityUuid: 'mockActivity-1',
      password: 'mockPassword',
      files: [
        {
          fileAssetUuid: 'mockFileAsset-1',
        },
      ],
    },
  ],
};

export const mockEmails = ['test1@gmail.com', 'test2@gmail.com'];
export const mockEmailTitle = 'title';
export const mockEmailContent = 'content';
export const mockCustomMessage = ['mockCustomMessage'];
export const mockMessageId = 'mockMessageId';
export const mockFormSgSubmissionId = 'mockFormSgSubmissionId';
export const mockQueueEventTimestamp = '2023-07-18T05:30:30.123Z';
export const mockFormSgIssuanceSuccessPayloadTransaction: FormSgIssuanceSuccessPayloadTransaction = {
  uuid: 'mock-txn-1',
  applicationType: 'LTVP',
  name: 'LTVP Issuance',
  fileNames: ['file-1.png', 'file-2.jpg'],
  recipientNames: ['user-1', 'user-2'],
};
export const mockRecordId = 'mock-record-id';
export const mockRequestorEmail = 'test@gmail.com';
export const mockBatchSidecarErrorSubType = 'batch csv validation error';
export const mockContentType = 'text/csv';
export const mockReportFileName = 'report.csv';
export const mockReportDataInBase64 = 'dump data';

const mockNotificationMessageTemplate = createMockNotificationMessageTemplate({
  name: 'mockTemplateName',
  template: ['mockTemplate'],
  type: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
});

export const mockEmailNotificationMessageInput = createMockNotificationMessageInput({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  templateInput: {
    mock: 'mock',
  },
  templateVersion: 1,
  notificationMessageTemplate: mockNotificationMessageTemplate,
});

export const mockAgency = createMockAgency({ code: 'MKAGCY', name: 'mockAgencyName' });

export const mockEservice = createMockEservice({
  name: 'mockEserviceName',
  emails: ['mockEserviceEmail1', 'mockEserviceEmail2'],
  agency: mockAgency,
});

export const mockApplication = createMockApplication({
  eservice: mockEservice,
});

export const mockTransaction = createMockTransaction({
  name: 'mockTransactionName',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
  application: mockApplication,
  notificationMessageInputs: [mockEmailNotificationMessageInput],
});

export const mockFileAsset = createMockFileAsset({
  name: 'mockFileAsset-1',
  type: FILE_ASSET_TYPE.TRANSFERRED,
  status: FILE_STATUS.ACTIVE,
  documentType: FILE_TYPE.OA,
  size: 1,
});

export const mockUser = createMockCitizenUser({ status: STATUS.ACTIVE, uin: 'S3002610A' });

export const mockActivity = createMockActivity({
  uuid: 'mockActivity-1',
  recipientInfo: {
    name: 'mockUserName',
    email: 'mockUserEmail',
  },
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockTransaction,
  fileAssets: [mockFileAsset],
  user: mockUser,
});

export const mockActivityWithoutEmail = createMockActivity({
  uuid: 'mockActivity-1',
  recipientInfo: {
    name: 'mockUserName',
  },
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockTransaction,
  fileAssets: [mockFileAsset],
});

export const mockTransactionWithoutNotificationMessageInput = createMockTransaction({
  name: 'mockTransactionName',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
  application: mockApplication,
  customAgencyMessage: {
    email: ['mockEmailCustomMessage'],
    transaction: ['mockTransactionCustomMessage'],
  },
});

export const mockActivityWithoutNotificationMessageInput = createMockActivity({
  uuid: 'mockActivity-1',
  recipientInfo: {
    name: 'mockUserName',
    email: 'mockUserEmail',
  },
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  transaction: mockTransactionWithoutNotificationMessageInput,
  fileAssets: [mockFileAsset],
});

export const mockEmailDeliveryFailureTemplateArgs: EmailDeliveryFailureTemplateArgs = {
  notificationPeriod: `30 Jun 2023 03:00 PM to 30 Jun 2023 07:00 PM`,
  eserviceName: 'eserviceCode',
  recipientName: 'mockUserName',
  baseUrl: mockFileSGConfigService.systemConfig.fileSGBaseURL,
};

export const mockSuccessPayload: FormSgIssuanceSuccessMessagePayload = {
  issuanceId: mockRecordId,
  requestorEmail: mockRequestorEmail,
  queueEventTimestamp: mockQueueEventTimestamp,
  hasNotificationToRecipientFailure: false,
  transaction: mockFormSgIssuanceSuccessPayloadTransaction,
};

export const mockSuccessMessageBody: FormSgIssuanceSuccessMessage = {
  event: EVENT.FORMSG_ISSUANCE_SUCCESS,
  payload: mockSuccessPayload,
};

export const mockSuccessWithFailedNotificationMessageBody: FormSgIssuanceSuccessMessage = {
  ...mockSuccessMessageBody,
  payload: { ...mockSuccessMessageBody.payload, hasNotificationToRecipientFailure: true },
};

export const mockFailurePayload: FormSgIssuanceFailureMessagePayload = {
  issuanceId: mockRecordId,
  requestorEmail: mockRequestorEmail,
  queueEventTimestamp: mockQueueEventTimestamp,
  failType: FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT,
  transaction: mockFormSgIssuanceSuccessPayloadTransaction,
};

export const mockFailureMessageBody: FormSgIssuanceFailureMessage = {
  event: EVENT.FORMSG_ISSUANCE_FAILURE,
  payload: mockFailurePayload,
};

export const mockBatchFailurePayload: FormSgIssuanceBatchTransactionFailureMessagePayload = {
  issuanceId: mockRecordId,
  requestorEmail: mockRequestorEmail,
  queueEventTimestamp: mockQueueEventTimestamp,
  hasNotificationToRecipientFailure: true,
  batchSize: 2,
  failedTransactionCount: 0,
};

export const mockBatchFailureMessageBody: FormSgIssuanceFailureMessage = {
  event: EVENT.FORMSG_ISSUANCE_FAILURE,
  payload: mockBatchFailurePayload,
};

export const mockBatchSidecarFailurePayload: FormSgIssuanceBatchProcessFailureMessagePayload = {
  issuanceId: mockRecordId,
  requestorEmail: mockRequestorEmail,
  queueEventTimestamp: mockQueueEventTimestamp,
  failType: FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION,
  failSubType: mockBatchSidecarErrorSubType,
};

export const mockBatchSidecareFailureMessageBody: FormSgIssuanceFailureMessage = {
  event: EVENT.FORMSG_ISSUANCE_FAILURE,
  payload: mockBatchSidecarFailurePayload,
};

export const mockEmailAttachments = [{ filename: mockReportFileName, contentType: mockContentType, base64Data: mockReportDataInBase64 }];
