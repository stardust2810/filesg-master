import {
  EVENT_LOGGING_EVENTS,
  EventLoggingRequest,
  FormSgTransactionFailureEvent,
  FormSgTransactionSuccessEvent,
  MoveCompletedMessagePayload,
  MoveCompletedMessageTransfer,
  MoveFailedMessagePayload,
  MoveFailedMessageTransfer,
  TransferMoveCompletedMessage,
  TransferMoveFailedMessage,
  UploadMoveCompletedMessage,
  UploadMoveFailedMessage,
} from '@filesg/backend-common';
import { FORMSG_TRANSACTION_FAIL_TYPE } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  FILE_FAIL_CATEGORY,
  FILE_SESSION_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  FileTransferMoveSession,
  FileTransferMoveSessionTransfer,
  FileTransferMoveSessionTransferFile,
  FORMSG_FAIL_CATEGORY,
  NOTIFICATION_TEMPLATE_TYPE,
  OA_CERTIFICATE_STATUS,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
  TransactionDetails,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { EntityManager, UpdateResult } from 'typeorm';

import { ActivityEncryptionDetails } from '../../../../common/email-template/activity-emails/issuance.class';
import { DatabaseException, UnknownTransactionTypeException } from '../../../../common/filters/custom-exceptions.filter';
import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { docEncryptionPasswordEncryptionTransformer } from '../../../../utils/encryption';
import { generateFileSessionUUID } from '../../../../utils/helpers';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { OaCertificateEntityService } from '../../../entities/oa-certificate/oa-certificate.entity.service';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { SqsService } from '../../aws/sqs.service';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class MoveEventService {
  private readonly logger = new Logger(MoveEventService.name);

  constructor(
    private readonly awsSQSService: SqsService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
    private readonly oaCertificateService: OaCertificateEntityService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
    @Inject(EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER) private readonly eventLogsServiceApiClient: AxiosInstance,
  ) {}

  // ===========================================================================
  // Main Handlers
  // ===========================================================================
  public async uploadMoveSuccessHandler(messageBody: UploadMoveCompletedMessage) {
    const { payload } = messageBody;
    const { fileSession, transaction } = payload;
    this.logger.log(`Handling upload move completed with transaction type ${transaction.type}`);

    switch (transaction.type) {
      case TRANSACTION_TYPE.UPLOAD:
        await this.uploadMoveSuccessUploadTxnHandler(payload);
        break;
      case TRANSACTION_TYPE.UPLOAD_TRANSFER:
        await this.uploadMoveSuccessUploadTransferTxnHandler(payload);
        break;
      default:
        throw new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, transaction.type);
    }

    await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSession.id);
  }

  public async uploadMoveFailedHandler(messageBody: UploadMoveFailedMessage) {
    const { payload } = messageBody;
    const { fileSession, transaction } = payload;
    this.logger.log(`Handling upload move failed with transaction type ${transaction.type}`);

    switch (transaction.type) {
      case TRANSACTION_TYPE.UPLOAD:
      case TRANSACTION_TYPE.UPLOAD_TRANSFER:
        await this.uploadMoveFailureAllTxnHandler(payload);
        break;
      default:
        throw new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, transaction.type);
    }

    await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSession.id);
  }

  public async transferMoveSuccessHandler(messageBody: TransferMoveCompletedMessage) {
    const { payload } = messageBody;
    const { fileSession, transaction } = payload;
    this.logger.log(`Handling transfer move completed with transaction type ${transaction.type}`);

    switch (transaction.type) {
      case TRANSACTION_TYPE.TRANSFER:
        await this.transferMoveSuccessTransferTxnHandler(payload);
        break;
      case TRANSACTION_TYPE.UPLOAD_TRANSFER:
        await this.transferMoveSuccessUploadTransferTxnHandler(payload);
        break;
      default:
        throw new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, transaction.type);
    }

    await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSession.id);
  }

  public async transferMoveFailedHandler(messageBody: TransferMoveFailedMessage) {
    const { payload } = messageBody;
    const { fileSession, transaction } = payload;
    this.logger.log(`Handling transfer move failed with transaction type ${transaction.type}`);

    switch (transaction.type) {
      case TRANSACTION_TYPE.TRANSFER:
      case TRANSACTION_TYPE.UPLOAD_TRANSFER:
        await this.transferMoveFailureAllTxnHandler(payload);
        break;
      default:
        throw new UnknownTransactionTypeException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, transaction.type);
    }

    await this.redisService.del(FILESG_REDIS_CLIENT.FILE_SESSION, fileSession.id);
  }

  // ===========================================================================
  // Sub handlers (Upload Move)
  // ===========================================================================
  //TRASACTION_TYPE: UPLOAD
  protected async uploadMoveSuccessUploadTxnHandler(payload: MoveCompletedMessagePayload) {
    const { fileSession, transaction, transfers } = payload;
    this.logger.log(`Handling payload of file session type ${fileSession.type} and transaction type ${transaction.type}`);

    // assuming there is only one transfer during upload move
    const fileAssetsWithParentAndOaCertificate = await this.fileAssetEntityService.retrieveFileAssetsWithParentAndOaCertificateByUuids(
      transfers[0].files.map((file) => file.id),
    );

    const oaCertificateIds: string[] = [];

    fileAssetsWithParentAndOaCertificate.forEach((fileAsset) => {
      if (fileAsset.documentType === FILE_TYPE.OA) {
        oaCertificateIds.push(fileAsset.oaCertificateId!);
      }
    });

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;
    try {
      await this.moveCompletedMessageHandler(transaction.id, transfers, entityManager, { oaCertificateIds });
      await txn.commit();
    } catch (error) {
      const internalLog = JSON.stringify(error);
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'updating', 'transaction', internalLog);
    }
  }

  protected async uploadMoveSuccessUploadTransferTxnHandler(payload: MoveCompletedMessagePayload) {
    const { fileSession, transaction, transfers } = payload;
    this.logger.log(`Handling payload of file session type ${fileSession.type} and transaction type ${transaction.type}`);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;
    try {
      const activityUuidsToUpdate: string[] = [];
      const updateFileAssetPromises: Promise<UpdateResult>[] = [];

      transfers.forEach(({ activityId, files }) => {
        activityUuidsToUpdate.push(activityId);

        files.forEach(
          ({ id, updates }) =>
            updates &&
            updateFileAssetPromises.push(
              this.fileAssetEntityService.updateFileAsset(
                id,
                { name: updates.name, documentType: updates.type, size: updates.size, isPasswordEncrypted: updates.isPasswordEncrypted },
                entityManager,
              ),
            ),
        );
      });

      const updateActivitiesPromise = this.activityEntityService.updateActivities(
        activityUuidsToUpdate,
        { status: ACTIVITY_STATUS.COMPLETED },
        entityManager,
      );
      const updateTransactionPromise = this.transactionEntityService.updateTransactionStatus(
        transaction.id,
        TRANSACTION_STATUS.UPLOADED,
        entityManager,
      );
      await Promise.all([updateFileAssetPromises, updateActivitiesPromise, updateTransactionPromise]);
      await this.addTransferMoveSession(transaction, transfers);
      await txn.commit();
    } catch (error) {
      const internalLog = JSON.stringify(error);
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'updating', 'transaction', internalLog);
    }
  }

  protected async uploadMoveFailureAllTxnHandler(payload: MoveFailedMessagePayload) {
    const { fileSession, transaction, transfers } = payload;
    this.logger.log(`Handling payload of file session type ${fileSession.type} and transaction type ${transaction.type}`);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;
    try {
      await this.moveFailedMessageHandler(transaction, transfers, FILE_FAIL_CATEGORY.UPLOAD_MOVE, entityManager);
      await txn.commit();
    } catch (error) {
      const internalLog = JSON.stringify(error);
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'updating', 'transaction', internalLog);
    }
  }

  // ===========================================================================
  // Sub handlers (Transfer Move)
  // ===========================================================================
  //TRASACTION_TYPE: TRANSFER
  protected async transferMoveSuccessTransferTxnHandler(payload: MoveCompletedMessagePayload) {
    const { fileSession, transaction, transfers } = payload;
    this.logger.log(`Handling payload of file session type ${fileSession.type} and transaction type ${transaction.type}`);

    // assuming within one transfer file session, can only be one activity type 'send-transfer' to multiple activity type 'receive-transfer'
    const receiveTransferActivityUuid = transfers[0].activityId;
    const sendTransferActivity = await this.activityEntityService.retrieveParentActivityByUuid(receiveTransferActivityUuid);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;
    try {
      await this.moveCompletedMessageHandler(transaction.id, transfers, entityManager, { activityUuids: [sendTransferActivity.uuid] });
      await txn.commit();
    } catch (error) {
      const internalLog = JSON.stringify(error);
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'updating', 'transaction and activity', internalLog);
    }
  }

  //TRASACTION_TYPE: UPLOAD_TRANSFER
  protected async transferMoveSuccessUploadTransferTxnHandler(payload: MoveCompletedMessagePayload) {
    const { fileSession, transaction, transfers } = payload;
    const transactionUuid = transaction.id;
    this.logger.log(`Handling payload of file session type ${fileSession.type} and transaction type ${transaction.type}`);

    // assuming within one transfer file session, can only be one activity type 'send-transfer' to multiple activity type 'receive-transfer'
    const receiveTransferActivityUuid = transfers[0].activityId;
    const retrieveParentActivityPromise = this.activityEntityService.retrieveParentActivityByUuid(receiveTransferActivityUuid);

    // assuming within one transfer file session, all file assets under each transfer are having the same parent file assets
    const retrieveFileAssetsWithParentAndOaCertificatePromise =
      this.fileAssetEntityService.retrieveFileAssetsWithParentAndOaCertificateByUuids(transfers[0].files.map((file) => file.id));

    const [sendTransferActivity, fileAssetsWithParentAndOaCertificate] = await Promise.all([
      retrieveParentActivityPromise,
      retrieveFileAssetsWithParentAndOaCertificatePromise,
    ]);

    const oaCertificateIds: string[] = [];
    const parentFileAssetUuids: string[] = [];

    fileAssetsWithParentAndOaCertificate.forEach((fileAsset) => {
      parentFileAssetUuids.push(fileAsset.parent!.uuid);

      if (fileAsset.documentType === FILE_TYPE.OA) {
        oaCertificateIds.push(fileAsset.oaCertificateId!);
      }
    });

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;
    try {
      await this.moveCompletedMessageHandler(transactionUuid, transfers, entityManager, {
        activityUuids: [sendTransferActivity.uuid],
        fileAssetUuids: [...parentFileAssetUuids],
        oaCertificateIds,
      });
      await txn.commit();
    } catch (error) {
      const internalLog = JSON.stringify(error);
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'updating', 'transaction and activity', internalLog);
    }

    const activityIds = transfers.map((transfer) => transfer.activityId);

    if (transaction.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG) {
      await this.saveEventLogs(
        transactionUuid,
        EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS,
        'transferMoveSuccessUploadTransferTxnHandler',
      );
    }

    const encryptionDetailsList = transfers.map<ActivityEncryptionDetails>(({ activityId, files, encryptedPassword }) => ({
      activityUuid: activityId,
      files: files.map(({ id, updates }) => ({
        fileAssetUuid: id,
        isPasswordEncrypted: updates?.isPasswordEncrypted,
      })),
      password: encryptedPassword ? docEncryptionPasswordEncryptionTransformer.from(encryptedPassword) : undefined,
    }));

    await this.notificationService.processNotifications(activityIds, {
      templateType: NOTIFICATION_TEMPLATE_TYPE.ISSUANCE,
      encryptionDetailsList,
    });
  }

  protected async transferMoveFailureAllTxnHandler(payload: MoveFailedMessagePayload) {
    const { fileSession, transaction, transfers } = payload;
    this.logger.log(`Handling payload of file session type ${fileSession.type} and transaction type ${transaction.type}`);

    // assuming within one transfer file session, can only be one activity type 'send-transfer' to multiple activity type 'receive-transfer'
    const receiveTransferActivityUuid = transfers[0].activityId;
    const sendTransferActivity = await this.activityEntityService.retrieveParentActivityByUuid(receiveTransferActivityUuid);

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;
    try {
      await this.moveFailedMessageHandler(transaction, transfers, FILE_FAIL_CATEGORY.TRANSFER_MOVE, entityManager, {
        activityUuids: [sendTransferActivity.uuid],
      });
      await txn.commit();
    } catch (error) {
      const internalLog = JSON.stringify(error);
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'updating', 'transaction and activity', internalLog);
    }
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================
  protected async moveCompletedMessageHandler(
    transactionUuid: string,
    transfers: MoveCompletedMessageTransfer[],
    entityManager?: EntityManager,
    additionals?: { fileAssetUuids?: string[]; activityUuids?: string[]; oaCertificateIds?: string[] },
  ) {
    const fileUuidsToUpdateStatusOnly: string[] = [];
    const fileAssetAdditionalUpdatePromises: Promise<UpdateResult>[] = [];
    const activityUuidsToUpdate: string[] = [];

    transfers.forEach((transfer) => {
      const { activityId, files } = transfer;
      activityUuidsToUpdate.push(activityId);

      files.forEach(({ id, updates }) => {
        if (updates) {
          const { name, type, size, isPasswordEncrypted } = updates;

          fileAssetAdditionalUpdatePromises.push(
            this.fileAssetEntityService.updateFileAsset(
              id,
              { name, documentType: type, size, isPasswordEncrypted, status: FILE_STATUS.ACTIVE },
              entityManager,
            ),
          );
        } else {
          fileUuidsToUpdateStatusOnly.push(id);
        }
      });
    });

    const promises: (Promise<UpdateResult> | Promise<UpdateResult>[])[] = [];

    if (additionals) {
      const { fileAssetUuids, activityUuids, oaCertificateIds } = additionals;

      if (fileAssetUuids && fileAssetUuids.length > 0) {
        fileUuidsToUpdateStatusOnly.push(...fileAssetUuids);
      }

      if (activityUuids && activityUuids.length > 0) {
        activityUuidsToUpdate.push(...activityUuids);
      }

      if (oaCertificateIds && oaCertificateIds.length > 0) {
        promises.push(
          this.oaCertificateService.updateOaCertificates(oaCertificateIds, { status: OA_CERTIFICATE_STATUS.ISSUED }, entityManager),
        );
      }
    }

    const updateFileAssetsPromise = this.fileAssetEntityService.updateFileAssets(
      fileUuidsToUpdateStatusOnly,
      { status: FILE_STATUS.ACTIVE },
      entityManager,
    );
    const updateActivitiesPromise = this.activityEntityService.updateActivities(
      activityUuidsToUpdate,
      { status: ACTIVITY_STATUS.COMPLETED },
      entityManager,
    );
    const updateTransactionPromise = this.transactionEntityService.updateTransactionStatus(
      transactionUuid,
      TRANSACTION_STATUS.COMPLETED,
      entityManager,
    );

    promises.push(fileAssetAdditionalUpdatePromises, updateFileAssetsPromise, updateActivitiesPromise, updateTransactionPromise);

    await Promise.all(promises);
  }

  protected async moveFailedMessageHandler(
    transaction: TransactionDetails,
    transfers: MoveFailedMessageTransfer[],
    failCategory: FILE_FAIL_CATEGORY,
    entityManager?: EntityManager,
    additionals?: { activityUuids?: string[] },
  ) {
    const transactionUuid = transaction.id;
    const context = failCategory === FILE_FAIL_CATEGORY.UPLOAD_MOVE ? 'uploadMoveFailureAllTxnHandler' : 'transferMoveFailureAllTxnHandler';
    const reason = failCategory === FILE_FAIL_CATEGORY.UPLOAD_MOVE ? 'Upload move failure' : 'Transfer move failure';

    if (transaction.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG) {
      await this.saveEventLogs(
        transactionUuid,
        EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
        context,
        FORMSG_FAIL_CATEGORY.UNEXPECTED_ERROR,
        reason,
      );
    }

    const updateFileAssetPromises: Promise<UpdateResult>[] = [];
    const activityUuidsToUpdate: string[] = [];

    transfers.forEach((transfer) => {
      const { files, activityId } = transfer;
      activityUuidsToUpdate.push(activityId);

      files.forEach(({ id, error }) => {
        updateFileAssetPromises.push(
          this.fileAssetEntityService.updateFileAsset(
            id,
            {
              status: FILE_STATUS.FAILED,
              failCategory,
              failReason: error,
            },
            entityManager,
          ),
        );
      });
    });

    if (additionals?.activityUuids) {
      activityUuidsToUpdate.push(...additionals.activityUuids);
    }

    const updateActivitiesPromise = this.activityEntityService.updateActivities(
      activityUuidsToUpdate,
      { status: ACTIVITY_STATUS.FAILED },
      entityManager,
    );

    const updateTransactionPromise = this.transactionEntityService.updateTransactionStatus(
      transactionUuid,
      TRANSACTION_STATUS.FAILED,
      entityManager,
    );

    await Promise.all([...updateFileAssetPromises, updateActivitiesPromise, updateTransactionPromise]);
  }

  protected async addTransferMoveSession(transaction: TransactionDetails, transfers: MoveCompletedMessageTransfer[]) {
    const sessionTransfers: FileTransferMoveSessionTransfer[] = [];

    // basically there is only one transfer because it is upload-move event
    for (const transfer of transfers) {
      const { activityId, files: transferFiles, encryptedPassword } = transfer;

      const activities = await this.activityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType(
        activityId,
        ACTIVITY_TYPE.SEND_TRANSFER,
      );

      if (activities.length > 1) {
        const internalLog = `Activity type upload of uuid ${transfer.activityId} has more than one children`;
        throw new DatabaseException(COMPONENT_ERROR_CODE.MOVE_EVENT_SERVICE, 'retrieving', 'activity', internalLog);
      }

      const sendTransferActivity = activities[0];
      const { user: sender } = sendTransferActivity;

      const receiveTransferActivities = await this.activityEntityService.retrieveActivitiesWithUserAndFileAssetsParentByParentIdAndType(
        sendTransferActivity.uuid,
        ACTIVITY_TYPE.RECEIVE_TRANSFER,
      );

      receiveTransferActivities.forEach((activity) => {
        const { user: receiver, fileAssets } = activity;

        const files: FileTransferMoveSessionTransferFile[] = fileAssets!.map((fileAsset) => {
          const fileAssetParentUuid = fileAsset.parent!.uuid;

          // find the transferred file where uuid matches the receive transfer activity file's parent uuid
          const parentTransferFile = transferFiles.find((transferFile) => transferFile.id === fileAssetParentUuid);

          return {
            ownerFileAssetId: fileAsset.parent!.uuid,
            receiverFileAssetId: fileAsset.uuid,
            updates: parentTransferFile?.updates,
          };
        });

        sessionTransfers.push({
          activityId: activity.uuid,
          owner: {
            id: sender!.uuid,
            type: sender!.type,
          },
          receiver: {
            id: receiver!.uuid,
            type: receiver!.type,
          },
          files,
          encryptedPassword,
        });
      });
    }

    const fileSessionId = await this.sendTransferSessionToRedis(transaction, sessionTransfers);
    await this.awsSQSService.sendMessageToQueueTransferEvents({ fileSessionId });
  }

  protected async sendTransferSessionToRedis(transaction: TransactionDetails, transfers: FileTransferMoveSessionTransfer[]) {
    const transferSession: FileTransferMoveSession = {
      type: FILE_SESSION_TYPE.TRANSFER,
      transaction,
      transfers,
    };

    const fileSessionId = generateFileSessionUUID();
    await this.redisService.set(FILESG_REDIS_CLIENT.FILE_SESSION, fileSessionId, JSON.stringify(transferSession));

    return fileSessionId;
  }

  protected async saveEventLogs(transactionUuid: string, eventType: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS, context: string): Promise<void> // prettier-ignore
  protected async saveEventLogs(transactionUuid: string, eventType: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE, context: string, failSubType: string, failReason: string): Promise<void> // prettier-ignore
  protected async saveEventLogs(
    transactionUuid: string,
    eventType: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS | EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
    context: string,
    failSubType?: string,
    failReason?: string,
  ) {
    const event: FormSgTransactionSuccessEvent | FormSgTransactionFailureEvent =
      eventType === EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS
        ? {
            type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_SUCCESS,
            transactionUuid,
          }
        : {
            type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
            transactionUuid,
            failure: {
              type: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS,
              subType: failSubType!,
              reason: failReason!,
            },
          };

    try {
      await this.eventLogsServiceApiClient.post<void, AxiosResponse<void>, EventLoggingRequest>('v1/events', { event });
    } catch (error) {
      const errorMessage = `[EventLogs][${context}] Saving to event logs failed, transactionUuid: ${transactionUuid}, error: ${
        (error as AxiosError).message
      }`;

      this.logger.error(errorMessage);
    }
  }
}
