import { InputValidationException, LogMethod } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  EXCEPTION_ERROR_CODE,
  FILE_STATUS,
  RECALLABLE_TRANSACTION_TYPES,
  RecallTransactionRequest,
  RecallTransactionResponse,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  VIEWABLE_FILE_STATUSES,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Activity } from '../../../entities/activity';
import { EserviceWhitelistedUser } from '../../../entities/eservice-whitelisted-user';
import { FileAsset } from '../../../entities/file-asset';
import { Transaction } from '../../../entities/transaction';
import { ActivityRecipientInfo, RecallTransactionSuccessEmailActivityInfo } from '../../../typings/common';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';
import { DeletionService, FileAssetDeleteDetails } from '../deletion/deletion.service';
import { EmailService } from '../notification/email.service';

export interface UserActivityInfo {
  recipientInfo: ActivityRecipientInfo | null;
  fileAssetMap: Map<number, FileAsset>;
}

export interface RecallTransactionCSVReport {
  'Application Type': string;
  'Agency Reference Id': string;
  'Transaction Uuid': string;
  'Recipient Activity Uuid': string;
  'Recipient Masked Uin': string;
  'Recipient Name': string;
  'Recipient Email': string;
  'Recipient Contact': string;
  'Agency File Asset Name': string;
  'Recall Status': string;
  'Failure Reason'?: string;
}

@Injectable()
export class RecallTransactionService {
  private readonly logger = new Logger(RecallTransactionService.name);

  constructor(
    private readonly databaseTransactionService: DatabaseTransactionService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly deletionService: DeletionService,
    private readonly emailService: EmailService,
  ) {}

