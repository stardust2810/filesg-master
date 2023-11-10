import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  DateRange,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';

import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockApplicationType } from '../../../entities/application-type/__mocks__/application-type.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockNotificationHistory } from '../../../entities/notification-history/__mocks__/notification-history.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import {
  FailedNotification,
  FailedNotificationsByEservice,
  NotificationFailureReportingService,
  OPERATION_TYPE,
  TransformedFailedNotifications,
} from '../notification-failure-reporting.service';

// =============================================================================
// Test service
// =============================================================================
export class TestNotificationFailureReportingService extends NotificationFailureReportingService {
  public async retrieveAndTransFormFailedNotification(): Promise<TransformedFailedNotifications> {
    return super.retrieveAndTransFormFailedNotification();
  }

  public async sendCsvEmailAttachmentToEservice(
    failedNotificationsByEservice: FailedNotificationsByEservice,
    dateRange: DateRange,
  ): Promise<void> {
    return super.sendCsvEmailAttachmentToEservice(failedNotificationsByEservice, dateRange);
  }

  public async convertJsonToCsvFile(
    failedNotifications: FailedNotification[],
    dateRange: DateRange,
  ): Promise<{ filename: string; fileDataAsBase64: string; timeFormatForEmail: string }> {
    return super.convertJsonToCsvFile(failedNotifications, dateRange);
  }

  public subtractHoursAndResetTime(hoursToSubtract: number): Date {
    return super.subtractHoursAndResetTime(hoursToSubtract);
  }

  public async operateRedisCache(operationType: OPERATION_TYPE.GET): Promise<string | null>;
  public async operateRedisCache(operationType: OPERATION_TYPE.SAVE, notificationHistoryIds: number[]): Promise<'OK' | null>;
  public async operateRedisCache(operationType: OPERATION_TYPE, notificationHistoryIds?: number[]): Promise<string | 'OK' | null> {
    if (notificationHistoryIds) {
      return super.operateRedisCache(operationType as OPERATION_TYPE.SAVE, notificationHistoryIds);
    }

    return super.operateRedisCache(operationType as OPERATION_TYPE.GET);
  }

  public generateTimeFormatForDisplay({ startDate, endDate }: DateRange, timeFormat: string): string {
    return super.generateTimeFormatForDisplay({ startDate, endDate }, timeFormat);
  }
}

// =============================================================================
// Mocks
// =============================================================================
export const mockDateRange: DateRange = { startDate: new Date(), endDate: new Date() };

export const mockFailedNotification: FailedNotification = {
  AgencyRefID: 'mockAgencyRefId',
  TransactionID: 'mockTransactionId',
  TransactionType: 'mockTransactionType',
  ApplicationType: 'mockApplicationType',
  RecipientName: 'mockRecipientName',
  NotificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  FailureReason: 'mockFailureReason',
};

export const mockFailedNotificationsByEservice: FailedNotificationsByEservice = {
  eserviceName: 'mockEserviceName',
  emailRecipientName: 'mockRecipientName',
  eserviceEmailAddresses: ['mockEmail'],
  failedNotifications: [mockFailedNotification],
};

export const mockNoFailedNotificationsByEservice: FailedNotificationsByEservice = {
  eserviceName: 'mockEserviceName',
  emailRecipientName: 'mockRecipientName',
  eserviceEmailAddresses: ['mockEmail'],
  failedNotifications: [],
};

// Previous Job Notification
export const mockPreviousJobAgency = createMockAgency({
  name: 'mockPreviousJobAgencyName',
  code: 'mockPreviousJobAgencyCode',
});

export const mockPreviousJobEservice = createMockEservice({
  emails: ['mockPreviousJobEserviceEmail'],
  name: ' mockPreviousJobEserviceName',
  agency: mockPreviousJobAgency,
});

export const mockPreviousJobApplicationType = createMockApplicationType({
  code: 'mockPreviousJobAppTypeCode',
  name: 'mockPreviousJobAppTypeName',
});

export const mockPreviousJobApplication = createMockApplication({
  eservice: mockPreviousJobEservice,
  externalRefId: 'mockPreviousJobExternalRefId',
  applicationType: mockPreviousJobApplicationType,
});

export const mockPreviousJobTransaction = createMockTransaction({
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  name: 'mockPreviousJobTransactionName',
  application: mockPreviousJobApplication,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockPreviousJobActivity = createMockActivity({
  uuid: 'mock-activity-uuid-1',
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  recipientInfo: {
    name: 'mockPreviousJobName',
    email: 'mockPreviousJobEmail',
  },
  transaction: mockPreviousJobTransaction,
});

export const mockPreviousJobNotificationHistory = createMockNotificationHistory({
  id: 1,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.FAILED,
  activity: mockPreviousJobActivity,
  statusDetails: 'mockPreviousJobStatusDetail',
});

export const mockNotificationStuckInInitState = createMockNotificationHistory({
  id: 1,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.INIT,
  activity: mockPreviousJobActivity,
  statusDetails: 'mockPreviousJobStatusDetail',
});

// Current Job Notification
export const mockAgency = createMockAgency({
  name: 'mockAgencyName',
  code: 'mockAgencyCode',
});

export const mockEservice = createMockEservice({
  emails: ['mockEserviceEmail'],
  name: ' mockEserviceName',
  agency: mockAgency,
});

export const mockApplicationType = createMockApplicationType({
  code: 'mockAppTypeCode',
  name: 'mockAppTypeName',
});

export const mockApplication = createMockApplication({
  eservice: mockEservice,
  externalRefId: 'mockExternalRefId',
  applicationType: mockApplicationType,
});

export const mockTransaction = createMockTransaction({
  status: TRANSACTION_STATUS.COMPLETED,
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  name: 'mockTransactionName',
  application: mockApplication,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
});

export const mockActivity = createMockActivity({
  status: ACTIVITY_STATUS.COMPLETED,
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  recipientInfo: {
    name: 'mockName',
    email: 'mockEmail',
  },
  transaction: mockTransaction,
});

export const mockNotificationHistory = createMockNotificationHistory({
  id: 2,
  notificationChannel: NOTIFICATION_CHANNEL.EMAIL,
  status: NOTIFICATION_STATUS.FAILED,
  activity: mockActivity,
  statusDetails: 'mockStatusDetail',
});

export const mockCsvFileDetails = {
  filename: ' mockFileName',
  fileDataAsBase64: 'mockFileData',
  timeFormatForEmail: 'mockTime',
};
