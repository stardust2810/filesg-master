import {
  FORMSG_PROCESS_FAIL_TYPE,
  FormSgIssuanceBatchProcessFailureMessagePayload,
  FormSgIssuanceSingleFailureMessagePayload,
} from '@filesg/backend-common';
import { Test, TestingModule } from '@nestjs/testing';

import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { mockEventLogsServiceClientProvider } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockEmailService } from '../../notification/__mocks__/email.service.mock';
import { EmailService } from '../../notification/email.service';
import {
  mockBatchValidationFailureMessageBody,
  mockContentType,
  mockFailureMessageBody,
  mockRecordId,
  mockReportDataInBase64,
  mockReportFileName,
  mockSuccessMessageBody,
  TestFormSgEventService,
} from '../__mocks__/formsg-event.service.mock';

describe('FormSgEventService', () => {
  let service: TestFormSgEventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFormSgEventService,
        { provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER, useValue: mockEventLogsServiceClientProvider },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<TestFormSgEventService>(TestFormSgEventService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('formSgIssuanceHandler', () => {
    let getFormSgIssuanceReportSpy: jest.SpyInstance;

    beforeEach(() => {
      getFormSgIssuanceReportSpy = jest.spyOn(service, 'getFormSgIssuanceReport');
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should call methods with the right params when fail type is not auth-decrypt, process-others, batch-others or batch-validation', async () => {
      getFormSgIssuanceReportSpy.mockResolvedValueOnce({
        contentType: mockContentType,
        reportFileName: mockReportFileName,
        reportDataInBase64: mockReportDataInBase64,
      });

      await service.formSgIssuanceHandler(mockSuccessMessageBody);

      expect(getFormSgIssuanceReportSpy).toBeCalledWith(mockRecordId);
      expect(mockEmailService.sendFormSgIssuanceReportToRequestor).toBeCalledWith(mockSuccessMessageBody, [
        { filename: mockReportFileName, contentType: mockContentType, base64Data: mockReportDataInBase64 },
      ]);
    });

    it('should not call getFormSgIssuanceReport method when fail type is of batch-validation', async () => {
      await service.formSgIssuanceHandler(mockBatchValidationFailureMessageBody);

      expect(getFormSgIssuanceReportSpy).not.toBeCalled();
      expect(mockEmailService.sendFormSgIssuanceReportToRequestor).toBeCalledWith(mockBatchValidationFailureMessageBody);
    });

    it('should not get and send report when fail type is of auth-decrypt or process-others', async () => {
      const failTypes = [FORMSG_PROCESS_FAIL_TYPE.AUTH_DECRYPT, FORMSG_PROCESS_FAIL_TYPE.OTHERS, FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS];

      const errorLoggerSpy = jest.spyOn(service['logger'], 'error');

      const getFormSgIssuanceReportSpy = jest.spyOn(service, 'getFormSgIssuanceReport');

      for (const failType of failTypes) {
        (
          mockFailureMessageBody.payload as FormSgIssuanceSingleFailureMessagePayload | FormSgIssuanceBatchProcessFailureMessagePayload
        ).failType = failType;

        await service.formSgIssuanceHandler(mockFailureMessageBody);

        expect(errorLoggerSpy).toBeCalledWith(
          `Not sending report to requestor because it is ${failType} error. Record/issuance id: ${mockRecordId}`,
        );
        expect(getFormSgIssuanceReportSpy).toBeCalledTimes(0);
        expect(mockEmailService.sendFormSgIssuanceReportToRequestor).toBeCalledTimes(0);
      }
    });
  });

  describe('getFormSgIssuanceReport', () => {
    it('should call method with the right params', async () => {
      const mockResponse = {
        headers: {
          'content-disposition': `attachment; filename=${mockReportFileName}`,
          'content-type': 'text/csv',
        },
        data: mockReportDataInBase64,
      };

      mockEventLogsServiceClientProvider.get.mockResolvedValueOnce(mockResponse);

      await service.getFormSgIssuanceReport(mockRecordId);

      expect(mockEventLogsServiceClientProvider.get).toBeCalledWith(
        `v1/report/formsg-issuance/${mockRecordId}?excludeFailureDetails=true`,
        {
          responseType: 'blob',
        },
      );
    });
  });
});
