import {
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  COMPONENT_ERROR_CODE,
  DateRange,
  FILE_STATISTICS_AUDIT_EVENTS,
  FileSgStatisticsReportRequest,
  FileSgUserActionsReportRequest,
  MIME_TYPE,
  TransactionReportRequest,
} from '@filesg/common';
import { ZippingFile, ZipService } from '@filesg/zipper';
import { Injectable, Logger } from '@nestjs/common';
import { endOfDay, format, startOfDay } from 'date-fns';
import { createReadStream, existsSync } from 'fs';
import { appendFile, mkdir, rm } from 'fs/promises';
import { json2csv } from 'json-2-csv';
import { join } from 'path';
import { v4 as uuid } from 'uuid';

import { ReportGenerationException } from '../../../common/filters/custom-exceptions.filter';
import { Agency } from '../../../entities/agency';
import {
  ActivityReport,
  AgencyFilesDownloadAuditEvent,
  DocumentStatisticsReportEntry,
  FileDownloadReport,
  FileReport,
  UserFilesAuditEventData,
} from '../../../typings/common';
import { AgencyEntityService } from '../../entities/agency/agency.entity.service';
import { UserActionRawResult } from '../../entities/audit-event/audit-event.entity.repository';
import { AuditEventEntityService } from '../../entities/audit-event/audit-event.entity.service';
import { EserviceEntityService } from '../../entities/eservice/eservice.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { UserEntityService } from '../../entities/user/user.entity.service';
import { EmailService } from '../notification/email.service';

export type FileDownloadCount = Map<string, { val: number }>;
export const USER_ACTIONS_REPORT_QUERY_CHUNK_SIZE = 100 * 1000;
export interface GenerateFileDownloadReportResponse {
  userFileDownloadReportFileName: string;
  agencyFileDownloadReportFileName: string;
  fileDownloadCountMap: FileDownloadCount;
}

type AuditEventType = UserFilesAuditEventData | AgencyFilesDownloadAuditEvent;

@Injectable()
export class ReportingService {
  private readonly logger = new Logger(ReportingService.name);

  constructor(
    private readonly agencyEntityService: AgencyEntityService,
    private readonly auditEventEntityService: AuditEventEntityService,
    private readonly eserviceEntityService: EserviceEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly userEntityService: UserEntityService,
    private readonly emailService: EmailService,
    private readonly zipService: ZipService,
  ) {}

