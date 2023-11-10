/* eslint-disable sonarjs/no-duplicate-string */
import { EntityNotFoundException } from '@filesg/backend-common';
import { ACTIVITY_TYPE, COMPONENT_ERROR_CODE, TRANSACTION_STATUS } from '@filesg/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Transaction, TransactionUpdateModel } from '../../../../entities/transaction';
import { mockTransactionEntityRepository } from '../__mocks__/transaction.entity.repository.mock';
import {
  mockedDataForTransactionStatus,
  mockTransaction,
  mockTransactionModels,
  mockTransactions,
  mockTransactionUuid,
  mockTransactionUuid2,
  resultantDataForTransactionStatus,
} from '../__mocks__/transaction.entity.service.mock';
import { createMockTransaction } from '../__mocks__/transaction.mock';
import { TransactionEntityRepository } from '../transaction.entity.repository';
import { TransactionEntityService } from '../transaction.entity.service';

const helpers = require('../../../../utils/helpers');

describe('TransactionEntityService', () => {
  let service: TransactionEntityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionEntityService, { provide: TransactionEntityRepository, useValue: mockTransactionEntityRepository }],
    }).compile();

    service = module.get<TransactionEntityService>(TransactionEntityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ===========================================================================
  // Create
  // ===========================================================================
  describe('buildTransaction', () => {
    it(`should call getRepository's create function with right params`, () => {
      const transactionModel = mockTransactionModels[0];

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionUuid);

      service.buildTransaction(transactionModel);

      expect(mockTransactionEntityRepository.getRepository().create).toBeCalledWith({ uuid: mockTransactionUuid, ...transactionModel });
    });
  });

  describe('insertTransactions', () => {
    it(`should call getRepository's insert function with right params`, async () => {
      const expectedTransactions = mockTransactionModels.map((model, index) =>
        createMockTransaction({ uuid: `mockTransaction-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionUuid2);
      const buildTransactionSpy = jest.spyOn(service, 'buildTransaction');

      await service.insertTransactions(mockTransactionModels);

      mockTransactionModels.forEach((model) => expect(buildTransactionSpy).toBeCalledWith(model));
      expect(mockTransactionEntityRepository.getRepository().insert).toBeCalledWith(expectedTransactions);
    });
  });

  describe('saveTransactions', () => {
    it(`should call getRepository's save function with right params`, async () => {
      const expectedTransactions = mockTransactionModels.map((model, index) =>
        createMockTransaction({ uuid: `mockTransaction-uuid-${index + 1}`, ...model }),
      );

      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionUuid);
      jest.spyOn(helpers, 'generateEntityUUID').mockReturnValueOnce(mockTransactionUuid2);
      const buildTransactionSpy = jest.spyOn(service, 'buildTransaction');

      await service.saveTransactions(mockTransactionModels);

      mockTransactionModels.forEach((model) => expect(buildTransactionSpy).toBeCalledWith(model));
      expect(mockTransactionEntityRepository.getRepository().save).toBeCalledWith(expectedTransactions);
    });
  });

  describe('saveTransaction', () => {
    it(`should call saveTransactions function with a model in array`, async () => {
      const transactionModel = mockTransactionModels[0];

      const saveTransactionsSpy = jest.spyOn(service, 'saveTransactions');

      await service.saveTransaction(transactionModel);

      expect(saveTransactionsSpy).toBeCalledWith([transactionModel], undefined);
    });
  });

  // ===========================================================================
  // Read
  // ===========================================================================
  describe('retrieveTransactionByUuid', () => {
    it('should return transaction when found', async () => {
      mockTransactionEntityRepository.getRepository().findOne.mockResolvedValueOnce(mockTransaction);

      expect(await service.retrieveTransactionByUuid(mockTransactionUuid)).toEqual(mockTransaction);
      expect(mockTransactionEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockTransactionUuid } });
    });

    it('should throw EntityNotFoundException when transaction is not found', async () => {
      mockTransactionEntityRepository.getRepository().findOne.mockResolvedValueOnce(null);

      await expect(service.retrieveTransactionByUuid(mockTransactionUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', mockTransactionUuid),
      );
      expect(mockTransactionEntityRepository.getRepository().findOne).toBeCalledWith({ where: { uuid: mockTransactionUuid } });
    });
  });

  describe('retrieveTransactionWithApplicationDetailsByUuid', () => {
    it('should return transaction when found', async () => {
      mockTransactionEntityRepository.findTransactionWithApplicationAndEServiceAndAgencyByUuid.mockResolvedValueOnce(mockTransaction);

      expect(await service.retrieveTransactionWithApplicationDetailsByUuid(mockTransactionUuid)).toEqual(mockTransaction);
      expect(mockTransactionEntityRepository.findTransactionWithApplicationAndEServiceAndAgencyByUuid).toBeCalledWith(
        mockTransactionUuid,
        undefined,
      );
    });

    it('should throw EntityNotFoundException when transaction is not found', async () => {
      mockTransactionEntityRepository.findTransactionWithApplicationAndEServiceAndAgencyByUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveTransactionWithApplicationDetailsByUuid(mockTransactionUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', mockTransactionUuid),
      );
      expect(mockTransactionEntityRepository.findTransactionWithApplicationAndEServiceAndAgencyByUuid).toBeCalledWith(
        mockTransactionUuid,
        undefined,
      );
    });
  });

  describe('retrieveTransactionByFileAssetUuid', () => {
    const fileAssetUuid = 'mockFileAsset-uuid-1';

    it('should return transaction when found', async () => {
      mockTransactionEntityRepository.findTransactionByFileAssetUuid.mockResolvedValueOnce(mockTransaction);

      expect(await service.retrieveTransactionByFileAssetUuid(fileAssetUuid)).toEqual(mockTransaction);
      expect(mockTransactionEntityRepository.findTransactionByFileAssetUuid).toBeCalledWith(fileAssetUuid, undefined);
    });

    it('should throw EntityNotFoundException when transaction is not found', async () => {
      mockTransactionEntityRepository.findTransactionByFileAssetUuid.mockResolvedValueOnce(null);

      await expect(service.retrieveTransactionByFileAssetUuid(fileAssetUuid)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'fileAssetUuid', fileAssetUuid),
      );
      expect(mockTransactionEntityRepository.findTransactionByFileAssetUuid).toBeCalledWith(fileAssetUuid, undefined);
    });
  });

  describe('retrieveTransactionWithStatusInfoByUuidAndUserId', () => {
    const userId = 1;

    it('should return transaction when found', async () => {
      mockTransactionEntityRepository.findPartialTransactionWithStatusInfoByUuidAndUserId.mockResolvedValue(mockedDataForTransactionStatus);

      expect(await service.retrievePartialTransactionWithStatusInfoByUuidAndUserId(mockTransactionUuid, userId)).toEqual(
        resultantDataForTransactionStatus,
      );
      expect(mockTransactionEntityRepository.findPartialTransactionWithStatusInfoByUuidAndUserId).toBeCalledWith(
        mockTransactionUuid,
        userId,
        undefined,
      );
    });

    it('should throw EntityNotFoundException when transaction is not found', async () => {
      mockTransactionEntityRepository.findPartialTransactionWithStatusInfoByUuidAndUserId.mockRejectedValue(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', `${mockTransactionUuid}`),
      );

      await expect(service.retrievePartialTransactionWithStatusInfoByUuidAndUserId(mockTransactionUuid, userId)).rejects.toThrow(
        new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', `${mockTransactionUuid}`),
      );
      expect(mockTransactionEntityRepository.findPartialTransactionWithStatusInfoByUuidAndUserId).toBeCalledWith(
        mockTransactionUuid,
        userId,
        undefined,
      );
    });
  });

  describe('retrieveTransactionWithActivitiesAndOwnersByUuidAndActivityType', () => {
    it('should return transaction when found', async () => {
      mockTransactionEntityRepository.findTransactionWithActivitiesAndOwnersByUuidAndActivityType.mockResolvedValueOnce(mockTransaction);

      expect(
        await service.retrieveTransactionWithActivitiesAndOwnersByUuidAndActivityType(mockTransactionUuid, ACTIVITY_TYPE.RECEIVE_TRANSFER),
      ).toEqual(mockTransaction);
      expect(mockTransactionEntityRepository.findTransactionWithActivitiesAndOwnersByUuidAndActivityType).toBeCalledWith(
        mockTransactionUuid,
        ACTIVITY_TYPE.RECEIVE_TRANSFER,
        undefined,
      );
    });

    it('should throw EntityNotFoundException when transaction is not found', async () => {
      mockTransactionEntityRepository.findTransactionWithActivitiesAndOwnersByUuidAndActivityType.mockResolvedValueOnce(null);

      await expect(
        service.retrieveTransactionWithActivitiesAndOwnersByUuidAndActivityType(mockTransactionUuid, ACTIVITY_TYPE.RECEIVE_TRANSFER),
      ).rejects.toThrow(new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Transaction', 'uuid', mockTransactionUuid));

      expect(mockTransactionEntityRepository.findTransactionWithActivitiesAndOwnersByUuidAndActivityType).toBeCalledWith(
        mockTransactionUuid,
        ACTIVITY_TYPE.RECEIVE_TRANSFER,
        undefined,
      );
    });
  });

  describe('retrieveTransactionsByFileAssetUuids', () => {
    it('should return fileAssets when found', async () => {
      const mockFileAssetUuids = ['mockFileAsset-uuid-1', 'mockFileAsset-uuid-2'];
      mockTransactionEntityRepository.findTransactionsByFileAssetUuids.mockResolvedValueOnce(mockTransactions);

      expect(await service.retrieveTransactionsByFileAssetUuids(mockFileAssetUuids)).toEqual(mockTransactions);
      expect(mockTransactionEntityRepository.findTransactionsByFileAssetUuids).toBeCalledWith(mockFileAssetUuids, undefined);
    });
  });

  // ===========================================================================
  // Update
  // // ===========================================================================
  describe('updateTransaction', () => {
    it(`should call getRepository's update function with right params`, async () => {
      const transactionUuid = 'mockTransaction-uuid-1';
      const dataToBeUpdated: TransactionUpdateModel = { status: TRANSACTION_STATUS.COMPLETED };

      await service.updateTransaction(transactionUuid, dataToBeUpdated);

      expect(mockTransactionEntityRepository.updateTransaction).toBeCalledWith(transactionUuid, dataToBeUpdated, undefined);
    });
  });

  describe('updateTransactionStatus', () => {
    it(`should call updateTransaction function with right params`, async () => {
      const transactionUuid = 'mockTransaction-uuid-1';
      const status = TRANSACTION_STATUS.COMPLETED;

      const updateTransactionSpy = jest.spyOn(service, 'updateTransaction');
      await service.updateTransactionStatus(transactionUuid, status);

      expect(updateTransactionSpy).toBeCalledWith(transactionUuid, { status }, undefined);
    });
  });
});
