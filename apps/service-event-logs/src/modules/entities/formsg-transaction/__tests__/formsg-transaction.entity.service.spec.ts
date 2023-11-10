/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Item, QueryResponse } from 'nestjs-dynamoose';

import {
  FORMSG_TRANSACTION,
  FormSgTransaction,
  FormSgTransactionCreationModel,
  FormSgTransactionKey,
  FormSgTransactionUpdateModel,
} from '../../../../entities/formsg-transaction';
import {
  mockFormSgTransaction,
  mockFormSgTransactionModel,
  mockFormSgTransactions,
  mockTransactionUuid,
} from '../__mocks__/formsg-transaction.entity.mock';
import { FormSgTransactionEntityService } from '../formsg-transaction.entity.service';

describe('FormSgTransactionEntityService', () => {
  let service: FormSgTransactionEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormSgTransactionEntityService, { provide: FORMSG_TRANSACTION + 'Model', useValue: mockFormSgTransactionModel }],
    }).compile();

    service = module.get<FormSgTransactionEntityService>(FormSgTransactionEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('createFormSgTransaction', () => {
    const model: FormSgTransactionCreationModel = {
      id: '1',
      queueEventTimestamp: '2023-07-31T07:20:36.271Z',
      processorStartedTimestamp: '2023-07-31T07:20:36.271Z',
    };

    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.create.mockResolvedValueOnce(mockFormSgTransaction);

      expect(await service.createFormSgTransaction(model)).toEqual(mockFormSgTransaction);
      expect(mockFormSgTransactionModel.create).toBeCalledWith(model);
    });
  });

  describe('batchPutFormSgTransactions', () => {
    const queueEventTimestamp = new Date().toISOString();
    const processorStartedTimestamp = new Date().toISOString();

    const models: FormSgTransactionCreationModel[] = [
      {
        id: '1',
        queueEventTimestamp,
        processorStartedTimestamp,
      },
      {
        id: '2',
        queueEventTimestamp,
        processorStartedTimestamp,
      },
    ];

    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.batchPut.mockResolvedValueOnce(mockFormSgTransactions);

      expect(await service.batchPutFormSgTransactions(models)).toEqual(mockFormSgTransactions);
      expect(mockFormSgTransactionModel.batchPut).toBeCalledWith(models);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('findFormSgTransaction', () => {
    const key: FormSgTransactionKey = { id: '1' };

    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.get.mockResolvedValueOnce(mockFormSgTransaction);

      expect(await service.findFormSgTransaction(key)).toEqual(mockFormSgTransaction);
      expect(mockFormSgTransactionModel.get).toBeCalledWith(key);
    });
  });

  describe('findFormSgTransactions', () => {
    const keys: FormSgTransactionKey[] = [{ id: '1' }, { id: '2' }];

    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.batchGet.mockResolvedValueOnce(mockFormSgTransactions);

      expect(await service.findFormSgTransactions(keys)).toEqual(mockFormSgTransactions);
      expect(mockFormSgTransactionModel.batchGet).toBeCalledWith(keys);
    });
  });

  describe('findFormSgTransactionsByTransactionUuid', () => {
    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.query().eq().attributes().exec.mockResolvedValueOnce([new FormSgTransaction()]);

      await service.findFormSgTransactionsByTransactionUuid(mockTransactionUuid);

      expect(mockFormSgTransactionModel.query).toBeCalledWith('transactionUuid');
      expect(mockFormSgTransactionModel.query().eq).toBeCalledWith(mockTransactionUuid);
      expect(mockFormSgTransactionModel.query().eq().attributes).toBeCalledWith(['id', 'transaction']);
      expect(mockFormSgTransactionModel.query().eq().attributes().exec).toBeCalledTimes(1);
    });

    it('should throw not found error when toThrow set to true and record is not found', async () => {
      mockFormSgTransactionModel.query().eq().attributes().exec.mockResolvedValueOnce([]);

      await expect(service.findFormSgTransactionsByTransactionUuid(mockTransactionUuid, true)).rejects.toThrowError(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'FormSg Transaction', 'uuid', mockTransactionUuid),
      );
    });
  });

  // ===========================================================================
  // Update
  // ===========================================================================
  describe('updateFormSgTransaction', () => {
    const key: FormSgTransactionKey = { id: '1' };
    const model: FormSgTransactionUpdateModel = {
      transactionUuid: 'newTransactionUuid-1',
    };

    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.update.mockResolvedValueOnce(mockFormSgTransactions);

      expect(await service.updateFormSgTransaction(key, model)).toEqual(mockFormSgTransactions);
      expect(mockFormSgTransactionModel.update).toBeCalledWith(key, model, { condition: undefined, return: 'item' });
    });
  });

  describe('updateFormSgTransactionByTransactionUuid', () => {
    it('should call methods with the right params', async () => {
      const mockFormSgTransaction = new FormSgTransaction();
      mockFormSgTransaction.id = 'mock-uuid-1';
      const mockFindResponse = [mockFormSgTransaction] as QueryResponse<Item<FormSgTransaction>>;
      const updateModel: FormSgTransactionUpdateModel = { requestorEmail: 'new@gmail.com' };

      const findFormSgTransactionsByTransactionUuidSpy = jest.spyOn(service, 'findFormSgTransactionsByTransactionUuid');
      findFormSgTransactionsByTransactionUuidSpy.mockResolvedValueOnce(mockFindResponse);

      await service.updateFormSgTransactionByTransactionUuid(mockTransactionUuid, updateModel);

      expect(mockFormSgTransactionModel.update).toBeCalledWith({ id: mockFindResponse[0]['id'] }, updateModel, {
        condition: undefined,
        return: 'item',
      });
    });
  });

  // ===========================================================================
  // Delete
  // ===========================================================================
  describe('deleteFormSgTransaction', () => {
    const key: FormSgTransactionKey = { id: '1' };

    it('should call methods with the right params', async () => {
      mockFormSgTransactionModel.delete.mockReturnValueOnce(undefined);

      expect(await service.deleteFormSgTransaction(key)).toEqual(undefined);
      expect(mockFormSgTransactionModel.delete).toBeCalledWith(key, { condition: undefined, return: null });
    });
  });

  describe('deleteFormSgTransactions', () => {
    const keys: FormSgTransactionKey[] = [{ id: '1' }, { id: '2' }];

    it('should call methods with the right params', async () => {
      const expectedResponse = { unprocessedItem: mockFormSgTransactions };
      mockFormSgTransactionModel.batchDelete.mockReturnValueOnce(expectedResponse);

      expect(await service.deleteFormSgTransactions(keys)).toEqual(expectedResponse);
      expect(mockFormSgTransactionModel.batchDelete).toBeCalledWith(keys);
    });
  });
});
