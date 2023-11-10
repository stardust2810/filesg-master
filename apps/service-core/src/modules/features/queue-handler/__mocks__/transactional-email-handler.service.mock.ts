import { BouncedRecipient, SES_NOTIFICATION_TYPE, SESEmailNotificationMessage, SESMailObject } from '@filesg/aws';
import { EVENT_LOGGING_EVENTS } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { FILE_ASSET_TYPE } from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { EMAIL_TYPES } from '../../../../utils/email-template';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockEmail } from '../../../entities/email/__mocks__/email.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockNotificationHistory } from '../../../entities/notification-history/__mocks__/notification-history.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockAgencyUser, createMockCitizenUser } from '../../../entities/user/__mocks__/user.mock';
import { TransactionalEmailHandlerService } from '../events/email-type-handlers/transactional-email-handler.service';

export class TestTransactionalEmailHandlerService extends TransactionalEmailHandlerService {
  public async bouncedEmailsHandler(bouncedRecipients: BouncedRecipient[]) {
    return super.bouncedEmailsHandler(bouncedRecipients);
  }

  public async saveEventLogs(eventType: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS, transactionUuid: string, recipientActivityUuid: string, maskedUin: string, email: string): Promise<void> // prettier-ignore
  public async saveEventLogs(eventType: EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE, transactionUuid: string, recipientActivityUuid: string, maskedUin: string, email: string, failSubType: string, failedReason: string): Promise<void> // prettier-ignore
  public async saveEventLogs(
    eventType:
      | EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS
      | EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_FAILURE,
    transactionUuid: string,
    recipientActivityUuid: string,
    maskedUin: string,
    email: string,
    failSubType?: string,
    failedReason?: string,
  ) {
    return eventType === EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS
      ? super.saveEventLogs(eventType, transactionUuid, recipientActivityUuid, maskedUin, email)
      : super.saveEventLogs(eventType, transactionUuid, recipientActivityUuid, maskedUin, email, failSubType!, failedReason!);
  }
}

export const mockTransactionalEmailHandlerService: MockService<TransactionalEmailHandlerService> = {
  processMessage: jest.fn(),
};

export const mockDeliveryEmail = 'test@gmail.com';
export const mockBounceEmail = 'bounce@simulator.amazonses.com';
export const mockComplaintEmail = 'complaint@simulator.amazonses.com';
const MOCK_UUID_PREFIX = 'mock-email';
export const mockTransactionUuid1 = 'mock-transaction-uuid-1';
export const mockTransactionUuid2 = 'mock-transaction-uuid-1';
export const mockActivityUuid1 = 'mock-activity-uuid-1';
export const mockActivityUuid2 = 'mock-activity-uuid-2';
export const mockUserUin = 'S3002610A';
export const mockMessageId = 'mock-message-id-1';
export const mockSource = 'source@email.com';
export const mockMaskedUin = 'S****610A';
export const mockFailSubType = 'fail sub type';
export const mockFailedReason = 'some error';

export const mockBouncedRecipients = [{ emailAddress: mockBounceEmail }];

const mockAgency = createMockAgency({
  uuid: `mock-agency-01`,
  name: `mock agency`,
  code: `ma`,
});

const mockAgencyUser = createMockAgencyUser({
  status: STATUS.ACTIVE,
});

const mockApplication = createMockApplication({
  id: 1,
  uuid: 'mock-application-01',
});

const mockEservice = createMockEservice({
  uuid: `mock-eservice-01`,
  name: `mock eservice`,
  emails: [`mock@eservice.com`],
  agency: mockAgency,
  applications: [mockApplication],
  users: [mockAgencyUser],
  agencyId: 1,
});

const mockTransactionApplication = createMockApplication({
  uuid: `${MOCK_UUID_PREFIX}-application-01`,
  eservice: mockEservice,
  externalRefId: null,
});

const mockFileAsset = createMockFileAsset({
  uuid: 'mockFileAsset-uuid-1',
  name: 'mockFile',
  type: FILE_ASSET_TYPE.UPLOADED,
  documentType: FILE_TYPE.JPEG,
  status: FILE_STATUS.ACTIVE,
  size: 123,
  metadata: {},
  oaCertificate: null,
});

const mockCitizenUser = createMockCitizenUser({
  name: 'Jason Bourne',
  uuid: `${MOCK_UUID_PREFIX}-user-01`,
  uin: mockUserUin,
  email: mockBounceEmail,
  status: STATUS.ACTIVE,
});