  public async generateAgencyTransactionsReport({
    agencyCode,
    eserviceCode,
    startDate: startDateString,
    endDate: endDateString,
  }: TransactionReportRequest) {
    const startDate = startOfDay(new Date(startDateString));
    const endDate = endOfDay(new Date(endDateString));

    // Get agency id using agency code
    const agency = await this.agencyEntityService.retrieveAgencyByCode(agencyCode, { select: ['id'] });

    // Get eservice ids under agency using agency code
    const eserviceIdsToQuery = await this.getEserviceIdsToQuery(agency, eserviceCode);

    const tempDirName = uuid();
    try {
      await mkdir(tempDirName);

      const { userFileDownloadReportFileName, agencyFileDownloadReportFileName, fileDownloadCountMap } =
        await this.generateFileDownloadReport(agencyCode, tempDirName, eserviceIdsToQuery, startDate, endDate);

      const { activityFileName, fileReportFileName } = await this.generateActivityAndFileReport(
        eserviceIdsToQuery,
        tempDirName,
        fileDownloadCountMap,
        startDate,
        endDate,
      );

      const filesToZip: ZippingFile[] = [
        { name: `01-${activityFileName}`, body: createReadStream(`${tempDirName}/${activityFileName}`) },
        { name: `02-${fileReportFileName}`, body: createReadStream(`${tempDirName}/${fileReportFileName}`) },
        { name: `03-${userFileDownloadReportFileName}`, body: createReadStream(`${tempDirName}/${userFileDownloadReportFileName}`) },
        { name: `04-${agencyFileDownloadReportFileName}`, body: createReadStream(`${tempDirName}/${agencyFileDownloadReportFileName}`) },
      ];

      const archiver = await this.zipService.zipToStream(filesToZip, undefined, false);
      archiver.on('finish', async () => {
        await rm(tempDirName, { recursive: true, force: true });
      });

      archiver.finalize();

      const zipFileName = `${agencyCode}-report-${this.formatDate(new Date(), true).replaceAll(' ', '-')}.zip`;

      return { type: 'application/zip', stream: archiver, zipFileName };
    } catch (error) {
      if (existsSync(tempDirName)) {
        await rm(tempDirName, { recursive: true, force: true });
      }
      throw new ReportGenerationException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, 'agency transactions', (error as Error).message);
    }
  }

  /**
   * Sending email with attachment requires the files to be generated in the mimeText string in base64 form, hence files are created in memory
   * File size are small (3 csvs, <1kb). To take note if size becomes bigger
   */
  public async generateFileSgStatisticsReport({
    startDate: startDateString,
    endDate: endDateString,
    emails,
  }: FileSgStatisticsReportRequest) {
    try {
      const startDate = startOfDay(new Date(startDateString));
      const endDate = endOfDay(new Date(endDateString));

      // Generate Document statictis
      const { documentStatisticsReportName, documentStatisticsReportCsvData } = await this.generateDocumentIssuanceStatisticsReport(
        startDate,
        endDate,
      );
      // Generate overall citizen onboard count
      const { totalOnboardedCitizenUserCountReportName, totalOnboardedCitizenUserCountReportCsvData } =
        await this.generateTotalOnboardedUserCountReport();
      // Generate agency onboard count
      const { onboardedAgencyCountReportName, onboardedAgencyCountReportCsvData } = await this.generateOnboardedAgencyCountReport(
        startDate,
        endDate,
      );

      const documentStatisticsReportFileName = `01-${documentStatisticsReportName}-${this.generateDateRangeDescription(
        startDate,
        endDate,
      ).replaceAll(' ', '-')}.csv`;
      const totalOnboardedCitizenUserCountReportFileName = `02-${totalOnboardedCitizenUserCountReportName}-${this.formatDate(
        new Date(),
        true,
      ).replaceAll(' ', '-')}.csv`;
      const onboardedAgencyCountReportFileName = `03-${onboardedAgencyCountReportName}-${this.generateDateRangeDescription(
        startDate,
        endDate,
      ).replaceAll(' ', '-')}.csv`;

      // Send email if email provided
      if (emails && emails.length > 0) {
        // Convert to base64
        const documentStatisticsReportBase64 = Buffer.from(documentStatisticsReportCsvData).toString('base64');
        const onboardedCitizenUserCountReportBase64 = Buffer.from(totalOnboardedCitizenUserCountReportCsvData).toString('base64');
        const onboardedAgencyCountReportBase64 = Buffer.from(onboardedAgencyCountReportCsvData).toString('base64');

        const FILESG_STATISTICS_EMAIL_TITLE = `FileSG Statistics (${this.generateDateRangeDescription(startDate, endDate)})`;
        const csvMimeType = 'text/csv';

        await this.emailService.sendEmail(
          emails,
          FILESG_STATISTICS_EMAIL_TITLE,
          `FileSG Statistics ${this.generateDateRangeDescription(startDate, endDate)}`, // TODO: Email Content TBD
          undefined,
          [
            {
              filename: documentStatisticsReportFileName,
              contentType: csvMimeType,
              base64Data: documentStatisticsReportBase64,
            },
            {
              filename: totalOnboardedCitizenUserCountReportFileName,
              contentType: csvMimeType,
              base64Data: onboardedCitizenUserCountReportBase64,
            },
            {
              filename: onboardedAgencyCountReportFileName,
              contentType: csvMimeType,
              base64Data: onboardedAgencyCountReportBase64,
            },
          ],
        );
      }

      // Zip file to pipe to response
      const zipFileName = `filesg-statistics-report-${this.formatDate(new Date(), true).replaceAll(' ', '-')}.zip`;

      const filesToZip: ZippingFile[] = [
        {
          name: documentStatisticsReportFileName,
          body: documentStatisticsReportCsvData,
        },
        {
          name: totalOnboardedCitizenUserCountReportFileName,
          body: totalOnboardedCitizenUserCountReportCsvData,
        },
        {
          name: onboardedAgencyCountReportFileName,
          body: onboardedAgencyCountReportCsvData,
        },
      ];

      const archiver = await this.zipService.zipToStream(filesToZip);

      return { type: 'application/zip', stream: archiver, zipFileName };
    } catch (error) {
      throw new ReportGenerationException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, 'filesg statistics', (error as Error).message);
    }
  }

  public async generateFileSgUserActionsReport({ startDate, endDate }: FileSgUserActionsReportRequest) {
    const reportDirPath = this.getTempReportDirPath();

    try {
      await mkdir(reportDirPath, { recursive: true });

      const { singpassUserActionsReportFileName, nonSingpassUserActionsReportFileName } = await this.generateUserActionsReport(
        startOfDay(new Date(startDate)),
        endOfDay(new Date(endDate)),
        USER_ACTIONS_REPORT_QUERY_CHUNK_SIZE,
        reportDirPath,
      );

      const filesToZip: ZippingFile[] = [
        { name: singpassUserActionsReportFileName, body: createReadStream(join(reportDirPath, singpassUserActionsReportFileName)) },
        { name: nonSingpassUserActionsReportFileName, body: createReadStream(join(reportDirPath, nonSingpassUserActionsReportFileName)) },
      ];

      const archiver = await this.zipService.zipToStream(filesToZip, undefined, false);

      archiver.on('finish', async () => {
        await rm(reportDirPath, { recursive: true, force: true });
      });

      archiver.finalize();

      const zipFileName = `user-actions-report-${this.formatDate(new Date(), true).replaceAll(' ', '-')}.zip`;

      return { zipFileName, type: MIME_TYPE.ZIP, stream: archiver };
    } catch (error) {
      await rm(reportDirPath, { recursive: true, force: true });
      throw new ReportGenerationException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, 'user actions', (error as Error).message);
    }
  }

  //===================================================
  // Protected methods
  //===================================================
  protected async getEserviceIdsToQuery({ id: agencyId }: Agency, eserviceCode?: string) {
    const eservicesUnderAgency = await this.eserviceEntityService.retrieveEserviceByAgencyId(agencyId, { select: ['id', 'name'] });
    if (eserviceCode) {
      const filteredEserviceList = eservicesUnderAgency.filter((eservice) => eservice.name.toLowerCase() === eserviceCode.toLowerCase());
      if (!filteredEserviceList.length) {
        throw new Error(`Eservice code ${eserviceCode} provided does not belong to agency provided`);
      }
      return filteredEserviceList.map((eservice) => eservice.id);
    } else {
      return eservicesUnderAgency.map((eservice) => eservice.id);
    }
  }

  protected async generateActivityAndFileReport(
    eserviceIdsToQuery: number[],
    reportDir: string,
    fileDownloadCountMap: FileDownloadCount,
    startDate: Date,
    endDate: Date,
  ) {
    const ACTIVITY_FILE_NAME = 'activity-report.csv';
    const FILE_REPORT_FILE_NAME = 'file-report.csv';

    let page = 1;
    let fetchNext = true;

    while (fetchNext) {
      const { transactions, next } = await this.transactionEntityService.retrieveTransactionsUsingEserviceIds(eserviceIdsToQuery, {
        startDate,
        endDate,
        page,
      });

      const activityReports: ActivityReport[] = [];
      const fileReports: FileReport[] = [];
      for (let x = 0; x < transactions.length; x++) {
        const { application, activities } = transactions[x];

        for (let y = 0; y < activities!.length; y++) {
          const { uuid: activityUuid, acknowledgedAt, type, fileAssets, createdAt: activityCreatedAt } = activities![y];

          if (!type.includes('receive')) {
            this.logger.debug(`Activites type that are not of receive type is skipped.`);
            continue;
          }

          const agencyRefNo = application!.externalRefId ?? '';

          this.logger.log({ application });

          activityReports.push({
            agencyRefNo,
            activityUuid,
            activityIssuedOn: this.formatDate(activityCreatedAt, false),
            isAcknowledged: acknowledgedAt !== null,
            acknowledgedAt: this.formatDate(acknowledgedAt, false),
          });
          if (fileAssets) {
            for (let i = 0; i < fileAssets.length; i++) {
              const { name, uuid: fileAssetUuid, status, expireAt, deleteAt } = fileAssets[i];
              fileReports.push({
                agencyRefNo,
                activityUuid,
                fileAssetUuid,
                activityIssuedOn: this.formatDate(activityCreatedAt, false),
                fileName: name,
                fileStatus: status,
                expireAt: this.formatDate(expireAt, true),
                deleteAt: this.formatDate(deleteAt, true),
                downloadCount: fileDownloadCountMap.get(fileAssetUuid)?.val ?? 0,
              });

              fileDownloadCountMap.delete(fileAssetUuid);
            }
          } else {
            this.logger.log(`No file assets found under the acitivity id ${activityUuid}`);
          }
        }
      }

      fetchNext = next !== null;
      const convertedDataActivity = await json2csv(activityReports, { prependHeader: page === 1 });
      await appendFile(`${reportDir}/${ACTIVITY_FILE_NAME}`, `${convertedDataActivity}${fetchNext ? '\n' : ''}`);

      const convertedDataFile = await json2csv(fileReports, { prependHeader: page === 1 });
      await appendFile(`${reportDir}/${FILE_REPORT_FILE_NAME}`, `${convertedDataFile}${fetchNext ? '\n' : ''}`);

      page++;
    }
    return { activityFileName: ACTIVITY_FILE_NAME, fileReportFileName: FILE_REPORT_FILE_NAME };
  }

  protected async generateFileDownloadReport(
    agencyCode: string,
    reportDir: string,
    eserviceIds: number[],
    startDate: Date,
    endDate: Date,
  ): Promise<GenerateFileDownloadReportResponse> {
    const fileDownloadCountMap: FileDownloadCount = new Map();

    const USER_FILE_DOWNLOAD_REPORT_FILE_NAME = 'user-file-download-report.csv';
    await this.saveToFileDownloadReport(
      agencyCode,
      reportDir,
      eserviceIds,
      startDate,
      endDate,
      fileDownloadCountMap,
      USER_FILE_DOWNLOAD_REPORT_FILE_NAME,
      AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
    );

    const AGENCY_FILE_DOWNLOAD_REPORT_FILE_NAME = 'agency-file-download-report.csv';
    await this.saveToFileDownloadReport(
      agencyCode,
      reportDir,
      eserviceIds,
      startDate,
      endDate,
      fileDownloadCountMap,
      AGENCY_FILE_DOWNLOAD_REPORT_FILE_NAME,
      AUDIT_EVENT_NAME.AGENCY_FILE_DOWNLOAD,
    );

    return {
      userFileDownloadReportFileName: USER_FILE_DOWNLOAD_REPORT_FILE_NAME,
      agencyFileDownloadReportFileName: AGENCY_FILE_DOWNLOAD_REPORT_FILE_NAME,
      fileDownloadCountMap,
    };
  }

  protected async saveToFileDownloadReport(
    agencyCode: string,
    reportDir: string,
    eserviceIds: number[],
    startDate: Date,
    endDate: Date,
    fileDownloadCountMap: FileDownloadCount,
    reportFilename: string,
    auditEventName: AUDIT_EVENT_NAME,
  ) {
    let page = 1;
    let fetchNext = true;
    while (fetchNext) {
      const { auditEvents, next } = await this.auditEventEntityService.retrieveAuditEvents({
        eventName: auditEventName,
        subEventName: agencyCode,
        page,
      });

      const fileAssetUuids = auditEvents.map((record) => (record.data as AuditEventType).fileAssetUuid);
      const fileAssets =
        fileAssetUuids.length > 0 ? await this.fileAssetEntityService.retrieveFileAssetsByUuidsWithAgencyInfo(fileAssetUuids) : [];

      const filteredAudits = auditEvents.filter((audit) => {
        const fileAsset = fileAssets.find((fileAsset) => fileAsset.uuid === (audit.data as AuditEventType).fileAssetUuid)!;
        let isFound = eserviceIds.includes(fileAsset.issuer!.eservices![0].id);

        isFound &&= fileAsset.createdAt >= new Date(startDate);
        isFound &&= fileAsset.createdAt <= new Date(endDate);

        return isFound;
      });

      const fileDownloadAudit: FileDownloadReport[] = filteredAudits.map((audit) => {
        const { fileAssetUuid, fileName } = audit.data as AuditEventType;

        if (!fileDownloadCountMap.has(fileAssetUuid)) {
          fileDownloadCountMap.set(fileAssetUuid, { val: 0 });
        }

        fileDownloadCountMap.get(fileAssetUuid)!.val++;

        return {
          fileAssetUuid,
          fileName,
          downloadTime: this.formatDate(audit.createdAt, false),
          ...(auditEventName === AUDIT_EVENT_NAME.AGENCY_FILE_DOWNLOAD && {
            isUserCopy: (audit.data as AgencyFilesDownloadAuditEvent).isUserCopy,
          }),
        };
      });

      fetchNext = next !== null;
      const convertedData = await json2csv(fileDownloadAudit, { prependHeader: page === 1 });
      await appendFile(`${reportDir}/${reportFilename}`, `${convertedData}${fetchNext ? '\n' : ''}`);

      page++;
    }
  }

  protected async generateDocumentIssuanceStatisticsReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{ documentStatisticsReportName: string; documentStatisticsReportCsvData: string }> {
    const DOCUMENT_STATISTICS_REPORT_NAME = 'document-statistics-report';

    // create map with agency and application type as composite key
    const agencyApplicationTypeMap: Record<string, DocumentStatisticsReportEntry> = {};

    const queryOptions: DateRange = {
      startDate,
      endDate,
    };

    // Get counts of statuses (active, expired, revoked, deleted) of issued documents, grouped by agency & appType
    // For total number of issued & revoked
    // Note: Query will not contain agency-appTypes that have no fileAssets, hence entry won't be created
    const issuedDocumentStatusCountsResults =
      await this.fileAssetEntityService.retrieveCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses(
        queryOptions,
      );

    issuedDocumentStatusCountsResults.forEach((countResult) => {
      const { agency, applicationType, active, revoked, expired, deleted } = countResult;
      const compositeKey = `${agency}-${applicationType}`;
      const revokedCount = parseInt(revoked) + parseInt(expired);
      const issuedCount = parseInt(active) + revokedCount + parseInt(deleted) + parseInt(countResult['pending_delete']);

      // Only create entry if fileAssets issued
      if (issuedCount === 0) {
        return;
      }

      if (!agencyApplicationTypeMap[compositeKey]) {
        this.createDefaultDocumentStatisticsReportEntry(agencyApplicationTypeMap, agency, applicationType);
      }

      agencyApplicationTypeMap[compositeKey] = { ...agencyApplicationTypeMap[compositeKey], issuedCount, revokedCount };
    });

    // Get accessed fileAsset count
    const accessedDocumentCountResults = await this.fileAssetEntityService.retrieveCountAccessedAgencyIssuedFileAssets(queryOptions);

    accessedDocumentCountResults.forEach(({ agency, applicationType, count }) => {
      const compositeKey = `${agency}-${applicationType}`;
      const accessedCount = parseInt(count);

      // Only create entry if fileAssets issued
      if (accessedCount === 0) {
        return;
      }

      if (!agencyApplicationTypeMap[compositeKey]) {
        this.createDefaultDocumentStatisticsReportEntry(agencyApplicationTypeMap, agency, applicationType);
      }

      agencyApplicationTypeMap[compositeKey]['accessedCount'] = accessedCount;
    });

    const agencyApplicationEventCounts = await this.auditEventEntityService.retrieveAgencyAndApplicationTypeEventCountsByEventNames(
      FILE_STATISTICS_AUDIT_EVENTS,
      {
        startDate,
        endDate,
      },
    );

    agencyApplicationEventCounts.forEach(({ agency, applicationType, downloadCount, printSaveCount, viewCount, agencyDownloadCount }) => {
      // skip if missing, as older data might not have
      if (!agency || !applicationType) {
        return;
      }

      const compositeKey = `${agency}-${applicationType}`;
      if (!agencyApplicationTypeMap[compositeKey]) {
        this.createDefaultDocumentStatisticsReportEntry(agencyApplicationTypeMap, agency, applicationType);
      }

      agencyApplicationTypeMap[compositeKey] = {
        ...agencyApplicationTypeMap[compositeKey],
        downloadCount: parseInt(downloadCount),
        printSaveCount: parseInt(printSaveCount),
        viewCount: parseInt(viewCount),
        agencyDownloadCount: parseInt(agencyDownloadCount),
      };
    });

    const documentStatisticsReport: DocumentStatisticsReportEntry[] = Object.values(agencyApplicationTypeMap);

    const documentStatisticsReportCsvData = await json2csv(documentStatisticsReport, { prependHeader: true });

    return { documentStatisticsReportName: DOCUMENT_STATISTICS_REPORT_NAME, documentStatisticsReportCsvData };
  }

  protected async generateTotalOnboardedUserCountReport(): Promise<{
    totalOnboardedCitizenUserCountReportName: string;
    totalOnboardedCitizenUserCountReportCsvData: string;
  }> {
    const TOTAL_ONBOARDED_CITIZEN_USER_COUNT_REPORT_NAME = 'total-onboarded-user-count-report';

    const { totalOnboardedCitizenUserCount, withDocumentCount } =
      await this.userEntityService.retrieveCountOnboardedCitizenUserTotalAndWithIssuedDocument();

    const withoutDocumentCount = parseInt(totalOnboardedCitizenUserCount) - parseInt(withDocumentCount);

    const totalOnboardedCitizenUserCountReportCsvData = await json2csv([{ totalOnboardedCitizenUserCount, withoutDocumentCount }], {
      prependHeader: true,
    });

    return {
      totalOnboardedCitizenUserCountReportName: TOTAL_ONBOARDED_CITIZEN_USER_COUNT_REPORT_NAME,
      totalOnboardedCitizenUserCountReportCsvData,
    };
  }

  protected async generateOnboardedAgencyCountReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{ onboardedAgencyCountReportName: string; onboardedAgencyCountReportCsvData: string }> {
    const ONBOARDED_AGENCY_COUNT_REPORT_NAME = 'onboarded-agency-count-report';

    const { agencyCount, eserviceCount } = await this.agencyEntityService.retrieveCountAgencyAndEservices({ startDate, endDate });

    const onboardedAgencyCountReportCsvData = await json2csv([{ agencyCount, eserviceCount }], { prependHeader: true });

    return { onboardedAgencyCountReportName: ONBOARDED_AGENCY_COUNT_REPORT_NAME, onboardedAgencyCountReportCsvData };
  }

  protected async generateUserActionsReport(startDate: Date, endDate: Date, chunkSize: number, reportDirPath: string) {
    let page = 1;
    let fetchNext = true;
    let sinpassUserActionsPrependedHeader = false;
    let nonSinpassUserActionsPrependedHeader = false;

    const singpassUserActionsReportFileName = `singpass-user-actions-report.csv`;
    const nonSingpassUserActionsReportFileName = `non-singpass-user-actions-report.csv`;
    const singpassUserActionsReportFilePath = join(reportDirPath, singpassUserActionsReportFileName);
    const nonSingpassUserActionsReportFilePath = join(reportDirPath, nonSingpassUserActionsReportFileName);

    while (fetchNext) {
      let singpassUserActionsCsvData = '';
      let nonSingpassUserActionsCsvData = '';

      const singpassUserActionRecords: UserActionRawResult[] = [];
      const nonSingpassUserActionRecords: UserActionRawResult[] = [];

      const { records, next } = await this.auditEventEntityService.retrieveUserActionsAuditEvents({
        page,
        limit: chunkSize,
        startDate,
        endDate,
      });

      fetchNext = next !== null;

      records.forEach((record) => {
        if (record.authType === AUTH_TYPE.SINGPASS) {
          singpassUserActionRecords.push(record);
        } else {
          nonSingpassUserActionRecords.push(record);
        }
      });

      const processSingpassUserActionsRecords = singpassUserActionRecords.length > 0;
      const processNonSingpassUserActionsRecords = nonSingpassUserActionRecords.length > 0;

      if (processSingpassUserActionsRecords) {
        singpassUserActionsCsvData = await json2csv(singpassUserActionRecords, {
          prependHeader: !sinpassUserActionsPrependedHeader,
        });

        if (!sinpassUserActionsPrependedHeader) {
          sinpassUserActionsPrependedHeader = true;
        }
      }

      if (processNonSingpassUserActionsRecords) {
        nonSingpassUserActionsCsvData = await json2csv(nonSingpassUserActionRecords, {
          prependHeader: !nonSinpassUserActionsPrependedHeader,
        });

        if (!nonSinpassUserActionsPrependedHeader) {
          nonSinpassUserActionsPrependedHeader = true;
        }
      }

      await appendFile(
        singpassUserActionsReportFilePath,
        `${singpassUserActionsCsvData}${processSingpassUserActionsRecords && fetchNext ? '\n' : ''}`,
      );
      await appendFile(
        nonSingpassUserActionsReportFilePath,
        `${nonSingpassUserActionsCsvData}${processNonSingpassUserActionsRecords && fetchNext ? '\n' : ''}`,
      );

      page++;
    }

    return { singpassUserActionsReportFileName, nonSingpassUserActionsReportFileName };
  }

  /**
   *
   * @param date Date Object
   * @param onlyDate Provide true if you would to format with only Date without time.
   * @returns Formated string
   */
  protected formatDate(date: Date | null, onlyDate: boolean): string {
    return date ? format(date, `d MMM yyyy${onlyDate ? '' : ' h:mm:ss a'}`) : '';
  }

  protected generateDateRangeDescription(startDate: Date, endDate: Date): string {
    return `${this.formatDate(startDate, true).replaceAll(' ', '-')} to ${this.formatDate(endDate, true).replaceAll(' ', '-')}`;
  }

  /**
   * NOTE: Function mutates arg (value in agencyApplicationTypeMap)
   */
  protected createDefaultDocumentStatisticsReportEntry(
    agencyApplicationTypeMap: Record<string, DocumentStatisticsReportEntry>,
    agency: string,
    applicationType: string,
  ): void {
    const compositeKey = `${agency}-${applicationType}`;
    agencyApplicationTypeMap[compositeKey] = {
      agency,
      applicationType,
      issuedCount: 0,
      revokedCount: 0,
      accessedCount: 0,
      downloadCount: 0,
      printSaveCount: 0,
      viewCount: 0,
      agencyDownloadCount: 0,
    };
  }

  protected getTempReportDirPath() {
    return join(__dirname, 'report-generation', 'user-actions', uuid());
  }
}
