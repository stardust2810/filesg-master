import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_SESSION_TYPE,
  FILE_STATUS,
  FileAssetDeleteSessionDetails as FileAssetDeleteSessionDetails,
  FileDeleteSession,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { CustomAgencyMessage } from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Activity } from '../../../entities/activity';
import { Application } from '../../../entities/application';
import { FileAsset } from '../../../entities/file-asset';
import { Transaction } from '../../../entities/transaction';
import { generateFileSessionUUID } from '../../../utils/helpers';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';
import { SqsService } from '../aws/sqs.service';

type IssuanceTransactionId = number;
export type OwnerId = number;
type ActivityId = number;

export interface GroupedDeleteFileAssetsTransaction {
  application: Application;
  issuanceTransaction: Transaction;
  receiveTransferActivitiesMap: Record<ActivityId, Activity>;
  issuerFileAssets: FileAsset[];
  recipientFileAssets: FileAsset[];
  recipientFileAssetsMap: Record<OwnerId, FileAsset[]>;
}

export interface FileAssetDeleteDetails {
  transactionId: number;
  transactionType: TRANSACTION_TYPE;
  activityId: number;
  activityType: ACTIVITY_TYPE;
  fileAssets: FileAsset[];
}

@Injectable()
export class DeletionService {
  private readonly logger = new Logger(DeletionService.name);

  constructor(
    private readonly sqsService: SqsService,
    private readonly redisService: RedisService,
    private readonly databaseTransactionService: DatabaseTransactionService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
  ) {}

