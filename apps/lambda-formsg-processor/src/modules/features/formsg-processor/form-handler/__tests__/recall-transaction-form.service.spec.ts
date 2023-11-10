/* eslint-disable sonarjs/no-duplicate-string */
import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { FormSgService } from '@filesg/formsg';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as classTransformerLib from 'class-transformer';
import { plainToClass } from 'class-transformer';

import { FormSgNonRetryableRecallTransactionError, FormSgRecallTransactionError } from '../../../../../common/custom-exceptions';
import {
  CORE_API_CLIENT_PROVIDER,
  FORMSG_RECALL_TRANSACTION_FORM_SECRET_NAME,
  RECALL_TRANSACTION_PATH,
  SECRET_MANAGER_FSG_APP_PREFIX,
} from '../../../../../const';
import { RecallTransactionFormData } from '../../../../../typings';
import { mockCoreServiceApiClient } from '../../../../setups/api-client/__mocks__/api-client.mock';
import { mockFileSGConfigService } from '../../../../setups/config/__mocks__/config.mock';
import { FileSGConfigService } from '../../../../setups/config/config.service';
import { mockKey, mockSmService } from '../../../aws/__mocks__/sm.service.mock';
import { SmService } from '../../../aws/sm.service';
import { generateMockAxiosError } from '../__mocks__/common.mock';
import {
  mockFormSgSqsRecord,
  mockRecallTransactionData,
  mockResponses,
  TestRecallTransactionFormService,
} from '../__mocks__/recall-transaction-form.service.mock';
import { mockFormSgService } from '../__mocks__/single-issuance-form.service.mock';

describe('RecallIssuanceFormService', () => {
  let service: TestRecallTransactionFormService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TestRecallTransactionFormService,
        { provide: FileSGConfigService, useValue: mockFileSGConfigService },
        { provide: SmService, useValue: mockSmService },
        { provide: FormSgService, useValue: mockFormSgService },
        { provide: CORE_API_CLIENT_PROVIDER, useValue: mockCoreServiceApiClient },
      ],
    }).compile();

    service = module.get<TestRecallTransactionFormService>(TestRecallTransactionFormService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Public methods', () => {
    describe('recallTransactionHandler', () => {
      it('should be defined', () => {
        expect(service.recallTransactionHandler).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        // Spy
        const processFormDataSpy = jest.spyOn(service, 'processFormData');
        const plainToClassSpy = jest.spyOn(classTransformerLib, 'plainToClass');
        const recallTransactionSpy = jest.spyOn(service, 'recallTransaction');

        // Mock
        mockFormSgService.decryptFormData.mockResolvedValueOnce({ responses: [] });
        processFormDataSpy.mockReturnValueOnce(mockRecallTransactionData);
        recallTransactionSpy.mockReturnThis();

        const { env } = mockFileSGConfigService.systemConfig;
        const { formSgRecallTransactionFormId, formSgRecallTransactionWebhookUrl } = mockFileSGConfigService.formSGConfig;

        const { parsedBodyData, parsedMessageAttributes } = mockFormSgSqsRecord;
        const { formId } = parsedBodyData!;
        const { formsgSignature } = parsedMessageAttributes!;
        const mockRecallTransactionRequestData = plainToClass(RecallTransactionFormData, mockRecallTransactionData);

        await service.recallTransactionHandler(mockFormSgSqsRecord);

        expect(mockFormSgService.validateFormId).toBeCalledWith(formId, formSgRecallTransactionFormId);
        expect(mockFormSgService.authenticateWebhook).toBeCalledWith(formsgSignature, formSgRecallTransactionWebhookUrl);
        expect(mockSmService.getSecretValue).toBeCalledWith(
          `${SECRET_MANAGER_FSG_APP_PREFIX}/${env}/${FORMSG_RECALL_TRANSACTION_FORM_SECRET_NAME}`,
        );
        expect(mockFormSgService.decryptFormData).toBeCalledWith(parsedBodyData!, mockKey);
        expect(processFormDataSpy).toBeCalledWith([]);
        expect(plainToClassSpy).toBeCalledWith(RecallTransactionFormData, mockRecallTransactionData);
        expect(recallTransactionSpy).toBeCalledWith(mockRecallTransactionRequestData);
      });
    });
  });

  describe('Protected methods', () => {
    describe('processFormData', () => {
      it('should be defined', () => {
        expect(service.processFormData).toBeDefined();
      });

      it('should return correct fields', () => {
        expect(service.processFormData(mockResponses)).toEqual(mockRecallTransactionData);
      });
    });

    describe('recallTransaction', () => {
      it('should be defined', () => {
        expect(service.recallTransaction).toBeDefined();
      });

      it('should call correct methods with correct args', async () => {
        const { requestorEmail, transactionUuid } = mockRecallTransactionData;

        await service.recallTransaction(mockRecallTransactionData);

        expect(mockCoreServiceApiClient.post).toBeCalledWith(`${RECALL_TRANSACTION_PATH}/${transactionUuid}`, { requestorEmail });
      });

      describe('error handling', () => {
        describe('should throw FormSgRecallTransactionError', () => {
          it('if error is not axios error', async () => {
            const error = new Error('Not axios error');
            mockCoreServiceApiClient.post.mockRejectedValueOnce(error);

            await expect(service.recallTransaction(mockRecallTransactionData)).rejects.toThrowError(
              new FormSgRecallTransactionError(error.message, COMPONENT_ERROR_CODE.FORMSG_SERVICE),
            );
          });

          it('if error is not 4XX axios error', async () => {
            const error = generateMockAxiosError(HttpStatus.GATEWAY_TIMEOUT, EXCEPTION_ERROR_CODE.GATEWAY_TIMEOUT, '504 error');
            mockCoreServiceApiClient.post.mockRejectedValueOnce(error);

            await expect(service.recallTransaction(mockRecallTransactionData)).rejects.toThrowError(
              new FormSgRecallTransactionError(error.message, COMPONENT_ERROR_CODE.FORMSG_SERVICE),
            );
          });
        });

        it('should throw FormSgNonRetryableRecallTransactionError if error is 4XX axios error', async () => {
          const error = generateMockAxiosError(HttpStatus.BAD_REQUEST, EXCEPTION_ERROR_CODE.BAD_REQUEST, '400 error');
          mockCoreServiceApiClient.post.mockRejectedValueOnce(error);

          await expect(service.recallTransaction(mockRecallTransactionData)).rejects.toThrowError(
            new FormSgNonRetryableRecallTransactionError(JSON.stringify(error.response!.data), COMPONENT_ERROR_CODE.FORMSG_SERVICE),
          );
        });
      });
    });
  });
});
