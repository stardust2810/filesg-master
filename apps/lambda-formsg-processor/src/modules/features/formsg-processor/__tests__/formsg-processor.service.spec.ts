import { COMPONENT_ERROR_CODE, FORMSG_FAIL_CATEGORY } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import {
  FormSgCreateTransactionError,
  FormSgMessageProcessingError,
  FormSgNonRetryableCreateTransactionError,
  MissingMessageAttributesError,
} from '../../../../common/custom-exceptions';
import { CORE_API_CLIENT_PROVIDER, TRANSFER_API_CLIENT_PROVIDER } from '../../../../const';
import { mockCoreServiceApiClient, mockTransferServiceApiClient } from '../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { mockErroneousSqsRecord, mockSqsEvent, TestFormSgProcessorService } from '../__mocks__/formsg-processor.service.mock';
import { mockBatchIssuanceFormService } from '../form-handler/__mocks__/batch-issuance-form.service.mock';
import { mockRecallTransactionFormService } from '../form-handler/__mocks__/recall-transaction-form.service.mock';
import { mockSingleIssuanceFormService } from '../form-handler/__mocks__/single-issuance-form.service.mock';
import { BatchIssuanceFormService } from '../form-handler/batch-issuance-form.service';
import { RecallTransactionFormService } from '../form-handler/recall-transaction-form.service';
import { SingleIssuanceFormService } from '../form-handler/single-issuance-form.service';

describe('FormSgProcessorService', () => {
  let service: TestFormSgProcessorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestFormSgProcessorService,
        { provide: SingleIssuanceFormService, useValue: mockSingleIssuanceFormService },
        { provide: BatchIssuanceFormService, useValue: mockBatchIssuanceFormService },
        { provide: RecallTransactionFormService, useValue: mockRecallTransactionFormService },
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: CORE_API_CLIENT_PROVIDER, useValue: mockCoreServiceApiClient },
        { provide: TRANSFER_API_CLIENT_PROVIDER, useValue: mockTransferServiceApiClient },
      ],
    }).compile();

    service = module.get<TestFormSgProcessorService>(TestFormSgProcessorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('errorHandler', () => {
    it('errorHandler should throw random processing error', async () => {
      await expect(service.errorHandler(new Error(), 'messageId')).rejects.toThrowError(Error);
    });
  });

  describe('run', () => {
    it('errorHandler should be called where there is random processing error, run should not be resolved', async () => {
      jest.spyOn(mockSingleIssuanceFormService, 'singleIssuanceFormHandler').mockImplementation(() => {
        throw new Error();
      });

      jest.spyOn(service, 'errorHandler').mockImplementation(() => {
        throw new Error();
      });

      await expect(service.run(mockSqsEvent)).rejects.toThrowError(FormSgMessageProcessingError);
      await expect(service.errorHandler).toBeCalledTimes(1);
    });

    it('run should be resolved when non retryable error is thrown', async () => {
      jest.spyOn(mockSingleIssuanceFormService, 'singleIssuanceFormHandler').mockImplementation(() => {
        throw new FormSgNonRetryableCreateTransactionError(
          'Random error',
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
          FORMSG_FAIL_CATEGORY.AGENCY_EMAIL_NOT_WHITELISTED,
        );
      });

      await expect(service.run(mockSqsEvent)).resolves.not.toThrow();
    });

    it('run should not be resolved when retryable error is thrown', async () => {
      jest.spyOn(mockSingleIssuanceFormService, 'singleIssuanceFormHandler').mockImplementation(() => {
        throw new FormSgCreateTransactionError(
          'Random error',
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
          FORMSG_FAIL_CATEGORY.AGENCY_EMAIL_NOT_WHITELISTED,
        );
      });

      await expect(service.run(mockSqsEvent)).rejects.toThrow(FormSgMessageProcessingError);
    });
  });

  describe('messageHandler', () => {
    it('errorHandler should be called where there is random processing error, run should not be resolved', async () => {
      jest.spyOn(service, 'errorHandler').mockImplementation();

      await expect(service.messageHandler(mockErroneousSqsRecord)).resolves.not.toThrow();
      await expect(service.errorHandler).toBeCalledTimes(1);
      await expect(service.errorHandler).toBeCalledWith(
        new MissingMessageAttributesError(
          `formsgSignatureVal - ${mockErroneousSqsRecord.messageAttributes.formsgSignature.stringValue} | typeVal - ${undefined}`,
          COMPONENT_ERROR_CODE.FORMSG_SERVICE,
        ),
        mockErroneousSqsRecord.messageId,
      );
    });
  });
});
