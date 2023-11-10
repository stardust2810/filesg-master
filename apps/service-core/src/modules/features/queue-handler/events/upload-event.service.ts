import { FileAssetMetaData, UploadToStgCompletedMessage, UploadToStgFailedMessage } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  COMPONENT_ERROR_CODE,
  FILE_FAIL_CATEGORY,
  FILE_SESSION_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  FileUploadMoveSession,
  OA_CERTIFICATE_STATUS,
  TRANSACTION_STATUS,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { DatabaseException } from '../../../../common/filters/custom-exceptions.filter';
import { Activity } from '../../../../entities/activity';
import { Transaction } from '../../../../entities/transaction';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';

@Injectable()
export class UploadEventService {
  private readonly logger = new Logger(UploadEventService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly oaCertificateEntityService: OaCertificateEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
  ) {}

  // ===========================================================================
  // Handlers
  // ===========================================================================
  public async uploadToStgSuccessHandler(messageBody: UploadToStgCompletedMessage) {
    /*
     * Optmize speed by utilitizing as many parallel sql queries as possible
     */
    const { payload } = messageBody;

    const { transactionId, fileAssetInfos } = payload;

    const fileAssetUuids = fileAssetInfos.map((info) => info.fileAssetId);
    this.logger.log(
      `[Timing] Starting uploadToStgSuccessHandler with transaction of ${transactionId} and file assets of ${fileAssetUuids.join(', ')}`,
    );

    const [parentActivity, parentTransaction] = await Promise.all([
      this.activityEntityService.retrieveParentActivityByTransactionUuid(transactionId),
      this.transactionEntityService.retrieveTransactionByUuid(transactionId),
    ]);
    const fileUploadMoveSession = this.constructFileUploadMoveSession(parentTransaction, parentActivity, fileAssetInfos);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      await Promise.all([
        ...fileAssetInfos.map((fileAssetInfo) => this.processFileAssset(fileAssetInfo, entityManager)),
        this.activityEntityService.updateActivityStatus(parentActivity.uuid, ACTIVITY_STATUS.SCANNING, entityManager),
        this.redisService.set(FILESG_REDIS_CLIENT.FILE_SESSION, parentTransaction.fileSessionId!, JSON.stringify(fileUploadMoveSession)),
      ]);

      await txn.commit();

      this.logger.log(
        `[Timing] Ended uploadToStgSuccessHandler with transaction of ${transactionId} and file assets of ${fileAssetUuids.join(', ')}`,
      );
    } catch (error) {
      await txn.rollback();
      await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, parentTransaction.fileSessionId!);

      const internalLog = `Failed to update the file and activity status. ${JSON.stringify(error)}`;
      throw new DatabaseException(COMPONENT_ERROR_CODE.UPLOAD_EVENT_SERVICE, 'updating', 'activity and file asset', internalLog);
    }
  }

  public async uploadtoStgFailedHandler(messageBody: UploadToStgFailedMessage) {
    const transactionUuid = messageBody.payload.transactionId;
    const parentActivity = await this.activityEntityService.retrieveParentActivityByTransactionUuid(transactionUuid);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      await Promise.all([
        ...messageBody.payload.failedFiles.map((failedFile) =>
          this.fileAssetEntityService.updateFileAssetStatus(
            failedFile.fileAssetId,
            {
              status: FILE_STATUS.FAILED,
              failCategory: FILE_FAIL_CATEGORY.UPLOAD_TO_STAG,
              failReason: failedFile.failedReason,
            },
            entityManager,
          ),
        ),
        this.activityEntityService.updateActivityStatus(parentActivity.uuid, ACTIVITY_STATUS.FAILED, entityManager),
        this.transactionEntityService.updateTransactionStatus(messageBody.payload.transactionId, TRANSACTION_STATUS.FAILED, entityManager),
      ]);

      await txn.commit();
    } catch (error) {
      this.logger.log(error);
      await txn.rollback();

      const erroMsg = error instanceof Error ? error.message : '';
      const internalLog = `Failed to update failed status for fileasset, activity, transaction. ${erroMsg}`;
      throw new DatabaseException(COMPONENT_ERROR_CODE.UPLOAD_EVENT_SERVICE, 'updating', 'fileasset, activity & transaction', internalLog);
    }
  }

  protected async processFileAssset(fileMetaData: FileAssetMetaData, entityManager?: EntityManager) {
    const { fileAssetId: fileAssetUuid, fileType, size, oaCertificateId, oaCertificateHash } = fileMetaData;

    if (fileType === FILE_TYPE.OA && oaCertificateId && oaCertificateHash) {
      await this.oaCertificateEntityService.saveOaCertificate(
        {
          id: oaCertificateId,
          status: OA_CERTIFICATE_STATUS.REVOKED,
          hash: oaCertificateHash,
        },
        entityManager,
      );
    }

    // Doing this because of typeorm limitation in creating complex update query
    const ownerFileAsset = await this.fileAssetEntityService.retrieveFileAssetByUuid(fileAssetUuid, entityManager);

    await Promise.all([
      this.fileAssetEntityService.updateFileAsset(
        ownerFileAsset.uuid,
        {
          status: FILE_STATUS.SCANNING,
        },
        entityManager,
      ),
      this.fileAssetEntityService.updateFileAssetFamilyByParentId(
        ownerFileAsset.id,
        {
          documentType: fileType,
          size,
          oaCertificateId,
        },
        entityManager,
      ),
    ]);
  }

  protected constructFileUploadMoveSession(
    parentTransaction: Transaction,
    parentActivity: Activity,
    fileMetaData: FileAssetMetaData[],
  ): FileUploadMoveSession {
    return {
      type: FILE_SESSION_TYPE.UPLOAD,
      transaction: {
        id: parentTransaction.uuid,
        type: parentTransaction.type,
        creationMethod: parentTransaction.creationMethod ?? undefined, //TODO: creationMethod optional for V1
      },
      transfers: [
        {
          activityId: parentActivity.uuid,
          owner: { id: parentActivity.user!.uuid, type: parentActivity.user!.type },
          files: fileMetaData.map(({ fileName, fileAssetId, isPasswordEncryptionRequired, encryptedAgencyPassword }) => ({
            ownerFileAssetId: fileAssetId,
            isPasswordEncryptionRequired,
            encryptedAgencyPassword,
            ...(isPasswordEncryptionRequired && { name: fileName }),
          })),
        },
      ],
    };
  }
}
