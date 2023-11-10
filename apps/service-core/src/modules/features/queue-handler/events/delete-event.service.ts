import { DeleteFailureMessage, DeleteSuccessMessage, FilesToDeleteMessageInfo } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_ASSET_ACTION,
  FILE_FAIL_CATEGORY,
  FILE_STATUS,
  NOTIFICATION_TEMPLATE_TYPE,
  OA_CERTIFICATE_STATUS,
  REVOCATION_TYPE,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { FileAssetHistoryCreationModel } from '../../../../entities/file-asset-history';
import { ActivityFileInsert } from '../../../entities/activity/activity.entity.repository';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { FileAssetAccessEntityService } from '../../../entities/file-asset-access/file-asset-access.entity.service';
import { FileAssetHistoryEntityService } from '../../../entities/file-asset-history/file-asset-history.entity.service';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { NotificationService } from '../../notification/notification.service';
import { RecallTransactionService } from '../../transaction/recall-transaction.service';

type ActivityId = number;
type FileAssetId = number;
type IssuerId = number;

interface ActivityFile {
  activityId: number;
  fileAssetId: number;
}

interface UpdateDeletedFiles {
  transactionIds: Set<number>;
  activityFiles: ActivityFile[];
  activityIds: ActivityId[];
  fileAssetIds: FileAssetId[];
  toCreateFileAssetHistories: FileAssetHistoryCreationModel[];
  oaCertIdsToExpire: Record<IssuerId, Set<string>>;
  activityWithOaIds: ActivityId[];
}

@Injectable()
export class DeleteEventService {
  private logger = new Logger(DeleteEventService.name);

  constructor(
    private readonly databaseTransactionService: DatabaseTransactionService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly fileAssetHistoryEntityService: FileAssetHistoryEntityService,
    private readonly oaCertificateEntityService: OaCertificateEntityService,
    private readonly notificationService: NotificationService,
    private readonly redisService: RedisService,
    private readonly fileAssetAccessService: FileAssetAccessEntityService,
    private readonly recallTransactionService: RecallTransactionService,
  ) {}

