/* eslint-disable sonarjs/no-duplicate-string */
import { MIME_TYPE } from '@filesg/common';
import { ZippingFile, ZipService } from '@filesg/zipper';
import { Test, TestingModule } from '@nestjs/testing';
import fs from 'fs';
import fsPromise, { mkdir, rm } from 'fs/promises';
import * as json2csvLib from 'json-2-csv';
import uuid from 'uuid';

import { ReportGenerationException } from '../../../../common/filters/custom-exceptions.filter';
import { mockAgencyEntityService } from '../../../entities/agency/__mocks__/agency.entity.service.mock';
import { AgencyEntityService } from '../../../entities/agency/agency.entity.service';
import { mockAuditEventEntityService } from '../../../entities/audit-event/__mocks__/audit-event.entity.service.mock';
import { AuditEventEntityService } from '../../../entities/audit-event/audit-event.entity.service';
import { mockEserviceEntityService } from '../../../entities/eservice/__mocks__/eservice.entity.service.mock';
import { EserviceEntityService } from '../../../entities/eservice/eservice.entity.service';
import { mockFileAssetEntityService } from '../../../entities/file-asset/__mocks__/file-asset.entity.service.mock';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { mockTransactionEntityService } from '../../../entities/transaction/__mocks__/transaction.entity.service.mock';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { mockUserEntityService } from '../../../entities/user/__mocks__/user.entity.service.mock';
import { UserEntityService } from '../../../entities/user/user.entity.service';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import {
  mockActivity,
  mockAgency,
  mockAgencyAndEserviceCount,
  mockagencyApplicationEventCountsResult,
  mockAgencyCode,
  mockAgencyName,
  mockApplication,
  mockApplicationType,
  mockArchiver,
  mockAssessDocumentCountResult as mockAccessedDocumentCountResult,
  mockChunkSize,
  mockDateRange,
  mockDocumentIssuanceStatisticsReportData,
  mockDocumentStatisticsReportCsvData,
  mockDownloadAuditEvent,
  mockEmails,
  mockEmptyAgencyApplicationTypeMap,
  mockEndDate,
  mockEndDateString,
  mockEservice,
  mockEservice2,
  mockEserviceIds,
  mockFileAsset,
  mockIssuedFileQueryResult,
  mockNonSingpassUserActionsReportData,
  mockNonSingpassUserActionsReportFileName,
  mockOnboardedAgencyCountReportCsvData,
  mockOnboardedUserCountReportData,
  mockOnboardedUserCountResult,
  mockReportDir,
  mockSingpassUserActionsReportData,
  mockSingpassUserActionsReportFileName,
  mockStartDate,
  mockStartDateString,
  mockTotalOnboardedCitizenUserCountReportCsvData,
  mockTransaction,
  TestReportingService,
} from '../__mocks__/reporting.service.mock';
import { mockZipService } from '../__mocks__/zip.service.mock';

jest.mock('uuid', () => ({
  v4: jest.fn(() => mockReportDir),
}));

