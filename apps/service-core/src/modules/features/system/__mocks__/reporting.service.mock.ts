import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  AUDIT_EVENT_NAME,
  AUTH_TYPE,
  DateRange,
  FILE_STATUS,
  FILE_TYPE,
  STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { endOfDay, startOfDay } from 'date-fns';
import { json2csv } from 'json-2-csv';

import { Agency } from '../../../../entities/agency';
import {
  DocumentStatisticsReportAgencyIssuedFileAssetRawQueryResult,
  DocumentStatisticsReportEntry,
  FILE_ASSET_TYPE,
  UserFilesAuditEventData,
} from '../../../../typings/common';
import { MockService } from '../../../../typings/common.mock';
import { createMockActivity } from '../../../entities/activity/__mocks__/activity.mock';
import { createMockAgency } from '../../../entities/agency/__mocks__/agency.mock';
import { createMockApplication } from '../../../entities/application/__mocks__/application.mock';
import { createMockAuditEvent } from '../../../entities/audit-event/__mocks__/audit-event.mock';
import { createMockEservice } from '../../../entities/eservice/__mocks__/eservice.mock';
import { createMockFileAsset } from '../../../entities/file-asset/__mocks__/file-asset.mock';
import { createMockTransaction } from '../../../entities/transaction/__mocks__/transaction.mock';
import { createMockProgrammaticUser } from '../../../entities/user/__mocks__/user.mock';
import { GenerateFileDownloadReportResponse, ReportingService, USER_ACTIONS_REPORT_QUERY_CHUNK_SIZE } from '../reporting.service';

// =============================================================================
// Test Service
// =============================================================================
export class TestReportingService extends ReportingService {
  public async getEserviceIdsToQuery(agency: Agency, eserviceCode?: string): Promise<number[]> {
    return super.getEserviceIdsToQuery(agency, eserviceCode);
  }

  public async generateActivityAndFileReport(
    eserviceIdsToQuery: number[],
    reportDir: string,
    fileDownloadCountMap: Map<string, { val: number }>,
    startDate: Date,
    endDate: Date,
  ): Promise<{ activityFileName: string; fileReportFileName: string }> {
    return super.generateActivityAndFileReport(eserviceIdsToQuery, reportDir, fileDownloadCountMap, startDate, endDate);
  }

  public async generateFileDownloadReport(
    agencyCode: string,
    reportDir: string,
    eserviceIds: number[],
    startDate: Date,
    endDate: Date,
  ): Promise<GenerateFileDownloadReportResponse> {
    return super.generateFileDownloadReport(agencyCode, reportDir, eserviceIds, startDate, endDate);
  }

  public async generateDocumentIssuanceStatisticsReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{ documentStatisticsReportName: string; documentStatisticsReportCsvData: string }> {
    return super.generateDocumentIssuanceStatisticsReport(startDate, endDate);
  }

  public async generateTotalOnboardedUserCountReport(): Promise<{
    totalOnboardedCitizenUserCountReportName: string;
    totalOnboardedCitizenUserCountReportCsvData: string;
  }> {
    return super.generateTotalOnboardedUserCountReport();
  }

  public async generateOnboardedAgencyCountReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{ onboardedAgencyCountReportName: string; onboardedAgencyCountReportCsvData: string }> {
    return super.generateOnboardedAgencyCountReport(startDate, endDate);
  }

  public async generateUserActionsReport(
    startDate: Date,
    endDate: Date,
    chunkSize: number,
    reportDirPath: string,
  ): Promise<{
    singpassUserActionsReportFileName: string;
    nonSingpassUserActionsReportFileName: string;
  }> {
    return super.generateUserActionsReport(startDate, endDate, chunkSize, reportDirPath);
  }

  public formatDate(date: Date | null, onlyDate: boolean): string {
    return super.formatDate(date, onlyDate);
  }

  public generateDateRangeDescription(startDate: Date, endDate: Date): string {
    return super.generateDateRangeDescription(startDate, endDate);
  }

  public createDefaultDocumentStatisticsReportEntry(
    agencyApplicationTypeMap: Record<string, DocumentStatisticsReportEntry>,
    agency: string,
    applicationType: string,
  ): void {
    return super.createDefaultDocumentStatisticsReportEntry(agencyApplicationTypeMap, agency, applicationType);
  }

  public getTempReportDirPath(): string {
    return super.getTempReportDirPath();
  }
}

// =============================================================================
//  Mock Data
// =============================================================================
export const mockReportingService: MockService<ReportingService> = {
  generateAgencyTransactionsReport: jest.fn(),
  generateFileSgStatisticsReport: jest.fn(),
  generateFileSgUserActionsReport: jest.fn(),
};

