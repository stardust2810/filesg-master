import { DateRange, NOTIFICATION_CHANNEL, NOTIFICATION_STATUS } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { differenceInHours, format, subHours } from 'date-fns';
import { json2csv } from 'json-2-csv';

import { NotificationHistory } from '../../../entities/notification-history';
import { NotificationHistoryEntityService } from '../../entities/notification-history/notification-history.entity.service';
import { FileSGConfigService } from '../../setups/config/config.service';
import { EmailService } from '../notification/email.service';

const CONSIDERED_FAIL_AFTER_HOURS = 24;

export enum OPERATION_TYPE {
  SAVE = 'save',
  GET = 'get',
}
export interface FailedNotification {
  AgencyRefID: string | null;
  TransactionID: string;
  TransactionType: string;
  ApplicationType: string;
  RecipientName: string;
  NotificationChannel: NOTIFICATION_CHANNEL;
  FailureReason: string | null;
  RecipientEmail?: string;
}

export interface FailedNotificationsByEservice {
  eserviceName: string;
  emailRecipientName: string;
  eserviceEmailAddresses: string[];
  failedNotifications: FailedNotification[];
}

export interface TransformedFailedNotifications {
  dateRange: DateRange;
  failedNotificationsByEservices: Record<string, FailedNotificationsByEservice>;
}

export interface NotificationsStuckAtInitState {
  notificationHistoryId: number;
  activityUuid: string;
}

@Injectable()
export class NotificationFailureReportingService {
  private logger = new Logger(NotificationFailureReportingService.name);