const mockTransactionActivity = createMockActivity({
  uuid: `${MOCK_UUID_PREFIX}-activity-02`,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  emails: [],
  fileAssets: [mockFileAsset],
  user: mockCitizenUser,
  recipientInfo: {
    name: 'user-1',
    dob: '2000-01-01',
    email: mockBounceEmail,
    mobile: '81456789',
  },
});

const mockTransaction = createMockTransaction({
  uuid: mockTransactionUuid1,
  status: TRANSACTION_STATUS.COMPLETED,
  name: 'LTVP Issuance',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.FORMSG,
  fileSessionId: `${MOCK_UUID_PREFIX}-filesession-01`,
  customAgencyMessage: {
    transaction: ['para-1', 'para-2'],
    email: ['para-1', 'para-2'],
  },
  application: mockTransactionApplication,
  activities: [mockTransactionActivity],
});

const mockTransaction2 = createMockTransaction({
  uuid: mockTransactionUuid2,
  status: TRANSACTION_STATUS.COMPLETED,
  name: 'LTVP Issuance',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  fileSessionId: `${MOCK_UUID_PREFIX}-filesession-01`,
  customAgencyMessage: {
    transaction: ['para-1', 'para-2'],
    email: ['para-1', 'para-2'],
  },
  application: mockTransactionApplication,
  activities: [mockTransactionActivity],
});

export const mockActivity1 = createMockActivity({
  uuid: mockActivityUuid1,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  emails: [],
  fileAssets: [mockFileAsset],
  user: mockCitizenUser,
  recipientInfo: {
    name: 'user-1',
    dob: '2000-01-01',
    email: `valid@email.com`,
    mobile: '81456789',
  },
  transaction: mockTransaction,
});

export const mockActivity2 = createMockActivity({
  uuid: mockActivityUuid2,
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  emails: [],
  fileAssets: [mockFileAsset],
  user: mockCitizenUser,
  recipientInfo: {
    name: 'user-1',
    dob: '2000-01-01',
    email: `valid@email.com`,
    mobile: '81456789',
  },
  transaction: mockTransaction2,
});

export const mockIssuanceBounceEmail = createMockEmail({
  id: 1,
  awsMessageId: '1111-2222-3333-4444',
  activity: mockActivity1,
  type: EMAIL_TYPES.ISSUANCE,
  emailId: mockBounceEmail,
  eventType: null,
  subEventType: null,
});

export const mockNotificationHistory1 = createMockNotificationHistory({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.SUCCESS,
  messageId: 'mock-message-id-01',
  activity: mockActivity1,
});

export const mockNotificationHistory2 = createMockNotificationHistory({
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.SUCCESS,
  messageId: 'mock-message-id-01',
  activity: mockActivity2,
});

// =============================================================================
// Email Sending Message
// =============================================================================
const mockSesMailObject: SESMailObject = {
  timestamp: new Date().toISOString(),
  messageId: mockMessageId,
  source: mockSource,
  sourceArn: mockSource,
  sourceIp: '127.0.0.1',
  sendingAccountId: 'mock-sending-account-id-01',
  destination: [],
};

export const mockIssuanceEmailNotificationMessageDelivery: SESEmailNotificationMessage = {
  notificationType: SES_NOTIFICATION_TYPE.DELIVERY,
  mail: {
    ...mockSesMailObject,
    destination: [mockDeliveryEmail],
  },
  delivery: {
    timestamp: new Date().toISOString(),
    processingTimeMillis: 100,
    recipients: mockDeliveryEmail,
    smtpResponse: 'smtpResponse',
    reportingMTA: 'reportingMTA',
    remoteMtaIp: '127.0.0.1',
  },
};

export const mockIssuanceEmailNotificationMessageBounce: SESEmailNotificationMessage = {
  notificationType: SES_NOTIFICATION_TYPE.BOUNCE,
  mail: {
    ...mockSesMailObject,
    destination: [mockBounceEmail],
  },
  bounce: {
    bounceType: 'Permanent',
    bounceSubType: 'NoEmail',
    bouncedRecipients: mockBouncedRecipients,
    timestamp: new Date().toISOString(),
    feedbackId: `mock-feedback-id-01`,
  },
};

export const mockIssuanceEmailNotificationMessageComplaint: SESEmailNotificationMessage = {
  notificationType: SES_NOTIFICATION_TYPE.COMPLAINT,
  mail: {
    ...mockSesMailObject,
    destination: [mockComplaintEmail],
  },
  complaint: {
    complainedRecipients: [
      {
        emailAddress: mockComplaintEmail,
      },
    ],
    timestamp: new Date().toISOString(),
    feedbackId: 'feedback-id-1',
    complaintSubType: 'OnAccountSuppressionList',
    complaintFeedbackType: 'abuse',
    arrivalDate: new Date().toISOString(),
  },
};