  @LogMethod()
  public async recallTransaction(
    transactionUuid: string,
    eserviceUserId: number,
    { creationMethod }: RecallTransactionRequest,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
  ): Promise<RecallTransactionResponse> {
    // check if the transaction belongs to eserviceUser
    const parentTransaction = await this.transactionEntityService.retrieveTransactionByUuidAndUserId(transactionUuid, eserviceUserId);

    if (
      !parentTransaction ||
      !RECALLABLE_TRANSACTION_TYPES.includes(parentTransaction.type) ||
      parentTransaction.status !== TRANSACTION_STATUS.COMPLETED
    ) {
      const internalErrorMsg = parentTransaction
        ? `EserverUser:${eserviceUserId} tried to recall transaction:${transactionUuid} of type: ${parentTransaction.type} and status:${[
            parentTransaction.status,
          ]}`
        : `No transaction found for UUID: ${transactionUuid}`;

      throw new InputValidationException(
        COMPONENT_ERROR_CODE.RECALL_SERVICE,
        `Recallable transactions must be of types: ${RECALLABLE_TRANSACTION_TYPES.toString()} and in a completed status.`,
        internalErrorMsg,
        EXCEPTION_ERROR_CODE.TRANSACTION_IS_INVALID,
      );
    }

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      const usersFileAssets = this.getUserActivityAndValidFileAssets(parentTransaction);

      // create recall - transaction
      const recallTransaction = await this.createRecallTransaction(
        parentTransaction,
        eserviceUserId,
        creationMethod,
        entityManager,
        eserviceWhitelistedUser,
      );
      // create recall - activites (SEND_RECALL, RECEIVE_RECALL)
      const fileAssetDeleteDetails = await this.createRecallActivities(recallTransaction, usersFileAssets, eserviceUserId, entityManager);
      // update parent transaction and child transaction status to be recalled and its activities status to be recalled
      await this.updateTransactionsAndActivitiesStatus(parentTransaction, entityManager);
      // update the fileasset asset status to PENING_DELETE
      const fileAssetsMarkedForDelete = await this.updateFileAssetStatus(usersFileAssets, entityManager);
      // call deletion service only if there are files to delete.
      if (fileAssetsMarkedForDelete.length > 0) {
        // call deletion service to create file session and send mgs to queue to transfer
        await this.deletionService.createFileSessionAndSendDeleteMsg(fileAssetDeleteDetails);
      } else {
        this.logger.log('Updated status for transaction and acitivties. There are no files to be deleted');
        await this.recallTransactionSuccessEmailToAgency(
          fileAssetDeleteDetails.map(({ activityId, activityType }) => ({ activityId, activityType })),
        );
      }
      await txn.commit();
      // return the transaction uuid as receipt.
      return {
        transactionUuid: recallTransaction.uuid,
      };
    } catch (error) {
      await txn.rollback();
      throw error;
    }
  }

  protected getUserActivityAndValidFileAssets({ activities }: Transaction) {
    const usersFileAssets: Map<number, UserActivityInfo> = new Map<number, UserActivityInfo>();
    activities?.forEach(({ recipientInfo, fileAssets }) => {
      fileAssets?.forEach((fileAsset) => {
        if (!usersFileAssets.has(fileAsset.ownerId)) {
          usersFileAssets.set(fileAsset.ownerId, { recipientInfo, fileAssetMap: new Map<number, FileAsset>() });
        }
        if (VIEWABLE_FILE_STATUSES.includes(fileAsset.status as any)) {
          usersFileAssets.get(fileAsset.ownerId)!.fileAssetMap.set(fileAsset.id, fileAsset);
        }
      });
    });

    return usersFileAssets;
  }

  protected async createRecallTransaction(
    parentTransaction: Transaction,
    eserviceUserId: number,
    creationMethod: TRANSACTION_CREATION_METHOD = TRANSACTION_CREATION_METHOD.API,
    entityManager: EntityManager,
    eserviceWhitelistedUser?: EserviceWhitelistedUser,
  ) {
    return await this.transactionEntityService.saveTransaction(
      {
        type: TRANSACTION_TYPE.RECALL,
        status: TRANSACTION_STATUS.INIT,
        name: `Recall transaction: ${parentTransaction.uuid}`,
        userId: eserviceUserId,
        applicationId: parentTransaction.applicationId,
        parentId: parentTransaction.id,
        creationMethod,
        eserviceWhitelistedUser,
      },
      entityManager,
    );
  }

  protected async createRecallActivities(
    { id: transactionId, type: transactionType }: Transaction,
    usersFileAssets: Map<number, UserActivityInfo>,
    eserviceUserId: number,
    entityManager: EntityManager,
  ) {
    const deleteActivityDetails: FileAssetDeleteDetails[] = [];
    const sendRecallActivity = await this.activityEntityService.saveActivity(
      {
        status: ACTIVITY_STATUS.INIT,
        type: ACTIVITY_TYPE.SEND_RECALL,
        userId: eserviceUserId,
        transactionId,
      },
      entityManager,
    );

    deleteActivityDetails.push({
      activityId: sendRecallActivity.id,
      activityType: sendRecallActivity.type,
      fileAssets: Array.from(usersFileAssets.get(eserviceUserId)!.fileAssetMap.values()),
      transactionId,
      transactionType,
    });

    const receiveRecallActivitiesPromises: Promise<Activity>[] = [];
    usersFileAssets.forEach(({ recipientInfo }, userId) => {
      if (userId !== eserviceUserId) {
        const receiveRecallActivity = this.activityEntityService.saveActivity(
          {
            status: ACTIVITY_STATUS.INIT,
            type: ACTIVITY_TYPE.RECEIVE_RECALL,
            parentId: sendRecallActivity.id,
            recipientInfo,
            transactionId,
            userId,
          },
          entityManager,
        );
        receiveRecallActivitiesPromises.push(receiveRecallActivity);
      }
    });

    const receiveRecallActivities = await Promise.all(receiveRecallActivitiesPromises);
    receiveRecallActivities.forEach(({ id: activityId, type: activityType, userId }) => {
      deleteActivityDetails.push({
        transactionId,
        transactionType,
        activityId,
        activityType,
        fileAssets: Array.from(usersFileAssets.get(userId)!.fileAssetMap.values()),
      });
    });
    return deleteActivityDetails;
  }

  protected async updateFileAssetStatus(usersFileAssets: Map<number, UserActivityInfo>, entityManager: EntityManager) {
    const fileAssetUuidsToBeUpdated: string[] = [];
    usersFileAssets.forEach((userActivityInfo) => {
      const uuids = Array.from(userActivityInfo.fileAssetMap.values()).map((fileAsset) => fileAsset.uuid);
      fileAssetUuidsToBeUpdated.push(...uuids);
    });

    if (fileAssetUuidsToBeUpdated.length > 0) {
      await this.fileAssetEntityService.updateFileAssets(fileAssetUuidsToBeUpdated, { status: FILE_STATUS.PENDING_DELETE }, entityManager);
    }

    return fileAssetUuidsToBeUpdated;
  }

  protected async updateTransactionsAndActivitiesStatus(parentTransaction: Transaction, entityManager: EntityManager) {
    const transactionsToBeUpdated: number[] = [parentTransaction.id];
    const activitiesToBeUpdated: number[] = [...parentTransaction.activities!.map((activity) => activity.id)];

    parentTransaction.children?.forEach((childTxn) => {
      transactionsToBeUpdated.push(childTxn.id);
      activitiesToBeUpdated.push(...childTxn.activities!.map((activity) => activity.id));
    });

    await this.transactionEntityService.updateTransactions(transactionsToBeUpdated, { status: TRANSACTION_STATUS.RECALLED }, entityManager);
    await this.activityEntityService.updateActivities(activitiesToBeUpdated, { status: ACTIVITY_STATUS.RECALLED }, entityManager);
  }

  public async recallTransactionSuccessEmailToAgency(
    recallTransactionSuccessEmailActivityInfos: RecallTransactionSuccessEmailActivityInfo[],
  ) {
    const recalledFileAgencyActivityIds = recallTransactionSuccessEmailActivityInfos
      .filter((activity) => activity.activityType === ACTIVITY_TYPE.SEND_RECALL)
      .map((activity) => activity.activityId);

    if (recalledFileAgencyActivityIds.length > 0) {
      const [sendRecallActivity] = await this.activityEntityService.retrieveActivitiesDetailsRequiredForEmail(
        recalledFileAgencyActivityIds,
        ACTIVITY_TYPE.SEND_RECALL,
      );
      await this.emailService.sendRecallSucessEmailToAgency(sendRecallActivity);
    }
  }
}
