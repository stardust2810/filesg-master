import { FORMSG_PROCESS_FAIL_TYPE, FORMSG_TRANSACTION_FAIL_TYPE, RESULT_STATUS } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as json2csvLib from 'json-2-csv';

import {
  MissingReportDetailsException,
  UnknownFormSgTransactionResultException,
} from '../../../../common/filters/custom-exceptions.filter';
import { FormSgTransaction } from '../../../../entities/formsg-transaction';
import { mockFormSgTransactionEntityService } from '../../../entities/formsg-transaction/__mocks__/formsg-transaction.entity.mock';
import { FormSgTransactionEntityService } from '../../../entities/formsg-transaction/formsg-transaction.entity.service';
import {
  mockApplication,
  mockFailureAgencyFileAssets,
  mockFailureFormSgTransaction,
  mockFailureNotificationsSent,
  mockNotificationDeliverFailureReason,
  mockNotificationsSent,
  mockRecordId,
  mockSuccessFormSgTransaction,
  mockTransaction,
  mockUnknownFormSgTransaction,
  TestReportingService,
} from '../__mocks__/reporting.service.mock';

// gd TODO: fix test
describe.skip('ReportingService', () => {
  let service: TestReportingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestReportingService, { provide: FormSgTransactionEntityService, useValue: mockFormSgTransactionEntityService }],
    }).compile();

    service = module.get<TestReportingService>(TestReportingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateFormSgIssuanceReport', () => {
    it('should call generateFormSgIssuanceSuccessReport with the right params when transaction result is success', async () => {
      mockFormSgTransactionEntityService.findFormSgTransaction.mockResolvedValueOnce(mockSuccessFormSgTransaction);

      const generateFormSgIssuanceSuccessReportSpy = jest.spyOn(service, 'generateFormSgIssuanceSuccessReport');
      generateFormSgIssuanceSuccessReportSpy.mockReturnValueOnce([]);

      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');

      await service.generateFormSgIssuanceReport(mockRecordId);

      expect(generateFormSgIssuanceSuccessReportSpy).toBeCalledWith(mockSuccessFormSgTransaction, mockRecordId);
      expect(json2csvSpy).toBeCalledWith([], { prependHeader: true });
    });

    it('should call generateFormSgIssuanceSuccessReport with the right params when transaction result is failure', async () => {
      mockFormSgTransactionEntityService.findFormSgTransaction.mockResolvedValueOnce(mockFailureFormSgTransaction);

      const generateFormSgIssuanceFailureReportSpy = jest.spyOn(service, 'generateFormSgIssuanceFailureReport');
      generateFormSgIssuanceFailureReportSpy.mockReturnValueOnce([]);

      const json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');

      await service.generateFormSgIssuanceReport(mockRecordId);

      expect(generateFormSgIssuanceFailureReportSpy).toBeCalledWith(mockFailureFormSgTransaction, mockRecordId);
      expect(json2csvSpy).toBeCalledWith([], { prependHeader: true });
    });

    it('should throw UnknownFormSgTransactionResultException when transaction result is unknown', async () => {
      mockFormSgTransactionEntityService.findFormSgTransaction.mockResolvedValueOnce(mockUnknownFormSgTransaction);

      await expect(service.generateFormSgIssuanceReport(mockRecordId)).rejects.toThrowError(
        new UnknownFormSgTransactionResultException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, mockRecordId),
      );
    });
  });

  describe('generateFormSgIssuanceSuccessReport', () => {
    it('should call generateFormSgIssuanceTransactionRecords with the right params', async () => {
      const generateFormSgIssuanceTransactionRecordsSpy = jest.spyOn(service, 'generateFormSgIssuanceTransactionRecords');

      service.generateFormSgIssuanceSuccessReport(mockSuccessFormSgTransaction, mockRecordId, 1);

      expect(generateFormSgIssuanceTransactionRecordsSpy).toBeCalledWith(
        mockRecordId,
        mockTransaction,
        mockApplication,
        1,
        RESULT_STATUS.SUCCESS,
        undefined,
        undefined,
        mockNotificationsSent,
      );
    });

    it('should throw MissingReportDetailsException when there is missing transaction or application', () => {
      const mockFormSgTransaction = new FormSgTransaction();

      expect(() => service.generateFormSgIssuanceSuccessReport(mockFormSgTransaction, mockRecordId, 1)).toThrow(
        new MissingReportDetailsException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, mockRecordId),
      );
    });
  });

  describe('generateFormSgIssuanceFailureReport', () => {
    describe('when fail type is auth-decrpyt or process-others', () => {
      it('should call generateFormSgIssuanceCsvRecord with the right params', () => {
        const mockFormSgTransaction = new FormSgTransaction();
        mockFormSgTransaction.result = RESULT_STATUS.FAILURE;

        const generateFormSgIssuanceCsvRecordSpy = jest.spyOn(service, 'generateFormSgIssuanceCsvRecord');

        const failTypes = [FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT, FORMSG_PROCESS_FAIL_TYPE.OTHERS];

        for (const failType of failTypes) {
          const failedReason = `${failType} failed reason`;

          mockFormSgTransaction.failType = failType;
          mockFormSgTransaction.failedReason = failedReason;

          service.generateFormSgIssuanceFailureReport(mockFormSgTransaction, mockRecordId,1);

          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith({
            formSgSubmissionId: mockRecordId,
            index: '1',
            transactionStatus: RESULT_STATUS.FAILURE,
            failureReason: failedReason,
          });
        }
      });
    });

    describe('when fail type is create-txn, file-upload, virus-scan or transaction-others', () => {
      // gd TODO: fix test
      it.skip('should call generateFormSgIssuanceTransactionRecords with the right params', () => {
        let mockFormSgTransaction = new FormSgTransaction();
        mockFormSgTransaction = { ...mockSuccessFormSgTransaction };
        mockFormSgTransaction.result = RESULT_STATUS.FAILURE;

        const generateFormSgIssuanceTransactionRecordsSpy = jest.spyOn(service, 'generateFormSgIssuanceTransactionRecords');

        const failTypes = [
          FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN,
          FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD,
          FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN,
          FORMSG_TRANSACTION_FAIL_TYPE.OTHERS,
        ];

        for (const failType of failTypes) {
          const failedReason = `${failType} failed reason`;

          mockFormSgTransaction.failType = failType;
          mockFormSgTransaction.failedReason = failedReason;

          service.generateFormSgIssuanceFailureReport(mockFormSgTransaction, mockRecordId,1);

          expect(generateFormSgIssuanceTransactionRecordsSpy).toBeCalledWith(
            mockTransaction,
            mockApplication,
            1,
            RESULT_STATUS.FAILURE,
            failedReason,
          );
        }
      });

      it('should throw MissingReportDetailsException when there is missing transaction or application', () => {
        const mockFormSgTransaction = new FormSgTransaction();
        mockFormSgTransaction.failType = FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN;

        expect(() => service.generateFormSgIssuanceFailureReport(mockFormSgTransaction, mockRecordId,1)).toThrow(
          new MissingReportDetailsException(COMPONENT_ERROR_CODE.REPORTING_SERVICE, mockRecordId),
        );
      });
    });
  });

  describe('generateFormSgIssuanceTransactionRecords', () => {
    const mockIndex = 1;
    let generateFormSgIssuanceCsvRecordSpy: jest.SpyInstance;

    beforeEach(() => {
      generateFormSgIssuanceCsvRecordSpy = jest.spyOn(service, 'generateFormSgIssuanceCsvRecord');
    });

    it('should call generateFormSgIssuanceTransactionRecords with the right params', () => {
      service.generateFormSgIssuanceTransactionRecords(mockRecordId, mockTransaction, mockApplication, mockIndex, RESULT_STATUS.FAILURE);

      for (const recipientActivity of mockTransaction.recipientActivities) {
        for (const { uuid: agencyFileAssetUuid, name: agencyFileAssetName } of mockTransaction.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith({
            index: `${mockIndex}`,
            formSgSubmissionId: mockRecordId,
            applicationType: mockApplication.type,
            applicationExternalRefId: mockApplication.externalRefId,
            transactionUuid: mockTransaction.uuid,
            recipientActivityUuid: recipientActivity.uuid,
            recipientName: recipientActivity.name,
            recipientMaskedUin: recipientActivity.maskedUin,
            recipientEmail: recipientActivity.email,
            recipientDob: recipientActivity.dob,
            recipientContact: recipientActivity.contact,
            isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
            agencyFileAssetUuid,
            agencyFileAssetName,
            transactionStatus: RESULT_STATUS.FAILURE,
            failureReason: undefined,
            notificationFailureReason: undefined,
          });
        }
      }
    });

    // gd TODO: fix test
    it.skip('should include general fail reason if file asset has no fail reason', () => {
      const mockFailedReason = 'some error';

      service.generateFormSgIssuanceTransactionRecords(
        mockRecordId,
        mockTransaction,
        mockApplication,
        mockIndex,
        RESULT_STATUS.FAILURE,
        mockFailedReason,
      );

      for (const recipientActivity of mockTransaction.recipientActivities) {
        for (const { uuid: agencyFileAssetUuid, name: agencyFileAssetName } of mockTransaction.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith({
            index: `${mockIndex}`,
            applicationType: mockApplication.type,
            applicationExternalRefId: mockApplication.externalRefId,
            transactionUuid: mockTransaction.uuid,
            recipientActivityUuid: recipientActivity.uuid,
            recipientName: recipientActivity.name,
            recipientMaskedUin: recipientActivity.maskedUin,
            recipientEmail: recipientActivity.email,
            recipientDob: recipientActivity.dob,
            recipientContact: recipientActivity.contact,
            isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
            agencyFileAssetUuid,
            agencyFileAssetName,
            transactionStatus: RESULT_STATUS.FAILURE,
            failureReason: mockFailedReason,
            notificationFailureReason: undefined,
          });
        }
      }
    });

    it("should include file assets' fail reason if there is any from the filea sset objects", () => {
      const mockTransactionWithFailureFileAssets = { ...mockTransaction, agencyFileAssets: mockFailureAgencyFileAssets };

      service.generateFormSgIssuanceTransactionRecords(
        mockRecordId,
        mockTransactionWithFailureFileAssets,
        mockApplication,
        mockIndex,
        RESULT_STATUS.FAILURE,
      );

      for (const recipientActivity of mockTransactionWithFailureFileAssets.recipientActivities) {
        for (const {
          uuid: agencyFileAssetUuid,
          name: agencyFileAssetName,
          failedReason: agencyFileAssetFailedReason,
        } of mockTransactionWithFailureFileAssets.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith({
            index: `${mockIndex}`,
            formSgSubmissionId: mockRecordId,
            applicationType: mockApplication.type,
            applicationExternalRefId: mockApplication.externalRefId,
            transactionUuid: mockTransactionWithFailureFileAssets.uuid,
            recipientActivityUuid: recipientActivity.uuid,
            recipientName: recipientActivity.name,
            recipientMaskedUin: recipientActivity.maskedUin,
            recipientEmail: recipientActivity.email,
            recipientDob: recipientActivity.dob,
            recipientContact: recipientActivity.contact,
            isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
            agencyFileAssetUuid,
            agencyFileAssetName,
            transactionStatus: RESULT_STATUS.FAILURE,
            failureReason: agencyFileAssetFailedReason,
            notificationFailureReason: undefined,
          });
        }
      }
    });

    // gd TODO: fix test
    it.skip('should include notification delivery fail reason if there is any from the notification sent objects', () => {
      const mockTransactionWithFailureNotificationSent = { ...mockTransaction, notificationsSent: mockFailureNotificationsSent };

      service.generateFormSgIssuanceTransactionRecords(
        mockRecordId,
        mockTransactionWithFailureNotificationSent,
        mockApplication,
        mockIndex,
        RESULT_STATUS.FAILURE,
        undefined,
        undefined,
        mockFailureNotificationsSent,
      );

      for (const recipientActivity of mockTransactionWithFailureNotificationSent.recipientActivities) {
        for (const {
          uuid: agencyFileAssetUuid,
          name: agencyFileAssetName,
        } of mockTransactionWithFailureNotificationSent.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith({
            index: `${mockIndex}`,
            formSgSubmissionId: mockRecordId,
            applicationType: mockApplication.type,
            applicationExternalRefId: mockApplication.externalRefId,
            transactionUuid: mockTransactionWithFailureNotificationSent.uuid,
            recipientActivityUuid: recipientActivity.uuid,
            recipientName: recipientActivity.name,
            recipientMaskedUin: recipientActivity.maskedUin,
            recipientEmail: recipientActivity.email,
            recipientDob: recipientActivity.dob,
            recipientContact: recipientActivity.contact,
            isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
            agencyFileAssetUuid,
            agencyFileAssetName,
            transactionStatus: RESULT_STATUS.FAILURE,
            failureReason: undefined,
            notificationFailureReason: mockNotificationDeliverFailureReason,
          });
        }
      }
    });
  });
});
