import {
  EntityNotFoundException,
  ServiceMethodDontThrowOptions,
  ServiceMethodOptions,
  ServiceMethodThrowOptions,
} from '@filesg/backend-common';
import { ACTIVITY_TYPE, COMPONENT_ERROR_CODE, DateRange, PaginationOptions, TRANSACTION_STATUS } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager, UpdateResult } from 'typeorm';

import { Transaction, TransactionCreationModel, TransactionUpdateModel } from '../../../entities/transaction';
import { generateEntityUUID } from '../../../utils/helpers';
import { TransactionEntityRepository } from './transaction.entity.repository';

@Injectable()
export class TransactionEntityService {
  private readonly logger = new Logger(TransactionEntityService.name);

  constructor(private readonly transactionEntityRepository: TransactionEntityRepository) {}

  // ===========================================================================
  // Create
  // ===========================================================================
  public buildTransaction(transactionModel: TransactionCreationModel) {
    return this.transactionEntityRepository.getRepository().create({
      uuid: generateEntityUUID(Transaction.name),
      ...transactionModel,
    });
  }

  public async insertTransactions(transactionModels: TransactionCreationModel[], entityManager?: EntityManager) {
    const transactions = transactionModels.map((model) => this.buildTransaction(model));
    return await this.transactionEntityRepository.getRepository(entityManager).insert(transactions);
  }

  public async saveTransactions(transactionModels: TransactionCreationModel[], entityManager?: EntityManager) {
    const transactions = transactionModels.map((model) => this.buildTransaction(model));
    return await this.transactionEntityRepository.getRepository(entityManager).save(transactions);
  }

  public async saveTransaction(transactionModel: TransactionCreationModel, entityManager?: EntityManager) {
    return (await this.saveTransactions([transactionModel], entityManager))[0];
  }

  // ===========================================================================
  // Read
  // ===========================================================================
  public async retrieveTransactionByUuid(uuid: string, entityManager?: EntityManager) {
    const transaction = await this.transactionEntityRepository.getRepository(entityManager).findOne({ where: { uuid } });

    if (!transaction) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', uuid);
    }

    return transaction;
  }

  public async retrieveTransactionWithApplicationDetailsByUuid(uuid: string, entityManager?: EntityManager) {
    const transaction = await this.transactionEntityRepository.findTransactionWithApplicationAndEServiceAndAgencyByUuid(
      uuid,
      entityManager,
    );

    if (!transaction) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', uuid);
    }

    return transaction;
  }

  public async retrieveTransactionByFileAssetUuid(fileAssetUuid: string, entityManager?: EntityManager) {
    const transaction = await this.transactionEntityRepository.findTransactionByFileAssetUuid(fileAssetUuid, entityManager);

    if (!transaction) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'fileAssetUuid', fileAssetUuid);
    }

    return transaction;
  }

  public async retrievePartialTransactionWithStatusInfoByUuidAndUserId(
    uuid: string,
    userId: number,
    entityManager?: EntityManager,
  ): Promise<Transaction> {
    const transaction = await this.transactionEntityRepository.findPartialTransactionWithStatusInfoByUuidAndUserId(
      uuid,
      userId,
      entityManager,
    );

    if (!transaction) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', `${uuid}`);
    }

    return transaction;
  }

  public async retrieveTransactionWithActivitiesAndOwnersByUuidAndActivityType(
    uuid: string,
    activityType: ACTIVITY_TYPE,
    entityManager?: EntityManager,
  ): Promise<Transaction> {
    const transaction = await this.transactionEntityRepository.findTransactionWithActivitiesAndOwnersByUuidAndActivityType(
      uuid,
      activityType,
      entityManager,
    );

    if (!transaction) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Transaction', 'uuid', uuid);
    }

    return transaction;
  }

  public async retrieveTransactionsByFileAssetUuids(fileAssetUuids: string[], entityManager?: EntityManager) {
    return await this.transactionEntityRepository.findTransactionsByFileAssetUuids(fileAssetUuids, entityManager);
  }

  public async retrieveTransactionsUsingEserviceIds(
    eserviceIds: number[],
    query: PaginationOptions & DateRange,
    entityManager?: EntityManager,
  ) {
    const { page, limit } = query;

    if (!page) {
      query.page = 1;
    }
    if (!limit) {
      query.limit = 20;
    }

    const [transactions, count] = await this.transactionEntityRepository.findTransactionsUsingEserviceIds(
      eserviceIds,
      query,
      entityManager,
    );

    const next = count - query.page! * query.limit! > 0 ? query.page! + 1 : null;

    return { transactions, count, next };
  }

  public async retrieveTransactionByUuidAndUserId(uuid: string, userId: number, opts?: ServiceMethodThrowOptions): Promise<Transaction>;
  public async retrieveTransactionByUuidAndUserId(
    uuid: string,
    userId: number,
    opts?: ServiceMethodDontThrowOptions,
  ): Promise<Transaction | null>;
  public async retrieveTransactionByUuidAndUserId(uuid: string, userId: number, opts: ServiceMethodOptions = { toThrow: false }) {
    const transaction = await this.transactionEntityRepository.findTransactionAndChildrenUsingUuidAndUserId(uuid, userId);

    if (!transaction && opts.toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', `${uuid}`);
    }

    return transaction;
  }

  // ===========================================================================
  // Update
  // ===========================================================================
  public async updateTransaction(id: number, dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransaction(uuid: string, dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransaction(identifier: string | number, dataToBeUpdate: TransactionUpdateModel, entityManager?: EntityManager) {
    return await this.transactionEntityRepository.updateTransaction(identifier, dataToBeUpdate, entityManager);
  }

  public async updateTransactions(ids: number[], dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransactions(uuids: string[], dataToBeUpdated: TransactionUpdateModel, entityManager?: EntityManager): Promise<UpdateResult> // prettier-ignore
  public async updateTransactions(identifiers: string[] | number[], dataToBeUpdate: TransactionUpdateModel, entityManager?: EntityManager) {
    return await this.transactionEntityRepository.updateTransactions(identifiers, dataToBeUpdate, entityManager);
  }

  public async updateTransactionStatus(uuid: string, status: TRANSACTION_STATUS, entityManager?: EntityManager) {
    return await this.updateTransaction(uuid, { status }, entityManager);
  }
}