export const mockAgencyName = 'mockAgencyName';
export const mockAgencyName2 = 'mockAgencyName2';
export const mockAgencyCode = 'mockAgencyCode';

export const mockApplicationType = 'mockApplicationType';
export const mockApplicationType2 = 'mockApplicationType2';
export const mockEmptyAgencyApplicationTypeMap: Record<string, DocumentStatisticsReportEntry> = {};

// export const mockEndDate = new Date();
// export const mockStartDate = new Date();
// mockStartDate.setDate(mockEndDate.getDate() - 30);
// export const mockInBetweenDate = new Date();
// mockInBetweenDate.setDate(mockEndDate.getDate() - 1);

export const mockEndDateString = '2023-05-31';
export const mockStartDateString = '2023-05-01';
export const mockStartDate = startOfDay(new Date(mockStartDateString));
export const mockEndDate = endOfDay(new Date(mockEndDateString));
export const mockDateRange: DateRange = { startDate: mockStartDate, endDate: mockEndDate };
export const mockChunkSize = USER_ACTIONS_REPORT_QUERY_CHUNK_SIZE;

export const mockSingpassUserActionsReportFileName = `singpass-user-actions-report.csv`;
export const mockNonSingpassUserActionsReportFileName = `non-singpass-user-actions-report.csv`;

export const mockIssuedFileQueryResult: DocumentStatisticsReportAgencyIssuedFileAssetRawQueryResult[] = [
  {
    agency: mockAgencyName,
    applicationType: mockApplicationType,
    active: '1',
    revoked: '1',
    expired: '1',
    deleted: '1',
    pending_delete: '1',
  },
  {
    agency: mockAgencyName2,
    applicationType: mockApplicationType2,
    active: '1',
    revoked: '1',
    expired: '1',
    deleted: '1',
    pending_delete: '1',
  },
];

export const mockAssessDocumentCountResult = [
  {
    agency: mockAgencyName,
    applicationType: mockApplicationType,
    count: '1',
  },
  {
    agency: mockAgencyName2,
    applicationType: mockApplicationType2,
    count: '1',
  },
];

export const mockagencyApplicationEventCountsResult = [
  {
    agency: mockAgencyName,
    applicationType: mockApplicationType,
    downloadCount: '1',
    printSaveCount: '1',
    viewCount: '1',
    agencyDownloadCount: '1',
  },
  {
    agency: mockAgencyName2,
    applicationType: mockApplicationType2,
    downloadCount: '1',
    printSaveCount: '1',
    viewCount: '1',
    agencyDownloadCount: '1',
  },
];

export const mockReportDir = 'mockReportDir';
export const mockEserviceIds = [1, 2];

export const mockDownloadAuditEventData: UserFilesAuditEventData = {
  sessionId: 'mockSessionId-1',
  authType: AUTH_TYPE.SINGPASS,
  userId: 1,
  fileAssetUuid: 'mockFileAssetUuid',
  fileName: 'mockFileName',
  applicationType: mockApplicationType,
  agency: mockAgencyName,
};

export const mockDownloadAuditEvent = createMockAuditEvent({
  eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
  subEventName: mockAgencyCode,
  data: mockDownloadAuditEventData,
});

export const mockEservice = createMockEservice({
  id: 1,
  uuid: 'mockEserviceUuid',
  name: 'mockEserviceName',
  emails: [],
  agencyId: 1,
});

export const mockEservice2 = createMockEservice({
  id: 2,
  uuid: 'mockEserviceUuid2',
  name: 'mockEserviceName2',
  emails: [],
  agencyId: 1,
});

export const mockEserviceUser = createMockProgrammaticUser({
  eservices: [mockEservice],
  status: STATUS.ACTIVE,
  clientId: 'mockId',
  clientSecret: 'mockSecret',
});

export const mockFileAsset = createMockFileAsset({
  uuid: 'mockFileAssetUuid',
  name: 'mockFileName',
  documentType: FILE_TYPE.OA,
  size: 1,
  type: FILE_ASSET_TYPE.TRANSFERRED,
  status: FILE_STATUS.ACTIVE,
  issuer: mockEserviceUser,
});

export const mockApplication = createMockApplication({
  externalRefId: 'mockExternalRefId',
});

export const mockActivity = createMockActivity({
  type: ACTIVITY_TYPE.RECEIVE_TRANSFER,
  status: ACTIVITY_STATUS.COMPLETED,
  uuid: 'mockActivityUuid',
  acknowledgedAt: null,
  fileAssets: [mockFileAsset],
});

