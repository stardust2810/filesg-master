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

describe('ReportingService', () => {
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
    let generateFormSgIssuanceRecordsSpy: jest.SpyInstance;
    let json2csvSpy: jest.SpyInstance;

    beforeEach(() => {
      generateFormSgIssuanceRecordsSpy = jest.spyOn(service, 'generateFormSgIssuanceRecords');
      generateFormSgIssuanceRecordsSpy.mockReturnValueOnce([]);
      json2csvSpy = jest.spyOn(json2csvLib, 'json2csv');
    });

    it('should call methods with right args when transaction is part of a batch', async () => {
      const batchTransaction = new FormSgTransaction();
      batchTransaction.batchSize = 1;

      mockFormSgTransactionEntityService.findFormSgTransaction.mockResolvedValueOnce(batchTransaction);
      mockFormSgTransactionEntityService.findFormSgBatchTransactionsByBatchId.mockResolvedValueOnce([mockSuccessFormSgTransaction]);

      await service.generateFormSgIssuanceReport(mockRecordId);

      expect(generateFormSgIssuanceRecordsSpy).toBeCalledWith([mockSuccessFormSgTransaction], mockRecordId, undefined);
      expect(json2csvSpy).toBeCalledWith([], { prependHeader: true });
    });

    it('should call methods with right args when transaction is not part of a batch', async () => {
      mockFormSgTransactionEntityService.findFormSgTransaction.mockResolvedValueOnce(mockSuccessFormSgTransaction);

      await service.generateFormSgIssuanceReport(mockRecordId);

      expect(generateFormSgIssuanceRecordsSpy).toBeCalledWith([mockSuccessFormSgTransaction], mockRecordId, undefined);
      expect(json2csvSpy).toBeCalledWith([], { prependHeader: true });
    });
  });

  describe('generateFormSgIssuanceRecords', () => {
    it('should call generateFormSgIssuanceSuccessReport with the right params when transaction result is success', () => {
      const transactions = [mockSuccessFormSgTransaction];

      const generateFormSgIssuanceSuccessReportSpy = jest.spyOn(service, 'generateFormSgIssuanceSuccessReport');
      generateFormSgIssuanceSuccessReportSpy.mockReturnValueOnce([]);

      service.generateFormSgIssuanceRecords(transactions, mockRecordId);

      transactions.forEach((transaction, index) => {
        expect(generateFormSgIssuanceSuccessReportSpy).toBeCalledWith(transaction, mockRecordId, index + 1, undefined);
      });
    });

    it('should call generateFormSgIssuanceFailureReport with the right params when transaction result is failure', () => {
      const transactions = [mockFailureFormSgTransaction];

      const generateFormSgIssuanceFailureReportSpy = jest.spyOn(service, 'generateFormSgIssuanceFailureReport');
      generateFormSgIssuanceFailureReportSpy.mockReturnValueOnce([]);

      service.generateFormSgIssuanceRecords(transactions, mockRecordId);

      transactions.forEach((transaction, index) => {
        expect(generateFormSgIssuanceFailureReportSpy).toBeCalledWith(transaction, mockRecordId, index + 1, undefined);
      });
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
        undefined,
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

          service.generateFormSgIssuanceFailureReport(mockFormSgTransaction, mockRecordId, 1);

          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith(
            {
              formSgSubmissionId: mockRecordId,
              index: '1',
              transactionStatus: RESULT_STATUS.FAILURE,
              failureReason: failedReason,
            },
            undefined,
          );
        }
      });
    });

    describe('when fail type is create-txn, file-upload, virus-scan or transaction-others', () => {
      it('should call generateFormSgIssuanceTransactionRecords with the right params', () => {
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
          const failSubType = `${failType} fail sub type`;
          const failedReason = `${failType} failed reason`;

          mockFormSgTransaction.failType = failType;
          mockFormSgTransaction.failSubType = failSubType;
          mockFormSgTransaction.failedReason = failedReason;

          service.generateFormSgIssuanceFailureReport(mockFormSgTransaction, mockRecordId, 1);

          expect(generateFormSgIssuanceTransactionRecordsSpy).toBeCalledWith(
            mockRecordId,
            mockTransaction,
            mockApplication,
            1,
            RESULT_STATUS.FAILURE,
            failSubType,
            failedReason,
            undefined,
            undefined,
          );
        }
      });

      it('should throw MissingReportDetailsException when there is missing transaction or application', () => {
        const mockFormSgTransaction = new FormSgTransaction();
        mockFormSgTransaction.failType = FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN;

        expect(() => service.generateFormSgIssuanceFailureReport(mockFormSgTransaction, mockRecordId, 1)).toThrow(
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
        for (const {
          uuid: agencyFileAssetUuid,
          name: agencyFileAssetName,
          deleteAt: agencyFileAssetDeleteAt,
          failSubType: agencyFileAssetFailSubType,
          failedReason: agencyFileAssetFailedReason,
        } of mockTransaction.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith(
            {
              index: `${mockIndex}`,
              formSgSubmissionId: mockRecordId,
              applicationType: mockApplication.type,
              applicationExternalRefId: mockApplication.externalRefId,
              transactionUuid: mockTransaction.uuid,
              transactionName: mockTransaction.name,
              recipientActivityUuid: recipientActivity.uuid,
              recipientName: recipientActivity.name,
              recipientMaskedUin: recipientActivity.maskedUin,
              recipientEmail: recipientActivity.email,
              recipientDob: recipientActivity.dob,
              recipientContact: recipientActivity.contact,
              isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
              agencyFileAssetUuid,
              agencyFileAssetName,
              agencyFileAssetDeleteAt,
              transactionStatus: RESULT_STATUS.FAILURE,
              failSubType: agencyFileAssetFailSubType,
              failureReason: agencyFileAssetFailedReason,
              notificationFailureReason: undefined,
            },
            undefined,
          );
        }
      }
    });

    it('should include general fail reason if file asset has no fail reason', () => {
      const mockFailedReason = 'some error';

      service.generateFormSgIssuanceTransactionRecords(
        mockRecordId,
        mockTransaction,
        mockApplication,
        mockIndex,
        RESULT_STATUS.FAILURE,
        undefined,
        mockFailedReason,
      );

      for (const recipientActivity of mockTransaction.recipientActivities) {
        for (const {
          uuid: agencyFileAssetUuid,
          name: agencyFileAssetName,
          deleteAt: agencyFileAssetDeleteAt,
          failSubType: agencyFileAssetFailSubType,
        } of mockTransaction.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith(
            {
              index: `${mockIndex}`,
              formSgSubmissionId: mockRecordId,
              applicationType: mockApplication.type,
              applicationExternalRefId: mockApplication.externalRefId,
              transactionUuid: mockTransaction.uuid,
              transactionName: mockTransaction.name,
              recipientActivityUuid: recipientActivity.uuid,
              recipientName: recipientActivity.name,
              recipientMaskedUin: recipientActivity.maskedUin,
              recipientEmail: recipientActivity.email,
              recipientDob: recipientActivity.dob,
              recipientContact: recipientActivity.contact,
              isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
              agencyFileAssetUuid,
              agencyFileAssetName,
              agencyFileAssetDeleteAt,
              transactionStatus: RESULT_STATUS.FAILURE,
              failSubType: agencyFileAssetFailSubType,
              failureReason: mockFailedReason,
              notificationFailureReason: undefined,
            },
            undefined,
          );
        }
      }
    });

    it("should include file assets' fail reason if there is any from the file asset objects", () => {
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
          deleteAt: agencyFileAssetDeleteAt,
          failSubType: agencyFileAssetFailSubType,
          failedReason: agencyFileAssetFailedReason,
        } of mockTransactionWithFailureFileAssets.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith(
            {
              index: `${mockIndex}`,
              formSgSubmissionId: mockRecordId,
              applicationType: mockApplication.type,
              applicationExternalRefId: mockApplication.externalRefId,
              transactionUuid: mockTransactionWithFailureFileAssets.uuid,
              transactionName: mockTransaction.name,
              recipientActivityUuid: recipientActivity.uuid,
              recipientName: recipientActivity.name,
              recipientMaskedUin: recipientActivity.maskedUin,
              recipientEmail: recipientActivity.email,
              recipientDob: recipientActivity.dob,
              recipientContact: recipientActivity.contact,
              isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
              agencyFileAssetUuid,
              agencyFileAssetName,
              agencyFileAssetDeleteAt,
              transactionStatus: RESULT_STATUS.FAILURE,
              failSubType: agencyFileAssetFailSubType,
              failureReason: agencyFileAssetFailedReason,
              notificationFailureReason: undefined,
            },
            undefined,
          );
        }
      }
    });

    it('should include notification delivery fail reason if there is any from the notification sent objects', () => {
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
          deleteAt: agencyFileAssetDeleteAt,
        } of mockTransactionWithFailureNotificationSent.agencyFileAssets) {
          expect(generateFormSgIssuanceCsvRecordSpy).toBeCalledWith(
            {
              index: `${mockIndex}`,
              formSgSubmissionId: mockRecordId,
              applicationType: mockApplication.type,
              applicationExternalRefId: mockApplication.externalRefId,
              transactionUuid: mockTransactionWithFailureNotificationSent.uuid,
              transactionName: mockTransaction.name,
              recipientActivityUuid: recipientActivity.uuid,
              recipientName: recipientActivity.name,
              recipientMaskedUin: recipientActivity.maskedUin,
              recipientEmail: recipientActivity.email,
              recipientDob: recipientActivity.dob,
              recipientContact: recipientActivity.contact,
              isNonSingpassRetrievable: recipientActivity.isNonSingpassRetrievable,
              agencyFileAssetUuid,
              agencyFileAssetName,
              agencyFileAssetDeleteAt,
              transactionStatus: RESULT_STATUS.FAILURE,
              failSubType: undefined,
              failureReason: undefined,
              notificationFailureReason: mockNotificationDeliverFailureReason,
            },
            undefined,
          );
        }
      }
    });
  });
});