  constructor(
    private readonly notificationHistoryEntityService: NotificationHistoryEntityService,
    private readonly redisService: RedisService,
    private readonly emailService: EmailService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  public async generateNotificationFailureReport() {
    this.logger.log(`[Start] Generating notification delivery failure report(s)`);
    const { dateRange, failedNotificationsByEservices } = await this.retrieveAndTransFormFailedNotification();

    for await (const [eserviceCode, failedNotificationsByEservice] of Object.entries(failedNotificationsByEservices)) {
      if (failedNotificationsByEservice.failedNotifications.length > 0) {
        await this.sendCsvEmailAttachmentToEservice(failedNotificationsByEservice, dateRange);
      } else {
        this.logger.log(`No failed notifications for eservice: ${eserviceCode}`);
      }
    }

    this.logger.log(`[END] Completed notification delivery failure report(s)`);
  }

  protected async retrieveAndTransFormFailedNotification(): Promise<TransformedFailedNotifications> {
    // searching between the window of T-5 >= time window < T-1;
    const dateRange: DateRange = {
      startDate: this.subtractHoursAndResetTime(5), // 5 hours
      endDate: this.subtractHoursAndResetTime(1), // 1 hour
    };

    this.logger.log(`Date Range: ${dateRange.startDate?.toLocaleString()} to ${dateRange.endDate?.toLocaleString()}`);

    const previousJobInitStateNotificationHistoryIdsString = await this.operateRedisCache(OPERATION_TYPE.GET);
    let previousJobInitStateNotificationHistoryIds: number[] = [];
    let previousJobInitStateNotificationHistory: NotificationHistory[] = [];

    if (previousJobInitStateNotificationHistoryIdsString) {
      previousJobInitStateNotificationHistoryIds = JSON.parse(previousJobInitStateNotificationHistoryIdsString) as number[];

      if (previousJobInitStateNotificationHistoryIds.length > 0) {
        this.logger.log(`Total ids to be processed from previous run: ${previousJobInitStateNotificationHistoryIds.length}`);
        previousJobInitStateNotificationHistory = await this.notificationHistoryEntityService.retrieveNonSuccessNotificationHistoriesByIds(
          previousJobInitStateNotificationHistoryIds,
        );
      }
    }

    const notificationHistoriesToProcess = await this.notificationHistoryEntityService.retrieveNonSuccessNotificationHistoryByDateRange(
      dateRange,
    );

    if (notificationHistoriesToProcess.length > 0) {
      this.logger.log(`Failed notifications for current run: ${notificationHistoriesToProcess.map(({ id }) => id)}`);
    }

    const totalNotificationHistoriesToProcess = [...previousJobInitStateNotificationHistory, ...notificationHistoriesToProcess];
    if (totalNotificationHistoriesToProcess.length > 0) {
      this.logger.log(
        `Total notification histories to process in current cronjob run: ${totalNotificationHistoriesToProcess
          .map(({ id }) => id)
          .toString()}`,
      );
    }
    const notificationHistoryIdsToBeProcessedinNextJob: number[] = [];
    const failedNotificationsByEservices: Record<string, FailedNotificationsByEservice> = {};

    const notificationsStuckAtInitState: NotificationsStuckAtInitState[] = [];
    totalNotificationHistoriesToProcess.forEach((notificationHistory) => {
      const {
        status: notificationHistoryStatus,
        id: notificationHistoryId,
        createdAt: notificationCreatedAt,
        notificationChannel,
        statusDetails,
      } = notificationHistory;
      const { transaction, uuid: activityUuid, recipientInfo } = notificationHistory.activity!;

      if (notificationHistoryStatus === NOTIFICATION_STATUS.FAILED) {
        const { name: recipientName, email: recipientEmail } = recipientInfo!;
        const { name: eserviceName, emails, agency } = transaction!.application!.eservice!;
        const { name: agencyName, code: agencyCode } = agency!;
        if (!failedNotificationsByEservices[eserviceName]) {
          failedNotificationsByEservices[eserviceName] = {
            eserviceName,
            emailRecipientName: `${agencyName} (${agencyCode})`,
            eserviceEmailAddresses: emails,
            failedNotifications: [],
          };
        }

        // The property name are in CAPS to appear as it is in csv
        failedNotificationsByEservices[eserviceName].failedNotifications.push({
          AgencyRefID: transaction!.application!.externalRefId,
          TransactionID: activityUuid,
          TransactionType: transaction!.type,
          ApplicationType: transaction!.application!.applicationType!.code,
          RecipientName: recipientName,
          NotificationChannel: notificationChannel,
          FailureReason: statusDetails,
          ...(recipientEmail && { RecipientEmail: recipientEmail }),
        });
      } else {
        const totalHoursNotificationStuckAtInitState = differenceInHours(new Date(), notificationCreatedAt);
        if (totalHoursNotificationStuckAtInitState >= CONSIDERED_FAIL_AFTER_HOURS) {
          return notificationsStuckAtInitState.push({ notificationHistoryId, activityUuid });
        }
        notificationHistoryIdsToBeProcessedinNextJob.push(notificationHistoryId);
      }
    });

    if (notificationsStuckAtInitState.length > 0) {
      this.logger.error(
        `NotificationHistoryIds that has been stuck for more than 24 hours: ${JSON.stringify(notificationsStuckAtInitState)}`,
      );
    }

    if (notificationHistoryIdsToBeProcessedinNextJob.length > 0) {
      this.logger.log(`Ids to be processed on next job run: ${JSON.stringify(notificationHistoryIdsToBeProcessedinNextJob.toString())}`);
    }
    await this.operateRedisCache(OPERATION_TYPE.SAVE, notificationHistoryIdsToBeProcessedinNextJob);
    return { dateRange, failedNotificationsByEservices };
  }

  protected async sendCsvEmailAttachmentToEservice(failedNotificationsByEservice: FailedNotificationsByEservice, dateRange: DateRange) {
    const { failedNotifications, eserviceEmailAddresses, emailRecipientName, eserviceName } = failedNotificationsByEservice;
    const {
      filename,
      fileDataAsBase64: base64Data,
      timeFormatForEmail: notificationPeriod,
    } = await this.convertJsonToCsvFile(failedNotifications, dateRange);

    const contentType = 'text/csv';
    await this.emailService.sendAgencyDeliveryFailureEmail(
      eserviceEmailAddresses,
      {
        eserviceName,
        notificationPeriod,
        recipientName: emailRecipientName,
        baseUrl: this.fileSGConfigService.systemConfig.fileSGBaseURL,
      },
      [{ filename, contentType, base64Data }],
    );

    this.logger.log(
      `Email sent to eservice:${eserviceName} with attachment. Total no of failed notification: ${failedNotifications.length}`,
    );
  }

  protected async convertJsonToCsvFile(failedNotifications: FailedNotification[], dateRange: DateRange) {
    const timeFormatForFileName = this.generateTimeFormatForDisplay(dateRange, 'yyyyMMdd_haa').replaceAll(' ', '_');
    const timeFormatForEmail = this.generateTimeFormatForDisplay(dateRange, 'dd MMM yyyy hh:mm aa');

    const failedNotificationsFileName = `FailedNotifications_${timeFormatForFileName}.csv`;
    const failedNotificationsCSV = await json2csv(failedNotifications, { prependHeader: true });
    const failedNotificationsJSONDataAsBase64 = Buffer.from(failedNotificationsCSV).toString('base64');
    return {
      filename: failedNotificationsFileName,
      fileDataAsBase64: failedNotificationsJSONDataAsBase64,
      timeFormatForEmail,
    };
  }

  /**
   * Returns Date object at current time minus h hours, at 0 mins & 0 secs
   * e.g. At 15:34:29, subtractHoursAndResetTime(5) returns 10:00:00
   */
  protected subtractHoursAndResetTime(hoursToSubtract: number) {
    const subtractedTime = subHours(new Date(), hoursToSubtract);
    subtractedTime.setMinutes(0);
    subtractedTime.setSeconds(0);
    subtractedTime.setMilliseconds(0);
    return subtractedTime;
  }

  protected async operateRedisCache(operationType: OPERATION_TYPE.GET): Promise<string | null>;
  protected async operateRedisCache(operationType: OPERATION_TYPE.SAVE, notificationHistoryIds: number[]): Promise<'OK' | null>;
  protected async operateRedisCache(
    operationType: OPERATION_TYPE,
    notificationHistoryIds?: number[] | never,
  ): Promise<string | 'OK' | null> {
    const INIT_STATE_NOTIFICATION_IDS_KEY = 'init-state-notification-ids-key';
    if (operationType === OPERATION_TYPE.GET) {
      return await this.redisService.get(FILESG_REDIS_CLIENT.FAILED_NOTIFICATION_REPORT, INIT_STATE_NOTIFICATION_IDS_KEY);
    } else {
      return await this.redisService.set(
        FILESG_REDIS_CLIENT.FAILED_NOTIFICATION_REPORT,
        INIT_STATE_NOTIFICATION_IDS_KEY,
        JSON.stringify(notificationHistoryIds),
      );
    }
  }

  protected generateTimeFormatForDisplay({ startDate, endDate }: DateRange, timeFormat: string) {
    return `${format(startDate!, timeFormat)} to ${format(endDate!, timeFormat)}`;
  }
}