describe('ReportingService', () => {
  const activityFileName = 'activity-report.csv';
  const fileReportFileName = 'file-report.csv';
  const userFileDownloadReportFileName = 'user-file-download-report.csv';
  const agencyFileDownloadReportFileName = 'agency-file-download-report.csv';

  const documentStatisticsReportName = 'document-statistics-report';
  const totalOnboardedCitizenUserCountReportName = 'total-onboarded-user-count-report';
  const onboardedAgencyCountReportName = 'onboarded-agency-count-report';

  let service: TestReportingService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestReportingService,
        { provide: AgencyEntityService, useValue: mockAgencyEntityService },
        { provide: AuditEventEntityService, useValue: mockAuditEventEntityService },
        { provide: EserviceEntityService, useValue: mockEserviceEntityService },
        { provide: FileAssetEntityService, useValue: mockFileAssetEntityService },
        { provide: TransactionEntityService, useValue: mockTransactionEntityService },
        { provide: UserEntityService, useValue: mockUserEntityService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: ZipService, useValue: mockZipService },
      ],
    }).compile();

    service = module.get<TestReportingService>(TestReportingService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Public methods
  // ===========================================================================
  describe('generateAgencyTransactionsReport', () => {
    let getEserviceIdsToQuerySpy: jest.SpyInstance;
    let generateFileDownloadReportSpy: jest.SpyInstance;
    let generateActivityAndFileReportSpy: jest.SpyInstance;
    let createReadStreamSpy: jest.SpyInstance;

    const mockFileDownloadCountMap = new Map();
    mockFileDownloadCountMap.set(mockFileAsset.uuid, { val: 1 });

    beforeEach(() => {
      getEserviceIdsToQuerySpy = jest.spyOn(service, 'getEserviceIdsToQuery');
      generateFileDownloadReportSpy = jest.spyOn(service, 'generateFileDownloadReport');
      generateActivityAndFileReportSpy = jest.spyOn(service, 'generateActivityAndFileReport');

      createReadStreamSpy = jest.spyOn(fs, 'createReadStream');

      mockAgencyEntityService.retrieveAgencyByCode.mockResolvedValueOnce(mockAgency);
      getEserviceIdsToQuerySpy.mockResolvedValueOnce([mockEservice.id, mockEservice2.id]);
      generateFileDownloadReportSpy.mockResolvedValueOnce({
        userFileDownloadReportFileName,
        agencyFileDownloadReportFileName,
        fileDownloadCountMap: mockFileDownloadCountMap,
      });
      generateActivityAndFileReportSpy.mockResolvedValueOnce({
        activityFileName,
        fileReportFileName,
      });

      createReadStreamSpy.mockReturnValue('mockData' as unknown as fs.ReadStream);
      mockZipService.zipToStream.mockResolvedValueOnce(mockArchiver);
    });

    afterEach(async () => {
      await rm(mockReportDir, { recursive: true, force: true });
    });

    it('should be defined', () => {
      expect(service.generateAgencyTransactionsReport).toBeDefined();
    });

    it('returns stream info and data', async () => {
      expect(
        await service.generateAgencyTransactionsReport({
          agencyCode: mockAgencyCode,
          eserviceCode: mockEservice.name,
          startDate: mockStartDateString,
          endDate: mockEndDateString,
        }),
      ).toEqual({
        type: 'application/zip',
        stream: mockArchiver,
        zipFileName: `${mockAgencyCode}-report-${service.formatDate(new Date(), true).replaceAll(' ', '-')}.zip`,
      });
    });

    it('should call methods with correct arguments', async () => {
      const mockFilesToZip = [
        { name: `01-${activityFileName}`, body: 'mockData' },
        { name: `02-${fileReportFileName}`, body: 'mockData' },
        { name: `03-${userFileDownloadReportFileName}`, body: 'mockData' },
        { name: `04-${agencyFileDownloadReportFileName}`, body: 'mockData' },
      ];

      await service.generateAgencyTransactionsReport({
        agencyCode: mockAgencyCode,
        eserviceCode: mockEservice.name,
        startDate: mockStartDateString,
        endDate: mockEndDateString,
      });

      expect(mockAgencyEntityService.retrieveAgencyByCode).toBeCalledWith(mockAgencyCode, { select: ['id'] });
      expect(getEserviceIdsToQuerySpy).toBeCalledWith(mockAgency, mockEservice.name);
      expect(generateFileDownloadReportSpy).toBeCalledWith(mockAgencyCode, mockReportDir, mockEserviceIds, mockStartDate, mockEndDate);
      expect(generateActivityAndFileReportSpy).toBeCalledWith(
        mockEserviceIds,
        mockReportDir,
        mockFileDownloadCountMap,
        mockStartDate,
        mockEndDate,
      );
      expect(mockZipService.zipToStream).toBeCalledWith(mockFilesToZip, undefined, false);
      expect(mockArchiver.finalize).toBeCalledTimes(1);
    });
  });

  describe('generateFileSgStatisticsReport', () => {
    let generateDocumentIssuanceStatisticsReportSpy: jest.SpyInstance;
    let generateTotalOnboardedUserCountReportSpy: jest.SpyInstance;
    let generateOnboardedAgencyCountReportSpy: jest.SpyInstance;

    let documentStatisticsReportFileName: string;
    let totalOnboardedCitizenUserCountReportFileName: string;
    let onboardedAgencyCountReportFileName: string;

    beforeAll(() => {
      documentStatisticsReportFileName = `01-${documentStatisticsReportName}-${service
        .generateDateRangeDescription(mockStartDate, mockEndDate)
        .replaceAll(' ', '-')}.csv`;
      totalOnboardedCitizenUserCountReportFileName = `02-${totalOnboardedCitizenUserCountReportName}-${service
        .formatDate(new Date(), true)
        .replaceAll(' ', '-')}.csv`;
      onboardedAgencyCountReportFileName = `03-${onboardedAgencyCountReportName}-${service
        .generateDateRangeDescription(mockStartDate, mockEndDate)
        .replaceAll(' ', '-')}.csv`;

      mockZipService.zipToStream.mockResolvedValue(mockArchiver);
    });

    beforeEach(async () => {
      generateDocumentIssuanceStatisticsReportSpy = jest.spyOn(service, 'generateDocumentIssuanceStatisticsReport');
      generateTotalOnboardedUserCountReportSpy = jest.spyOn(service, 'generateTotalOnboardedUserCountReport');
      generateOnboardedAgencyCountReportSpy = jest.spyOn(service, 'generateOnboardedAgencyCountReport');

      generateDocumentIssuanceStatisticsReportSpy.mockResolvedValueOnce({
        documentStatisticsReportName,
        documentStatisticsReportCsvData: await mockDocumentStatisticsReportCsvData,
      });

      generateTotalOnboardedUserCountReportSpy.mockResolvedValueOnce({
        totalOnboardedCitizenUserCountReportName,
        totalOnboardedCitizenUserCountReportCsvData: await mockTotalOnboardedCitizenUserCountReportCsvData,
      });
      generateOnboardedAgencyCountReportSpy.mockResolvedValueOnce({
        onboardedAgencyCountReportName,
        onboardedAgencyCountReportCsvData: await mockOnboardedAgencyCountReportCsvData,
      });
    });

    it('should be defined', () => {
      expect(service.generateFileSgStatisticsReport).toBeDefined();
    });

    it('returns stream info and data', async () => {
      expect(
        await service.generateFileSgStatisticsReport({ startDate: mockStartDateString, endDate: mockEndDateString, emails: mockEmails }),
      ).toEqual({
        type: 'application/zip',
        stream: mockArchiver,
        zipFileName: `filesg-statistics-report-${service.formatDate(new Date(), true).replaceAll(' ', '-')}.zip`,
      });
    });

    it('should call methods with correct arguments', async () => {
      const mockFilesToZip: ZippingFile[] = [
        {
          name: documentStatisticsReportFileName,
          body: await mockDocumentStatisticsReportCsvData,
        },
        {
          name: totalOnboardedCitizenUserCountReportFileName,
          body: await mockTotalOnboardedCitizenUserCountReportCsvData,
        },
        {
          name: onboardedAgencyCountReportFileName,
          body: await mockOnboardedAgencyCountReportCsvData,
        },
      ];

      await service.generateFileSgStatisticsReport({ startDate: mockStartDateString, endDate: mockEndDateString });

      expect(generateDocumentIssuanceStatisticsReportSpy).toBeCalledWith(mockStartDate, mockEndDate);
      expect(generateTotalOnboardedUserCountReportSpy).toBeCalledTimes(1);
      expect(generateOnboardedAgencyCountReportSpy).toBeCalledWith(mockStartDate, mockEndDate);

      expect(mockZipService.zipToStream).toBeCalledWith(mockFilesToZip);
    });

    describe('generateFileSgStatisticsReport', () => {
      it('should be defined', () => {
        expect(service.generateFileSgStatisticsReport).toBeDefined();
      });
    });

    it('should send email if emails field provided', async () => {
      const csvMimeType = 'text/csv';
      const FILESG_STATISTICS_EMAIL_TITLE = `FileSG Statistics (${service.generateDateRangeDescription(mockStartDate, mockEndDate)})`;

      await service.generateFileSgStatisticsReport({ startDate: mockStartDateString, endDate: mockEndDateString, emails: mockEmails });

      expect(mockEmailService.sendEmail).toBeCalledWith(
        mockEmails,
        FILESG_STATISTICS_EMAIL_TITLE,
        `FileSG Statistics ${service.generateDateRangeDescription(mockStartDate, mockEndDate)}`,
        undefined,
        [
          {
            filename: documentStatisticsReportFileName,
            contentType: csvMimeType,
            base64Data: Buffer.from(await mockDocumentStatisticsReportCsvData).toString('base64'),
          },
          {
            filename: totalOnboardedCitizenUserCountReportFileName,
            contentType: csvMimeType,
            base64Data: Buffer.from(await mockTotalOnboardedCitizenUserCountReportCsvData).toString('base64'),
          },
          {
            filename: onboardedAgencyCountReportFileName,
            contentType: csvMimeType,
            base64Data: Buffer.from(await mockOnboardedAgencyCountReportCsvData).toString('base64'),
          },
        ],
      );
    });
  });

  describe('generateFileSgUserActionsReport', () => {
    describe('happy flow', () => {
      let uuidSpy: jest.SpyInstance;
      let getTempReportDirPathSpy: jest.SpyInstance;
      let generateUserActionsReportSpy: jest.SpyInstance;
      let createReadStreamSpy: jest.SpyInstance;

      beforeEach(() => {
        uuidSpy = jest.spyOn(uuid, 'v4');
        uuidSpy.mockReturnValueOnce('mock-uuid-1');

        getTempReportDirPathSpy = jest.spyOn(service, 'getTempReportDirPath');
        getTempReportDirPathSpy.mockReturnValueOnce(mockReportDir);

        generateUserActionsReportSpy = jest.spyOn(service, 'generateUserActionsReport');
        generateUserActionsReportSpy.mockResolvedValueOnce({
          singpassUserActionsReportFileName: mockSingpassUserActionsReportFileName,
          nonSingpassUserActionsReportFileName: mockNonSingpassUserActionsReportFileName,
        });

        createReadStreamSpy = jest.spyOn(fs, 'createReadStream');
        createReadStreamSpy.mockReturnValue('mockData' as unknown as fs.ReadStream);

        mockZipService.zipToStream.mockResolvedValueOnce(mockArchiver);
      });

      afterEach(async () => {
        await rm(mockReportDir, { recursive: true, force: true });
      });

      it('should be defined', () => {
        expect(service.generateFileSgUserActionsReport).toBeDefined();
      });

      it('should return stream info and data', async () => {
        expect(await service.generateFileSgUserActionsReport({ startDate: mockStartDateString, endDate: mockEndDateString })).toEqual({
          zipFileName: `user-actions-report-${service.formatDate(new Date(), true).replaceAll(' ', '-')}.zip`,
          type: MIME_TYPE.ZIP,
          stream: mockArchiver,
        });
      });

      it('should call methods with correct arguments', async () => {
        const mockFilesToZip: ZippingFile[] = [
          { name: mockSingpassUserActionsReportFileName, body: 'mockData' },
          { name: mockNonSingpassUserActionsReportFileName, body: 'mockData' },
        ];

        await service.generateFileSgUserActionsReport({ startDate: mockStartDateString, endDate: mockEndDateString });

        expect(generateUserActionsReportSpy).toBeCalledWith(mockStartDate, mockEndDate, mockChunkSize, mockReportDir);
        expect(mockZipService.zipToStream).toBeCalledWith(mockFilesToZip, undefined, false);
      });
    });

    describe('error flow', () => {
      let uuidSpy: jest.SpyInstance;
      let getTempReportDirPathSpy: jest.SpyInstance;

      beforeEach(() => {
        uuidSpy = jest.spyOn(uuid, 'v4');
        uuidSpy.mockReturnValueOnce('mock-uuid-1');

        getTempReportDirPathSpy = jest.spyOn(service, 'getTempReportDirPath');
        getTempReportDirPathSpy.mockReturnValueOnce(mockReportDir);
      });

      afterEach(async () => {
        await rm(mockReportDir, { recursive: true, force: true });
      });

      it('should throw ReportGenerationException when there is error generating report', async () => {
        // should expect it to throw when internal function is not mocked
        await expect(
          service.generateFileSgUserActionsReport({ startDate: mockStartDateString, endDate: mockEndDateString }),
        ).rejects.toThrowError(ReportGenerationException);
      });
    });
  });

  // ===========================================================================
  // Protected methods
  // ===========================================================================
  describe('getEserviceIdsToQuery', () => {
    beforeEach(() => {
      mockEserviceEntityService.retrieveEserviceByAgencyId.mockResolvedValue([mockEservice, mockEservice2]);
    });

    it('should be defined', () => {
      expect(service.getEserviceIdsToQuery).toBeDefined();
    });

    it('should return list of Eservice Ids of provided agency', async () => {
      expect(await service.getEserviceIdsToQuery(mockAgency)).toEqual([mockEservice.id, mockEservice2.id]);
    });

    it('should return specified Eservice Id of provided agency if eservice code is provided', async () => {
      expect(await service.getEserviceIdsToQuery(mockAgency, mockEservice.name)).toEqual([mockEservice.id]);
    });

    it('should call methods with correct arguments', async () => {
      await service.getEserviceIdsToQuery(mockAgency);

      expect(mockEserviceEntityService.retrieveEserviceByAgencyId).toBeCalledWith(mockAgency.id, { select: ['id', 'name'] });
    });

    it('should throw error if eservice code does not belong to agency', async () => {
      const nonExistantEserviceCode = 'nonExistantEserviceCode';
      await expect(service.getEserviceIdsToQuery(mockAgency, nonExistantEserviceCode)).rejects.toThrowError(
        new Error(`Eservice code ${nonExistantEserviceCode} provided does not belong to agency provided`),
      );
    });
  });

  describe('generateActivityAndFileReport', () => {
    const activityFileName = 'activity-report.csv';
    const fileReportFileName = 'file-report.csv';
    const mockFileDownloadCountMap = new Map();

    beforeEach(() => {
      mockTransactionEntityService.retrieveTransactionsUsingEserviceIds.mockResolvedValueOnce({
        transactions: [mockTransaction],
        next: null,
      });

      mockFileDownloadCountMap.set(mockFileAsset.uuid, { val: 1 });
    });

    beforeAll(async () => {
      await mkdir(mockReportDir);
    });

    afterAll(async () => {
      await rm(mockReportDir, { recursive: true, force: true });
    });

    it('should be defined', () => {
      expect(service.generateActivityAndFileReport).toBeDefined();
    });

    it('returns correct filename and csv data', async () => {
      expect(
        await service.generateActivityAndFileReport(mockEserviceIds, mockReportDir, mockFileDownloadCountMap, mockStartDate, mockEndDate),
      ).toEqual({
        activityFileName,
        fileReportFileName,
      });
    });

    it('should call methods with correct arguments', async () => {
      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');
      const appendFileSpy = jest.spyOn(fsPromise, 'appendFile');
      const mockActivityJsonString = 'mockActivityJsonString';
      const mockFileJsonString = 'mockFileJsonString';

      json2csvSpy.mockResolvedValueOnce(mockActivityJsonString).mockResolvedValueOnce(mockFileJsonString);

      await service.generateActivityAndFileReport(mockEserviceIds, mockReportDir, mockFileDownloadCountMap, mockStartDate, mockEndDate);

      expect(mockTransactionEntityService.retrieveTransactionsUsingEserviceIds).toBeCalledWith(mockEserviceIds, {
        ...mockDateRange,
        page: 1,
      });

      expect(json2csvSpy).nthCalledWith(
        1,
        [
          {
            agencyRefNo: mockApplication.externalRefId,
            activityUuid: mockActivity.uuid,
            activityIssuedOn: '',
            isAcknowledged: false,
            acknowledgedAt: '',
          },
        ],
        { prependHeader: true },
      );
      expect(appendFileSpy).nthCalledWith(1, `${mockReportDir}/${activityFileName}`, mockActivityJsonString);

      expect(json2csvSpy).nthCalledWith(
        2,
        [
          {
            agencyRefNo: mockApplication.externalRefId,
            activityUuid: mockActivity.uuid,
            fileAssetUuid: mockFileAsset.uuid,
            activityIssuedOn: '',
            fileName: mockFileAsset.name,
            fileStatus: mockFileAsset.status,
            expireAt: '',
            deleteAt: '',
            downloadCount: 1, // Not derived from Map, since record will be deleted by method
          },
        ],
        { prependHeader: true },
      );
      expect(appendFileSpy).nthCalledWith(2, `${mockReportDir}/${fileReportFileName}`, mockFileJsonString);
    });
  });

  describe('generateFileDownloadReport', () => {
    beforeEach(() => {
      mockAuditEventEntityService.retrieveAuditEvents.mockResolvedValueOnce({ auditEvents: [mockDownloadAuditEvent], next: null });
      mockFileAssetEntityService.retrieveFileAssetsByUuidsWithAgencyInfo.mockResolvedValueOnce([mockFileAsset]);
    });

    beforeAll(async () => {
      await mkdir(mockReportDir);
    });

    afterAll(async () => {
      await rm(mockReportDir, { recursive: true, force: true });
    });

    it('should be defined', () => {
      expect(service.generateFileDownloadReport).toBeDefined();
    });

    // it('returns correct filename and csv data', async () => {
    //   const mockFileDownloadCountMap = new Map();
    //   mockFileDownloadCountMap.set(mockFileAsset.uuid, { val: 1 });

    //   //FIXME: not including date range, unable to assign createdAt date to FileAsset instance
    //   expect(await service.generateFileDownloadReport(mockAgencyCode, mockReportDir, mockEserviceIds)).toEqual({
    //     fileDownloadReportFileName,
    //     fileDownloadCountMap: mockFileDownloadCountMap,
    //   });
    // });

    // it('should call methods with correct arguments', async () => {
    //   const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');
    //   const appendFileSpy = jest.spyOn(fsPromise, 'appendFile');
    //   const mockFileDownloadJsonString = 'mockFileDownloadJsonString';

    //   json2csvSpy.mockResolvedValueOnce(mockFileDownloadJsonString);

    //   //FIXME: not including date range, unable to assign createdAt date to FileAsset instance
    //   await service.generateFileDownloadReport(mockAgencyCode, mockReportDir, mockEserviceIds);

    //   expect(mockAuditEventEntityService.retrieveAuditEvents).toBeCalledWith({
    //     eventName: AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD,
    //     subEventName: mockAgencyCode,
    //     page: 1,
    //   });
    //   expect(mockFileAssetEntityService.retrieveFileAssetsByUuidsWithAgencyInfo).toBeCalledWith([mockFileAsset.uuid]);
    //   expect(json2csvSpy).toBeCalledWith(
    //     [
    //       {
    //         fileAssetUuid: mockFileAsset.uuid,
    //         fileName: mockFileAsset.name,
    //         downloadTime: '', // missing createdAt date in auditEvent
    //       },
    //     ],
    //     { prependHeader: true },
    //   );
    //   expect(appendFileSpy).toBeCalledWith(`${mockReportDir}/${fileDownloadReportFileName}`, mockFileDownloadJsonString);
    // });
  });

  describe('generateDocumentIssuanceStatisticsReport', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockFileAssetEntityService.retrieveCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses.mockResolvedValueOnce(
        mockIssuedFileQueryResult,
      );
      mockFileAssetEntityService.retrieveCountAccessedAgencyIssuedFileAssets.mockResolvedValueOnce(mockAccessedDocumentCountResult);
      mockAuditEventEntityService.retrieveAgencyAndApplicationTypeEventCountsByEventNames.mockReturnValueOnce(
        mockagencyApplicationEventCountsResult,
      );
    });

    it('should be defined', () => {
      expect(service.generateDocumentIssuanceStatisticsReport).toBeDefined();
    });

    it('returns correct filename and csv data', async () => {
      expect(await service.generateDocumentIssuanceStatisticsReport(mockStartDate, mockEndDate)).toEqual({
        documentStatisticsReportName,
        documentStatisticsReportCsvData: await json2csvLib.json2csv(
          [
            {
              agency: 'mockAgencyName',
              applicationType: 'mockApplicationType',
              issuedCount: 5,
              revokedCount: 2,
              accessedCount: 1,
              downloadCount: 1,
              printSaveCount: 1,
              viewCount: 1,
              agencyDownloadCount: 1,
            },
            {
              agency: 'mockAgencyName2',
              applicationType: 'mockApplicationType2',
              issuedCount: 5,
              revokedCount: 2,
              accessedCount: 1,
              downloadCount: 1,
              printSaveCount: 1,
              viewCount: 1,
              agencyDownloadCount: 1,
            },
          ],
          { prependHeader: true },
        ),
      });
    });

    it('should call methods with correct arguments', async () => {
      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');
      const createDefaultDocumentStatisticsReportEntrySpy = jest.spyOn(service, 'createDefaultDocumentStatisticsReportEntry');

      await service.generateDocumentIssuanceStatisticsReport(mockStartDate, mockEndDate);

      expect(
        mockFileAssetEntityService.retrieveCountAgencyIssuedFileAssetsGroupedByAgencyAndApplicationTypeAndActivatedStatuses,
      ).toBeCalledWith(mockDateRange);

      //FIXME: object mutated by function, "received" arg will reflect final form
      // expect(createDefaultDocumentStatisticsReportEntrySpy).nthCalledWith(1, {}, mockAgencyName, mockApplicationType);
      // expect(createDefaultDocumentStatisticsReportEntrySpy).nthCalledWith(
      //   2,
      //   {
      //     [`${mockAgencyName}-${mockApplicationType}`]: {
      //       agency: mockAgencyName,
      //       applicationType: mockApplicationType,
      //       issuedCount: 15,
      //       revokedCount: 5,
      //       accessedCount: 0,
      //       downloadCount: 0,
      //       printSaveCount: 0,
      //       viewCount: 0,
      //     },
      //   },
      //   mockAgencyName2,
      //   mockApplicationType2,
      // );

      expect(createDefaultDocumentStatisticsReportEntrySpy).toBeCalledTimes(2);
      expect(mockFileAssetEntityService.retrieveCountAccessedAgencyIssuedFileAssets).toBeCalledWith(mockDateRange);
      expect(json2csvSpy).toBeCalledWith(mockDocumentIssuanceStatisticsReportData, { prependHeader: true });
    });
  });

  describe('generateTotalOnboardedUserCountReport', () => {
    it('should be defined', () => {
      expect(service.generateTotalOnboardedUserCountReport).toBeDefined();
    });

    it('returns correct filename and csv data', async () => {
      mockUserEntityService.retrieveCountOnboardedCitizenUserTotalAndWithIssuedDocument.mockResolvedValueOnce(mockOnboardedUserCountResult);

      expect(await service.generateTotalOnboardedUserCountReport()).toEqual({
        totalOnboardedCitizenUserCountReportName,
        totalOnboardedCitizenUserCountReportCsvData: await mockTotalOnboardedCitizenUserCountReportCsvData,
      });
    });

    it('should call methods with correct arguments', async () => {
      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');

      mockUserEntityService.retrieveCountOnboardedCitizenUserTotalAndWithIssuedDocument.mockResolvedValueOnce(mockOnboardedUserCountResult);

      await service.generateTotalOnboardedUserCountReport();

      expect(mockUserEntityService.retrieveCountOnboardedCitizenUserTotalAndWithIssuedDocument).toBeCalledTimes(1);
      expect(json2csvSpy).toBeCalledWith(mockOnboardedUserCountReportData, { prependHeader: true });
    });
  });

  describe('generateOnboardedAgencyCountReport', () => {
    it('should be defined', () => {
      expect(service.generateOnboardedAgencyCountReport).toBeDefined();
    });

    it('returns correct filename and csv data', async () => {
      mockAgencyEntityService.retrieveCountAgencyAndEservices.mockResolvedValueOnce(mockAgencyAndEserviceCount);

      expect(await service.generateOnboardedAgencyCountReport(mockStartDate, mockEndDate)).toEqual({
        onboardedAgencyCountReportName,
        onboardedAgencyCountReportCsvData: await mockOnboardedAgencyCountReportCsvData,
      });
    });

    it('should call methods with correct arguments', async () => {
      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');

      mockAgencyEntityService.retrieveCountAgencyAndEservices.mockResolvedValueOnce(mockAgencyAndEserviceCount);

      await service.generateOnboardedAgencyCountReport(mockStartDate, mockEndDate);

      expect(mockAgencyEntityService.retrieveCountAgencyAndEservices).toBeCalledWith({ startDate: mockStartDate, endDate: mockEndDate });
      expect(json2csvSpy).toBeCalledWith([mockAgencyAndEserviceCount], { prependHeader: true });
    });
  });

  describe('generateUserActionsReport', () => {
    it('should call methods with correct arguments', async () => {
      const mockSingpassUserActionsJsonString = 'mockSingpassUserActionsJsonString';
      const mockNonSingpassUserActionsJsonString = 'mockNonSingpassUserActionsJsonString';

      const retrieveUserActionsAuditEventsSpy = jest.spyOn(mockAuditEventEntityService, 'retrieveUserActionsAuditEvents');
      retrieveUserActionsAuditEventsSpy.mockResolvedValueOnce({
        records: mockSingpassUserActionsReportData,
        count: mockSingpassUserActionsReportData.length,
        next: true,
      });
      retrieveUserActionsAuditEventsSpy.mockResolvedValueOnce({
        records: mockNonSingpassUserActionsReportData,
        count: mockNonSingpassUserActionsReportData.length,
        next: null,
      });

      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');
      json2csvSpy.mockResolvedValueOnce(mockSingpassUserActionsJsonString);
      json2csvSpy.mockResolvedValueOnce(mockNonSingpassUserActionsJsonString);

      const appendFileSpy = jest.spyOn(fsPromise, 'appendFile');
      appendFileSpy.mockReturnThis();

      await service.generateUserActionsReport(mockStartDate, mockEndDate, mockChunkSize, mockReportDir);

      expect(retrieveUserActionsAuditEventsSpy).toBeCalledWith({
        page: 1,
        limit: mockChunkSize,
        startDate: mockStartDate,
        endDate: mockEndDate,
      });

      expect(appendFileSpy).nthCalledWith(
        1,
        `${mockReportDir}/${mockSingpassUserActionsReportFileName}`,
        `${mockSingpassUserActionsJsonString}\n`,
      );
      expect(appendFileSpy).nthCalledWith(2, `${mockReportDir}/${mockNonSingpassUserActionsReportFileName}`, '');
      expect(appendFileSpy).nthCalledWith(3, `${mockReportDir}/${mockSingpassUserActionsReportFileName}`, '');
      expect(appendFileSpy).nthCalledWith(
        4,
        `${mockReportDir}/${mockNonSingpassUserActionsReportFileName}`,
        mockNonSingpassUserActionsJsonString,
      );
    });
  });

  describe('formatDate', () => {
    // const dateFormat = 'd MMM yyyy';
    // const dateTimeFormat = ' h:mm:ss a';
    // let dateFnsFormatSpy: jest.SpyInstance;

    beforeAll(() => {
      // dateFnsFormatSpy = jest.spyOn(dateFns, 'format');
    });

    it('should be defined', () => {
      expect(service.formatDate).toBeDefined();
    });

    it('should return empty string if no date provided', () => {
      expect(service.formatDate(null, true)).toEqual('');
    });

    // FIXME: unable to spyOn Date-fns
    // it('should call format with dateFormat if onlyDate is true', () => {
    //   service.formatDate(mockEndDate, true);

    //   expect(dateFnsFormatSpy).toBeCalledWith(mockEndDate, dateFormat);
    // });

    // it('should call format with dateTimeFormat if onlyDate is false', () => {
    //   service.formatDate(mockEndDate, false);

    //   expect(dateFnsFormatSpy).toBeCalledWith(mockEndDate, dateTimeFormat);
    // });
  });

  describe('generateDateRangeDescription', () => {
    it('should be defined', () => {
      expect(service.generateDateRangeDescription).toBeDefined();
    });

    it('should return "<formatDate(startDate)> to <formatDate(endDate)>"', () => {
      expect(service.generateDateRangeDescription(mockStartDate, mockEndDate)).toEqual(
        `${service.formatDate(mockStartDate, true).replaceAll(' ', '-')} to ${service.formatDate(mockEndDate, true).replaceAll(' ', '-')}`,
      );
    });
  });

  describe('createDefaultDocumentStatisticsReportEntry', () => {
    it('should be defined', () => {
      expect(service.createDefaultDocumentStatisticsReportEntry).toBeDefined();
    });

    it('should mutate and create entry for provided agency and applicationType in map', () => {
      service.createDefaultDocumentStatisticsReportEntry(mockEmptyAgencyApplicationTypeMap, mockAgencyName, mockApplicationType);

      expect(mockEmptyAgencyApplicationTypeMap).toEqual({
        [`${mockAgencyName}-${mockApplicationType}`]: {
          agency: mockAgencyName,
          applicationType: mockApplicationType,
          issuedCount: 0,
          revokedCount: 0,
          accessedCount: 0,
          downloadCount: 0,
          printSaveCount: 0,
          viewCount: 0,
          agencyDownloadCount: 0,
        },
      });
    });
  });
});
