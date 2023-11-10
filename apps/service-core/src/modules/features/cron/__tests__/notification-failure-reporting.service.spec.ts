/* eslint-disable sonarjs/no-duplicate-string */
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Test, TestingModule } from '@nestjs/testing';
const json2csvLib = require('json-2-csv');

import { Logger } from '@nestjs/common';
import { format, subHours } from 'date-fns';

import { mockNotificationHistoryEntityService } from '../../../entities/notification-history/__mocks__/notification-history.entity.service.mock';
import { NotificationHistoryEntityService } from '../../../entities/notification-history/notification-history.entity.service';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.service.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockFileSGRedisService } from '../../../setups/redis/__mocks__/redis.service.mock';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import {
  mockCsvFileDetails,
  mockDateRange,
  mockFailedNotification,
  mockFailedNotificationsByEservice,
  mockNoFailedNotificationsByEservice,
  mockNotificationHistory,
  mockNotificationStuckInInitState,
  mockPreviousJobNotificationHistory,
  TestNotificationFailureReportingService,
} from '../__mocks__/notification-failure-reporting.service.mock';
import { OPERATION_TYPE } from '../notification-failure-reporting.service';

describe('NotificationFailureReportingService', () => {
  let service: TestNotificationFailureReportingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestNotificationFailureReportingService,
        {
          provide: NotificationHistoryEntityService,
          useValue: mockNotificationHistoryEntityService,
        },
        {
          provide: RedisService,
          useValue: mockFileSGRedisService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: FileSGConfigService,
          useValue: mockFileSGConfigService,
        },
      ],
    }).compile();

    service = module.get<TestNotificationFailureReportingService>(TestNotificationFailureReportingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateNotificationFailureReport', () => {
    let retrieveAndTransFormFailedNotificationSpy: jest.SpyInstance;
    let sendCsvEmailAttachmentToEserviceSpy: jest.SpyInstance;

    beforeAll(() => {
      retrieveAndTransFormFailedNotificationSpy = jest.spyOn(service, 'retrieveAndTransFormFailedNotification');
      sendCsvEmailAttachmentToEserviceSpy = jest.spyOn(service, 'sendCsvEmailAttachmentToEservice');
    });

    afterAll(() => {
      retrieveAndTransFormFailedNotificationSpy.mockRestore();
      sendCsvEmailAttachmentToEserviceSpy.mockRestore();
    });

    it('should be defined', () => {
      expect(service.generateNotificationFailureReport).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      retrieveAndTransFormFailedNotificationSpy.mockResolvedValueOnce({
        dateRange: mockDateRange,
        failedNotificationsByEservices: { mockEserviceCode: mockFailedNotificationsByEservice },
      });

      await service.generateNotificationFailureReport();

      expect(retrieveAndTransFormFailedNotificationSpy).toBeCalledTimes(1);
      expect(sendCsvEmailAttachmentToEserviceSpy).toBeCalledWith(mockFailedNotificationsByEservice, mockDateRange);
    });

    it('should not send email if no failed notifications', async () => {
      retrieveAndTransFormFailedNotificationSpy.mockResolvedValueOnce({
        dateRange: mockDateRange,
        failedNotificationsByEservices: { mockEserviceCode: mockNoFailedNotificationsByEservice },
      });

      await service.generateNotificationFailureReport();

      expect(sendCsvEmailAttachmentToEserviceSpy).not.toBeCalled();
    });
  });

  describe('retrieveAndTransFormFailedNotification', () => {
    const { startDate, endDate } = mockDateRange;

    let subtractHoursAndResetTimeSpy: jest.SpyInstance;
    let operateRedisCacheSpy: jest.SpyInstance;

    beforeAll(() => {
      subtractHoursAndResetTimeSpy = jest.spyOn(service, 'subtractHoursAndResetTime');
      operateRedisCacheSpy = jest.spyOn(service, 'operateRedisCache');
    });

    beforeEach(() => {
      subtractHoursAndResetTimeSpy.mockReturnValueOnce(startDate!).mockReturnValueOnce(endDate!);

      mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoriesByIds.mockResolvedValueOnce([
        mockPreviousJobNotificationHistory,
      ]);
      mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoryByDateRange.mockResolvedValueOnce([
        mockNotificationHistory,
      ]);
    });

    afterAll(() => {
      subtractHoursAndResetTimeSpy.mockRestore();
      operateRedisCacheSpy.mockRestore();
    });

    it('should be defined', () => {
      expect(service.retrieveAndTransFormFailedNotification).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      operateRedisCacheSpy.mockResolvedValueOnce(null);

      await service.retrieveAndTransFormFailedNotification();

      expect(subtractHoursAndResetTimeSpy).nthCalledWith(1, 5);
      expect(subtractHoursAndResetTimeSpy).nthCalledWith(2, 1);

      expect(operateRedisCacheSpy).toBeCalledWith(OPERATION_TYPE.GET);
      expect(mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoriesByIds).not.toBeCalled();
      expect(mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoryByDateRange).toBeCalledWith(mockDateRange);
      expect(operateRedisCacheSpy).toBeCalledWith(OPERATION_TYPE.SAVE, []);
    });

    it('should return the correct values', async () => {
      operateRedisCacheSpy.mockResolvedValueOnce(null); //FIXME: not able to match overload

      expect(await service.retrieveAndTransFormFailedNotification()).toEqual({
        dateRange: mockDateRange,
        failedNotificationsByEservices: {
          ' mockEserviceName': {
            emailRecipientName: 'mockAgencyName (mockAgencyCode)',
            eserviceEmailAddresses: ['mockEserviceEmail'],
            eserviceName: ' mockEserviceName',
            failedNotifications: [
              {
                AgencyRefID: 'mockExternalRefId',
                ApplicationType: 'mockAppTypeCode',
                FailureReason: undefined,
                NotificationChannel: 'EMAIL',
                RecipientEmail: 'mockEmail',
                RecipientName: 'mockName',
                TransactionID: undefined,
                TransactionType: 'upload_transfer',
              },
            ],
          },
        },
      });
    });

    it('should retrieve previous job notification histories if ids are stored in redis and return failedNotification array', async () => {
      operateRedisCacheSpy.mockResolvedValueOnce(`[${mockPreviousJobNotificationHistory.id}]` as 'OK'); //FIXME: not able to match overload

      expect(await service.retrieveAndTransFormFailedNotification()).toEqual({
        dateRange: mockDateRange,
        failedNotificationsByEservices: {
          ' mockEserviceName': {
            emailRecipientName: 'mockAgencyName (mockAgencyCode)',
            eserviceEmailAddresses: ['mockEserviceEmail'],
            eserviceName: ' mockEserviceName',
            failedNotifications: [
              {
                AgencyRefID: 'mockExternalRefId',
                ApplicationType: 'mockAppTypeCode',
                FailureReason: undefined,
                NotificationChannel: 'EMAIL',
                RecipientEmail: 'mockEmail',
                RecipientName: 'mockName',
                TransactionID: undefined,
                TransactionType: 'upload_transfer',
              },
            ],
          },
          ' mockPreviousJobEserviceName': {
            emailRecipientName: 'mockPreviousJobAgencyName (mockPreviousJobAgencyCode)',
            eserviceEmailAddresses: ['mockPreviousJobEserviceEmail'],
            eserviceName: ' mockPreviousJobEserviceName',
            failedNotifications: [
              {
                AgencyRefID: 'mockPreviousJobExternalRefId',
                ApplicationType: 'mockPreviousJobAppTypeCode',
                FailureReason: undefined,
                NotificationChannel: 'EMAIL',
                RecipientEmail: 'mockPreviousJobEmail',
                RecipientName: 'mockPreviousJobName',
                TransactionID: 'mock-activity-uuid-1',
                TransactionType: 'upload_transfer',
              },
            ],
          },
        },
      });

      expect(mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoriesByIds).toBeCalledWith([
        mockPreviousJobNotificationHistory.id,
      ]);
    });

    it('should log error if there is notification stuck in init state for more than 24 hours', async () => {
      operateRedisCacheSpy.mockResolvedValueOnce(`[${mockPreviousJobNotificationHistory.id}]` as 'OK'); //FIXME: not able to match overload
      mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoriesByIds.mockReset();
      mockNotificationHistoryEntityService.retrieveNonSuccessNotificationHistoriesByIds.mockResolvedValueOnce([
        { ...mockNotificationStuckInInitState, createdAt: subHours(new Date(), 25) },
      ]);
      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error');

      await service.retrieveAndTransFormFailedNotification();
      expect(loggerErrorSpy).toBeCalledTimes(1);
      expect(loggerErrorSpy).toBeCalledWith(
        `NotificationHistoryIds that has been stuck for more than 24 hours: [{"notificationHistoryId":1,"activityUuid":"mock-activity-uuid-1"}]`,
      );
    });
  });

  describe('sendCsvEmailAttachmentToEservice', () => {
    it('should be defined', () => {
      expect(service.sendCsvEmailAttachmentToEservice).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      const { failedNotifications, eserviceEmailAddresses, emailRecipientName, eserviceName } = mockFailedNotificationsByEservice;
      const { filename, fileDataAsBase64: base64Data, timeFormatForEmail: notificationPeriod } = mockCsvFileDetails;

      const convertJsonToCsvFileSpy = jest.spyOn(service, 'convertJsonToCsvFile');
      convertJsonToCsvFileSpy.mockResolvedValueOnce(mockCsvFileDetails);

      await service.sendCsvEmailAttachmentToEservice(mockFailedNotificationsByEservice, mockDateRange);

      expect(convertJsonToCsvFileSpy).toBeCalledWith(failedNotifications, mockDateRange);
      expect(mockEmailService.sendAgencyDeliveryFailureEmail).toBeCalledWith(
        eserviceEmailAddresses,
        {
          eserviceName,
          notificationPeriod,
          recipientName: emailRecipientName,
          baseUrl: mockFileSGConfigService.systemConfig.fileSGBaseURL,
        },
        [{ filename, contentType: 'text/csv', base64Data }],
      );

      convertJsonToCsvFileSpy.mockRestore();
    });
  });

  describe('convertJsonToCsvFile', () => {
    let generateTimeFormatForDisplaySpy: jest.SpyInstance;
    let json2csvSpy: jest.SpyInstance;

    beforeAll(() => {
      generateTimeFormatForDisplaySpy = jest.spyOn(service, 'generateTimeFormatForDisplay');
      json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');
    });

    beforeEach(() => {
      generateTimeFormatForDisplaySpy.mockReturnValueOnce('mockFilenameTimeFormat').mockReturnValueOnce('mockEmailTimeFormat');
    });

    afterAll(() => {
      generateTimeFormatForDisplaySpy.mockRestore();
      json2csvSpy.mockRestore();
    });

    it('should be defined', () => {
      expect(service.convertJsonToCsvFile).toBeDefined();
    });

    it('should call correct methods with correct args', async () => {
      await service.convertJsonToCsvFile([mockFailedNotification], mockDateRange);

      expect(generateTimeFormatForDisplaySpy).nthCalledWith(1, mockDateRange, 'yyyyMMdd_haa');
      expect(generateTimeFormatForDisplaySpy).nthCalledWith(2, mockDateRange, 'dd MMM yyyy hh:mm aa');
      expect(json2csvSpy).toBeCalledWith([mockFailedNotification], { prependHeader: true });
    });

    it('should return filename, base64 file date & timeFormat string for email', async () => {
      json2csvSpy.mockResolvedValueOnce('mockFailedNotificationsCsv');

      const mockFileDataAsBase64 = Buffer.from('mockFailedNotificationsCsv').toString('base64');

      expect(await service.convertJsonToCsvFile([mockFailedNotification], mockDateRange)).toEqual({
        filename: `FailedNotifications_mockFilenameTimeFormat.csv`,
        fileDataAsBase64: mockFileDataAsBase64,
        timeFormatForEmail: 'mockEmailTimeFormat',
      });
    });
  });

  describe('subtractHoursAndResetTime', () => {
    it('should be defined', () => {
      expect(service.subtractHoursAndResetTime).toBeDefined();
    });

    it('should return the correct hour from subtracting current time from hoursToSubstract', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2023-01-01, 15:34:29'));

      expect(service.subtractHoursAndResetTime(5)).toEqual(new Date('2023-01-01, 10:00:00'));

      jest.useRealTimers();
    });
  });

  describe('operateRedisCache', () => {
    const INIT_STATE_NOTIFICATION_IDS_KEY = 'init-state-notification-ids-key';

    it('should be defined', () => {
      expect(service.operateRedisCache).toBeDefined();
    });

    it('should call get command with INIT_STATE_NOTIFICATION_IDS_KEY to retrieve list of init state notification ids from previous job, when called with OPERATION_TYPE.GET', () => {
      service.operateRedisCache(OPERATION_TYPE.GET);

      expect(mockFileSGRedisService.get).toBeCalledWith(FILESG_REDIS_CLIENT.FAILED_NOTIFICATION_REPORT, INIT_STATE_NOTIFICATION_IDS_KEY);
    });

    it('should call set command to save the init state notifition id list, when called with OPERATION_TYPE.SAVE', () => {
      service.operateRedisCache(OPERATION_TYPE.SAVE, [1, 2]);

      expect(mockFileSGRedisService.set).toBeCalledWith(
        FILESG_REDIS_CLIENT.FAILED_NOTIFICATION_REPORT,
        INIT_STATE_NOTIFICATION_IDS_KEY,
        JSON.stringify([1, 2]),
      );
    });
  });

  describe('generateTimeFormatForDisplay', () => {
    it('should be defined', () => {
      expect(service.generateTimeFormatForDisplay).toBeDefined();
    });

    it('should return datetime format string', () => {
      const { startDate, endDate } = mockDateRange;
      const mockTimeFormat = 'yyyyMMdd_haa';
      expect(service.generateTimeFormatForDisplay(mockDateRange, mockTimeFormat)).toEqual(
        `${format(startDate!, mockTimeFormat)} to ${format(endDate!, mockTimeFormat)}`,
      );
    });
  });
});
