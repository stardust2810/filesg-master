import { EntityNotFoundException } from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { Condition } from 'dynamoose/dist/Condition';
import { InjectModel, Item, Model, ModelBatchGetItemsResponse, QueryResponse, UnprocessedItems, UpdatePartial } from 'nestjs-dynamoose';

import {
  FORMSG_TRANSACTION,
  FormSgTransaction,
  FormSgTransactionCreationModel,
  FormSgTransactionKey,
  FormSgTransactionUpdateModel,
} from '../../../entities/formsg-transaction';

@Injectable()
export class FormSgTransactionEntityService {
  private readonly logger = new Logger(FormSgTransactionEntityService.name);

  constructor(@InjectModel(FORMSG_TRANSACTION) private readonly formSgTransactionModel: Model<FormSgTransaction, FormSgTransactionKey>) {}

  // All the base methods from dynamoose require both PK and SK to be provided if the table is created of both.
  // For custom query such as only want to query by PK, will need to use query method.

  // ===========================================================================
  // Create
  // ===========================================================================

  /**
   * Identical to calling item.save, but with one key difference, this function will default to setting overwrite to false.
   */
  public async createFormSgTransaction(model: FormSgTransactionCreationModel): Promise<Item<FormSgTransaction>> {
    return await this.formSgTransactionModel.create(model);
  }

  /**
   * Batch create new or overwrite existing data (when keys match existing data) - like batchUpdate
   * Can only transmit up to 16MB of data over the network, and support only 25 items per operation
   */
  public async batchPutFormSgTransactions(models: FormSgTransactionCreationModel[]) {
    return await this.formSgTransactionModel.batchPut(models);
  }

  // ===========================================================================
  // Read
  // ===========================================================================

  public async findFormSgTransaction(key: FormSgTransactionKey, toThrow?: boolean): Promise<Item<FormSgTransaction>> {
    const transaction = await this.formSgTransactionModel.get(key);

    if (!transaction && toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'FormSg Transaction', 'id', key.id);
    }

    return transaction;
  }

  /**
   * Maximum number of items you can request in a single batchGet operation is 100 items, and the total request size cannot exceed 16 MB.
   * To retrieve more than 100 items using batchGet, you can split your request into multiple smaller batches, each containing up to 100 items,
   * and send them in separate batchGet requests
   */
  public async findFormSgTransactions(keys: FormSgTransactionKey[]): Promise<ModelBatchGetItemsResponse<Item<FormSgTransaction>>> {
    return await this.formSgTransactionModel.batchGet(keys);
  }

  public async findFormSgTransactionsByTransactionUuid(uuid: string, toThrow?: boolean): Promise<QueryResponse<Item<FormSgTransaction>>> {
    const transaction = await this.formSgTransactionModel.query('transactionUuid').eq(uuid).attributes(['id', 'transaction']).exec();

    if (transaction.length === 0 && toThrow) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, 'FormSg Transaction', 'uuid', uuid);
    }

    return transaction;
  }

  public async findFormSgBatchTransactionsByBatchId(batchId: string) {
    return await this.formSgTransactionModel.query('batchId').eq(batchId).exec();
  }

  // ===========================================================================
  // Update
  // ===========================================================================

  /**
   * When table contains both PK and SK, must provide both when updating.
   * When existing data doesnt exist, it creates a new one.
   * Else, it updates the the existing data.
   *
   * PK and SK are immutable once created, to "update" it, one have to delete the existing data and create a new one.
   */
  public async updateFormSgTransaction(
    key: FormSgTransactionKey,
    model: FormSgTransactionUpdateModel | UpdatePartial<FormSgTransaction>,
    condition?: Condition,
  ): Promise<Item<FormSgTransaction>> {
    return await this.formSgTransactionModel.update(key, model, { condition, return: 'item' });
  }

  public async updateFormSgTransactionByTransactionUuid(
    uuid: string,
    model: FormSgTransactionUpdateModel | UpdatePartial<FormSgTransaction>,
    condition?: Condition,
  ): Promise<Item<FormSgTransaction>> {
    const result = await this.findFormSgTransactionsByTransactionUuid(uuid, true);
    return await this.formSgTransactionModel.update({ id: result[0]['id'] }, model, { condition, return: 'item' });
  }

  // ===========================================================================
  // Delete
  // ===========================================================================

  public async deleteFormSgTransaction(key: FormSgTransactionKey, condition?: Condition): Promise<void> {
    await this.formSgTransactionModel.delete(key, { condition, return: null });
  }

  /**
   * When list of keys passed, it will only delete those records that can be found.
   */
  public async deleteFormSgTransactions(keys: FormSgTransactionKey[]): Promise<UnprocessedItems<FormSgTransactionKey>> {
    return await this.formSgTransactionModel.batchDelete(keys);
  }
}