  // NOTE: File deletion will trigger revocation. To remove if file deletion no longer revokes OA
  public async fileDeleteSuccessHandler(messageBody: DeleteSuccessMessage) {
    const { filesToDeleteMessageInfo, fileSessionId } = messageBody.payload;
    await this.updateDeletedFileAssetActivities(filesToDeleteMessageInfo);
    await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId);
  }

  // On delete failure, update all entities, but add failReason to files
  public async fileDeleteFailureHandler(messageBody: DeleteFailureMessage) {
    const { filesToDeleteMessageInfo, erroneousFileRecords, fileSessionId } = messageBody.payload;

    await this.updateDeletedFileAssetActivities(filesToDeleteMessageInfo);
    await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId);

    await this.updateFileAssetsFailReason(erroneousFileRecords, filesToDeleteMessageInfo);
  }

  private async updateFileAssetsFailReason(
    erroneousFileRecords: Record<string, string[]>,
    filesToDeleteMessageInfo: FilesToDeleteMessageInfo[],
  ) {
    // key is failReason, value is fileAssetUuids
    try {
      for (const key in erroneousFileRecords) {
        if (erroneousFileRecords[key].includes('all')) {
          const fileAssetIds = this.getAllFileAssetIds(filesToDeleteMessageInfo);
          this.fileAssetEntityService.updateFileAssets(fileAssetIds, { failCategory: FILE_FAIL_CATEGORY.DELETION, failReason: key });
          break;
        }

        const fileAssetUuids = erroneousFileRecords[key];
        this.fileAssetEntityService.updateFileAssets(fileAssetUuids, { failCategory: FILE_FAIL_CATEGORY.DELETION, failReason: key });
      }
    } catch (error) {
      this.logger.error(`[updateFileAssetsFailReason] ${JSON.stringify(error)}`);
    }
  }

  private getAllFileAssetIds(deleteActivities: FilesToDeleteMessageInfo[]): number[] {
    const fileAssetIds: number[] = [];
    deleteActivities.map;
    deleteActivities.forEach(({ files }) => {
      files.forEach((file) => {
        const { fileAssetId } = file;
        fileAssetIds.push(fileAssetId);
      });
    });

    return fileAssetIds;
  }

  protected async updateDeletedFileAssetActivities(filesToDeleteMessageInfo: FilesToDeleteMessageInfo[]) {
    const updateTransactions = this.groupAndFlattenUpdateDeletedEntities(filesToDeleteMessageInfo);
    // Find delete transaction with activities & fileassets based on fileAssetUuids
    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      // Update all entities
      await this.updateDeleteTransactionEntities(updateTransactions, entityManager);

      await txn.commit();
    } catch (error) {
      this.logger.error(`[updateDeletedFileAssetActivities] ${JSON.stringify(error)}`);
      await txn.rollback();
    }

    const deleteFileActivityIds = filesToDeleteMessageInfo
      .filter((activity) => !!activity.activityId && activity.activityType === ACTIVITY_TYPE.RECEIVE_DELETE)
      .map((activity) => activity.activityId!);

    if (deleteFileActivityIds.length > 0) {
      await this.notificationService.processNotifications(deleteFileActivityIds, { templateType: NOTIFICATION_TEMPLATE_TYPE.DELETION });
    }

    // Check if there are any transactions with RECALLL type to send recall success email to agency
    if (filesToDeleteMessageInfo.filter((deleteInfo) => deleteInfo.transactionType === TRANSACTION_TYPE.RECALL).length > 0) {
      // recall email is only sent if the activity type is of SEND_RECALL
      await this.recallTransactionService.recallTransactionSuccessEmailToAgency(
        filesToDeleteMessageInfo.map(({ activityId, activityType }) => ({ activityId, activityType })),
      );
    }
  }

  private async updateDeleteTransactionEntities(updateTransaction: UpdateDeletedFiles, entityManager: EntityManager) {
    const { transactionIds, activityFiles, activityIds, fileAssetIds, toCreateFileAssetHistories, oaCertIdsToExpire } = updateTransaction;

    // Update transaction status to completed
    await this.transactionEntityService.updateTransactions(
      Array.from(transactionIds),
      { status: TRANSACTION_STATUS.COMPLETED },
      entityManager,
    );

    // Update activities status to completed
    await this.activityEntityService.updateActivities(
      activityIds,
      {
        status: ACTIVITY_STATUS.COMPLETED,
      },
      entityManager,
    );

    // Link fileAsset to activities
    const toBeInsertedActivityFile: ActivityFileInsert[] = activityFiles.map((activityFile) => activityFile);

    await this.activityEntityService.insertActivityFiles(toBeInsertedActivityFile, entityManager);

    // Update file asset status to deleted
    await this.fileAssetEntityService.updateFileAssets(fileAssetIds, { status: FILE_STATUS.DELETED }, entityManager);

    // Remove all file-asset-access token that is tied to the file asset
    await this.fileAssetAccessService.deleteTokensUsingFileAssetIds(fileAssetIds, entityManager);

    // create file asset history
    await this.fileAssetHistoryEntityService.saveFileAssetHistories(toCreateFileAssetHistories, entityManager);

    // NOTE: File deletion will trigger revocation. To remove if file deletion no longer revokes OA
    // update oaCert to revoked
    await Promise.all(
      Object.keys(oaCertIdsToExpire).map((issuerId) =>
        this.oaCertificateEntityService.updateOaCertificates(
          Array.from(oaCertIdsToExpire[Number(issuerId)]),
          {
            status: OA_CERTIFICATE_STATUS.REVOKED,
            revocationType: REVOCATION_TYPE.CANCELLED,
            revokedById: Number(issuerId),
            reason: 'Deletion',
          },
          entityManager,
        ),
      ),
    );
  }

  protected groupAndFlattenUpdateDeletedEntities(filesToDeleteMessageInfo: FilesToDeleteMessageInfo[]): UpdateDeletedFiles {
    const transactionIds: Set<number> = new Set();
    const activityFiles: ActivityFile[] = [];
    const activityIds: ActivityId[] = [];
    const fileAssetIds: FileAssetId[] = [];
    const toCreateFileAssetHistories: FileAssetHistoryCreationModel[] = [];
    const oaCertIdsToExpire: Record<IssuerId, Set<string>> = {};
    const activityWithOaIds: ActivityId[] = []; // For sending of cancellation email

    filesToDeleteMessageInfo.forEach(({ transactionId, activityId, issuerId, ownerId, files }) => {
      transactionIds.add(transactionId);

      if (activityId) {
        activityIds.push(activityId);
      }

      files.forEach((file) => {
        const { fileAssetId, oaCertId } = file;

        if (activityId) {
          activityFiles.push({
            activityId,
            fileAssetId,
          });
        }

        fileAssetIds.push(fileAssetId);

        if (oaCertId) {
          // Add revocation file asset history
          toCreateFileAssetHistories.push({
            fileAssetId,
            type: FILE_ASSET_ACTION.REVOKED,
            actionById: issuerId,
            actionToId: ownerId,
          });

          if (activityId) {
            activityWithOaIds.push(activityId);
          }

          if (oaCertIdsToExpire[issuerId]) {
            oaCertIdsToExpire[issuerId].add(oaCertId);
          } else {
            oaCertIdsToExpire[issuerId] = new Set();
          }
        }

        toCreateFileAssetHistories.push({
          fileAssetId,
          type: FILE_ASSET_ACTION.DELETE,
          actionById: issuerId,
          actionToId: ownerId,
        });
      });
    });

    return {
      transactionIds,
      activityFiles,
      activityIds,
      fileAssetIds,
      toCreateFileAssetHistories,
      oaCertIdsToExpire,
      activityWithOaIds,
    };
  }
}