export const mockTransaction = createMockTransaction({
  name: 'mockTransactionName',
  type: TRANSACTION_TYPE.UPLOAD_TRANSFER,
  creationMethod: TRANSACTION_CREATION_METHOD.API,
  status: TRANSACTION_STATUS.COMPLETED,
  activities: [mockActivity],
  application: mockApplication,
});

export const mockAgency = createMockAgency({
  eservices: [mockEservice, mockEservice2],
  name: mockAgencyName,
  code: mockAgencyCode,
});

export const mockArchiver = { on: jest.fn(), finalize: jest.fn() };

export const mockEmails = ['mockEmail'];

export const mockDocumentIssuanceStatisticsReportData = [
  {
    accessedCount: 1,
    agency: mockAgencyName,
    applicationType: 'mockApplicationType',
    downloadCount: 1,
    issuedCount: 5,
    printSaveCount: 1,
    revokedCount: 2,
    viewCount: 1,
    agencyDownloadCount: 1,
  },
  {
    accessedCount: 1,
    agency: mockAgencyName2,
    applicationType: 'mockApplicationType2',
    downloadCount: 1,
    issuedCount: 5,
    printSaveCount: 1,
    revokedCount: 2,
    viewCount: 1,
    agencyDownloadCount: 1,
  },
];

export const mockSingpassUserActionsReportData = [
  {
    agency: null,
    eservice: null,
    applicationType: null,
    sessionId: 'mock-sessionId-1',
    authType: 'Singpass',
    fileAssetUuid: null,
    hasPerformedDocumentAction: 'true',
    downloadCount: '0',
    printSaveCount: '0',
    viewCount: '0',
    loginCount: '1',
  },
  {
    agency: 'FileSG',
    eservice: 'FileSG',
    applicationType: 'Long Term Visit Pass',
    sessionId: 'mock-sessionId-1',
    authType: 'Singpass',
    fileAssetUuid: 'fileasset-1688542673895-2d6a86d25ee92b0a',
    hasPerformedDocumentAction: null,
    downloadCount: '0',
    printSaveCount: '1',
    viewCount: '1',
    loginCount: '0',
  },
];

export const mockNonSingpassUserActionsReportData = [
  {
    agency: null,
    eservice: null,
    applicationType: null,
    sessionId: 'mock-sessionId-2',
    authType: 'Singpass-SSO',
    fileAssetUuid: null,
    hasPerformedDocumentAction: 'true',
    downloadCount: '0',
    printSaveCount: '0',
    viewCount: '0',
    loginCount: '1',
  },
  {
    agency: 'FileSG',
    eservice: 'FileSG',
    applicationType: 'Long Term Visit Pass',
    sessionId: 'mock-sessionId-2',
    authType: 'Singpass-SSO',
    fileAssetUuid: 'fileasset-1688542673895-2d6a86d25ee92b0a',
    hasPerformedDocumentAction: null,
    downloadCount: '1',
    printSaveCount: '1',
    viewCount: '1',
    loginCount: '0',
  },
];

export const mockTotalOnboardedCitizenUserCount = '100';
export const mockWithDocumentCount = '100';
export const mockWithoutDocumentCount = parseInt(mockTotalOnboardedCitizenUserCount) - parseInt(mockWithDocumentCount);

export const mockOnboardedUserCountResult = {
  totalOnboardedCitizenUserCount: mockTotalOnboardedCitizenUserCount,
  withDocumentCount: mockWithDocumentCount,
};

export const mockOnboardedUserCountReportData = [
  {
    totalOnboardedCitizenUserCount: mockTotalOnboardedCitizenUserCount,
    withoutDocumentCount: mockWithoutDocumentCount,
  },
];

export const mockAgencyAndEserviceCount = {
  agencyCount: '1',
  eserviceCount: '2',
};

export const mockDocumentStatisticsReportCsvData = json2csv(mockDocumentIssuanceStatisticsReportData, { prependHeader: true });

export const mockTotalOnboardedCitizenUserCountReportCsvData = json2csv(mockOnboardedUserCountReportData, { prependHeader: true });

export const mockOnboardedAgencyCountReportCsvData = json2csv([mockAgencyAndEserviceCount], { prependHeader: true });

export const mockSingpassUserActionsCsvData = json2csv(mockSingpassUserActionsReportData, { prependHeader: true });

export const mockNonSingpassUserActionsCsvData = json2csv(mockNonSingpassUserActionsReportData, { prependHeader: true });