  // ===========================================================================
  // Main methods
  // ===========================================================================
  // NOTE: File deletion will trigger revocation. To remove if file deletion no longer revokes OA
  public async agencyDeleteFileAssets(fileAssets: FileAsset[]) {
    let deleteActivityDetails: FileAssetDeleteDetails[];
    const groupedDeleteFileAssetsTransactions = this.groupDeleteFileAssetsByTransactionId(fileAssets);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      deleteActivityDetails = (
        await Promise.all(
          Object.values(groupedDeleteFileAssetsTransactions).map((groupedDeleteFileAssetsTransaction) =>
            this.createDeleteEntities(groupedDeleteFileAssetsTransaction, entityManager),
          ),
        )
      ).flat();

      this.logger.debug(`[agencyDeleteFileAssets] Creating file session`);

      await this.createFileSessionAndSendDeleteMsg(deleteActivityDetails);

      this.logger.log(
        {
          processedFileAssets: fileAssets.map(({ uuid, ownerId, deleteAt, oaCertificateId }) => ({
            fileAssetUuid: uuid,
            ownerId: ownerId,
            fileAssetDeleteAt: deleteAt,
            fileAssetOaCertId: oaCertificateId,
          })),
          processedFileAssetsLength: fileAssets.length,
        },
        'agency-delete-docs cronJob processed successfully',
      );

      await txn.commit();
    } catch (err) {
      await txn.rollback();
      this.logger.error(`[agencyDeleteFileAssets] ${JSON.stringify(err)}`);
      throw err;
    }
  }

  public async createFileSessionAndSendDeleteMsg(fileAssetDeleteDetails: FileAssetDeleteDetails[]) {
    // Create file session in redis
    const fileSessionUuid = generateFileSessionUUID();

    const fileDeleteSession: FileDeleteSession = {
      type: FILE_SESSION_TYPE.DELETE,
      fileAssetDeleteSessionDetails: fileAssetDeleteDetails.map(
        ({ transactionId, transactionType, activityId, activityType, fileAssets }): FileAssetDeleteSessionDetails => ({
          transactionId,
          transactionType,
          activityId,
          activityType,
          issuerId: fileAssets[0].issuerId,
          owner: {
            ownerId: fileAssets[0].ownerId,
            ownerUuid: fileAssets[0].owner!.uuid,
          },
          files: fileAssets.map(({ id, uuid, oaCertificateId }) => ({
            fileAssetId: id,
            fileAssetUuid: uuid,
            oaCertId: oaCertificateId,
          })),
        }),
      ),
    };

    await this.redisService.set(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionUuid, JSON.stringify(fileDeleteSession));

    // Send transferEvents message
    await this.sqsService.sendMessageToQueueTransferEvents({ fileSessionId: fileSessionUuid });
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================
  protected groupDeleteFileAssetsByTransactionId(
    fileAssets: FileAsset[],
  ): Record<IssuanceTransactionId, GroupedDeleteFileAssetsTransaction> {
    return fileAssets.reduce<Record<IssuanceTransactionId, GroupedDeleteFileAssetsTransaction>>((acc, fileAsset) => {
      const { activities, ownerId, issuerId } = fileAsset;

      const issuanceTransaction = activities![0].transaction!;
      const issuanceTransactionId = issuanceTransaction.id;
      const application = issuanceTransaction!.application!;
      const isIssuerCopy = ownerId === issuerId;

      if (!acc[issuanceTransactionId]) {
        acc[issuanceTransactionId] = {
          application,
          issuanceTransaction,
          receiveTransferActivitiesMap: {},
          issuerFileAssets: [],
          recipientFileAssets: [],
          recipientFileAssetsMap: {},
        };
      }

      // =======================================================================
      // Issuer fileAssets
      // =======================================================================
      // Push to issuerFileAssets array
      if (isIssuerCopy) {
        acc[issuanceTransactionId].issuerFileAssets.push(fileAsset);

        return acc;
      }

      // =======================================================================
      // Recipient fileAssets
      // =======================================================================
      // Push to recipientFileAssets array
      acc[issuanceTransactionId].recipientFileAssets.push(fileAsset);

      const receiveTransferActivity = activities!.find((activity) => activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER)!; //recipient fileAssets should have receiveTransfer activity
      const receiveTransferActivityId = receiveTransferActivity.id;

      // If receiveTransferActivity not in map, create entry
      if (!acc[issuanceTransactionId].receiveTransferActivitiesMap[receiveTransferActivityId]) {
        acc[issuanceTransactionId].receiveTransferActivitiesMap[receiveTransferActivityId] = receiveTransferActivity;
      }

      // Create recipient-fileAssets map
      if (acc[issuanceTransactionId].recipientFileAssetsMap[ownerId]) {
        acc[issuanceTransactionId].recipientFileAssetsMap[ownerId].push(fileAsset);
      } else {
        acc[issuanceTransactionId].recipientFileAssetsMap[ownerId] = [fileAsset];
      }

      return acc;
    }, {});
  }

  protected async createDeleteEntities(
    groupedDeleteFileAssetApplication: GroupedDeleteFileAssetsTransaction,
    entityManager: EntityManager,
  ): Promise<FileAssetDeleteDetails[]> {
    const {
      application,
      issuanceTransaction,
      receiveTransferActivitiesMap,
      issuerFileAssets,
      recipientFileAssetsMap,
      recipientFileAssets,
    } = groupedDeleteFileAssetApplication;

    const deleteTransaction = await this.createDeleteTransaction(application, issuanceTransaction, entityManager);
    const deleteTransactionId = deleteTransaction.id;

    const receiveTransferActivities = Object.values(receiveTransferActivitiesMap);
    const deleteActivities = await this.createDeleteActivities(
      deleteTransactionId,
      issuanceTransaction,
      receiveTransferActivities,
      entityManager,
    );

    await this.updateFileAssetStatusToPendingDelete(
      [...issuerFileAssets, ...recipientFileAssets].map((fileAsset) => fileAsset.uuid),
      entityManager,
    );

    return this.transformDeleteActivityDetails(deleteTransaction, issuerFileAssets, deleteActivities, recipientFileAssetsMap);
  }

  protected async createDeleteTransaction(application: Application, issuanceTransaction: Transaction, entityManager: EntityManager) {
    const { applicationType } = application;
    // Create delete transaction
    return await this.transactionEntityService.saveTransaction(
      {
        name: this.getDeleteTransactionNameByApplicationType(applicationType!.name, applicationType!.code),
        status: TRANSACTION_STATUS.INIT,
        type: TRANSACTION_TYPE.DELETE,
        creationMethod: TRANSACTION_CREATION_METHOD.SYSTEM,
        customAgencyMessage: this.getDeleteCustomAgencyMsgByApplicationType(applicationType!.name, applicationType!.code),
        userId: issuanceTransaction.userId,
        applicationId: application.id,
        parentId: issuanceTransaction.id,
      },
      entityManager,
    );
  }

  protected async createDeleteActivities(
    deleteTransactionId: number,
    issuanceTransaction: Transaction,
    receiveTransferActivities: Activity[],
    entityManager: EntityManager,
  ): Promise<Activity[]> {
    const triggerDeleteActivity = await this.activityEntityService.saveActivity(
      {
        status: ACTIVITY_STATUS.COMPLETED,
        type: ACTIVITY_TYPE.TRIGGER_DELETE,
        transactionId: deleteTransactionId,
        userId: issuanceTransaction.userId,
      },
      entityManager,
    );

    const receiveDeleteActivities = await this.activityEntityService.saveActivities(
      receiveTransferActivities.map((activity) => ({
        status: ACTIVITY_STATUS.INIT,
        type: ACTIVITY_TYPE.RECEIVE_DELETE,
        transactionId: deleteTransactionId,
        userId: activity.userId,
        parentId: triggerDeleteActivity.id,
        recipientInfo: activity.recipientInfo,
        isNonSingpassRetrievable: activity.isNonSingpassRetrievable,
      })),
      entityManager,
    );

    return [triggerDeleteActivity, ...receiveDeleteActivities];
  }

  protected async updateFileAssetStatusToPendingDelete(fileAssetUuids: string[], entityManager: EntityManager) {
    return await this.fileAssetEntityService.updateFileAssets(fileAssetUuids, { status: FILE_STATUS.PENDING_DELETE }, entityManager);
  }

  protected transformDeleteActivityDetails(
    transaction: Transaction,
    issuerFileAssets: FileAsset[],
    deleteActivities: Activity[],
    recipientFileAssetsMap: Record<OwnerId, FileAsset[]>,
  ): FileAssetDeleteDetails[] {
    const allTransactionsDeleteActivityDetails: FileAssetDeleteDetails[] = [];
    const [triggerDeleteActivity, ...receiveDeleteActivity] = deleteActivities;
    // Issuer fileAssets
    allTransactionsDeleteActivityDetails.push({
      transactionId: transaction.id,
      transactionType: transaction.type,
      activityId: triggerDeleteActivity.id,
      activityType: triggerDeleteActivity.type,
      fileAssets: issuerFileAssets,
    });

    // Recipient fileAssets
    const recipientDeleteActivityDetails = receiveDeleteActivity.map<FileAssetDeleteDetails>(({ id, userId, type }) => {
      const fileAssets = recipientFileAssetsMap[userId];

      return {
        transactionId: transaction.id,
        transactionType: transaction.type,
        activityId: id,
        activityType: type,
        fileAssets,
      };
    });

    allTransactionsDeleteActivityDetails.push(...recipientDeleteActivityDetails);

    return allTransactionsDeleteActivityDetails;
  }

  // TODO: Default ELD REs message. To enchance with custom message
  private getDeleteCustomAgencyMsgByApplicationType(applicationTypeName: string, applicationTypeCode: string): CustomAgencyMessage | null {
    const deletionMsgMap: Record<string, string[]> = {
      REs: [
        `The period to download the refreshed RE files has expired, and these files have been deleted from FileSG.`,
        `If you have any enquiry, please contact candidates@eld.gov.sg.`,
      ],
      default: [
        `The validity period to access the ${applicationTypeName} (${applicationTypeCode}) files has expired, and these files have been deleted from FileSG.`,
      ],
    };

    return {
      transaction: deletionMsgMap[applicationTypeCode] || deletionMsgMap['default'],
      email: deletionMsgMap[applicationTypeCode] || deletionMsgMap['default'],
    };
  }

  // TODO: Default transaction name. To enchance with custom settings based on applicationType (TBD)
  private getDeleteTransactionNameByApplicationType(applicationTypeName: string, applicationTypeCode: string): string {
    const deletionMsgMap: Record<string, string> = {
      REs: `Deletion of refreshed Register of Electors (RE) files`,
      default: `Deletion of the ${applicationTypeName} (${applicationTypeCode}) files`,
    };

    return deletionMsgMap[applicationTypeCode] || deletionMsgMap['default'];
  }
}
