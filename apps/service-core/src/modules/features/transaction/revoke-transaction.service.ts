import { EntityNotFoundException, InputValidationException, LogMethod } from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  CreateRevokeTransactionResponse,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  NOTIFICATION_TEMPLATE_TYPE,
  OA_CERTIFICATE_STATUS,
  revocationTypeToFileStatusMapper,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { CreateRevokeTransactionRequest, RevocationRequest, RevokeTransactionRequest } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { RevokeTransactionEmailFailedException } from '../../../common/filters/custom-exceptions.filter';
import { FileAsset } from '../../../entities/file-asset';
import { Transaction, TransactionCreationModel } from '../../../entities/transaction';
import { ProgrammaticUser, User } from '../../../entities/user';
import { FILE_ASSET_TYPE } from '../../../typings/common';
import { ActivityFileInsert } from '../../entities/activity/activity.entity.repository';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { ApplicationEntityService } from '../../entities/application/application.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { FileAssetHistoryEntityService } from '../../entities/file-asset-history/file-asset-history.entity.service';
import { OaCertificateEntityService } from '../../entities/oa-certificate/oa-certificate.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { ProgrammaticUserEntityService } from '../../entities/user/programmatic-user.entity.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RevokeTransactionService {
  private readonly logger = new Logger(RevokeTransactionService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly programmaticUserEntityService: ProgrammaticUserEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly applicationEntityService: ApplicationEntityService,
    private readonly fileAssetHistoryEntityService: FileAssetHistoryEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
    private readonly oaCertificateEntityService: OaCertificateEntityService,
  ) {}

  @LogMethod()
  public async createRevokeTransaction(
    userId: number,
    revokeTransactionReq: RevokeTransactionRequest,
  ): Promise<CreateRevokeTransactionResponse> {
    // Find all user's eservices' programmatic users' id
    const eserviceProgrammaticUsers = await this.programmaticUserEntityService.retrieveAllEservicesProgrammaticUsersByUserId(userId);
    const eserviceProgrammaticUserIds = eserviceProgrammaticUsers.map((programmaticUser) => programmaticUser.id);

    // Controller will ensure only either transactionUuid or fileAssetUuids is provided
    const { transactionUuid, fileAssetUuids } = revokeTransactionReq.revocation;

    let issuanceTransaction: Transaction;
    let fileAssetsToRevoke: FileAsset[];

    // By transaction
    if (transactionUuid) {
      this.logger.log(`Revoking by transaction id: ${transactionUuid}`);
      const { transaction, fileAssets: sendTransferActiveOAFileAssets } = await this.revokeTransactionHandler(
        transactionUuid,
        eserviceProgrammaticUserIds,
      );

      issuanceTransaction = transaction;
      fileAssetsToRevoke = sendTransferActiveOAFileAssets;
    }

    // By fileAssets
    if (fileAssetUuids) {
      const { transaction, fileAssets } = await this.revokeFileAssetsHandler(fileAssetUuids, eserviceProgrammaticUserIds);

      issuanceTransaction = transaction;
      fileAssetsToRevoke = fileAssets;
    }
    const revokeTransactionUser = eserviceProgrammaticUsers.filter((user) => user.id === userId)[0];

    const { revokeTransactionUuid, revokedFileAssetUuids } = await this.revokeHandler(
      revokeTransactionReq,
      issuanceTransaction!,
      fileAssetsToRevoke!,
      revokeTransactionUser,
    );

    return { revokeTransactionUuid, revokedFileAssetUuids };
  }

  // ===========================================================================
  // Handlers
  // ===========================================================================
  private async revokeTransactionHandler(transactionUuid: string, eserviceProgrammaticUserIds: number[]) {
    // NOTE: retrieve generic transaction (no status & type) in order to throw custom input validation exception below
    const transaction = await this.transactionEntityService.retrieveTransactionByUuid(transactionUuid);

    // Check if transaction belongs to programmatic user's eService (thru all eService programmatic users)
    if (!eserviceProgrammaticUserIds.includes(transaction.userId)) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, Transaction.name, 'uuid', transactionUuid);
    }

    // Check if transaction is status: completed and is type: issuance/upload transfer
    if (transaction.status !== TRANSACTION_STATUS.COMPLETED || transaction.type !== TRANSACTION_TYPE.UPLOAD_TRANSFER) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Invalid transaction provided');
    }

    // Retrieve all active OA fileAssets in sendTransfer activity
    const sendTransferActiveOAFileAssets =
      await this.fileAssetEntityService.retrieveFileAssetsByStatusAndDocumentTypeAndActivityTypeAndTransactionUuid(
        FILE_STATUS.ACTIVE,
        FILE_TYPE.OA,
        ACTIVITY_TYPE.SEND_TRANSFER,
        transaction.uuid,
      );

    // If no OA fileAssets, throw error
    if (sendTransferActiveOAFileAssets.length === 0) {
      throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'No active OA file assets found in transaction');
    }

    return { transaction, fileAssets: sendTransferActiveOAFileAssets };
  }

  private async revokeFileAssetsHandler(fileAssetUuids: string[], eserviceProgrammaticUserIds: number[]) {
    const fileAssets = await this.fileAssetEntityService.retrieveFileAssetsByUuids(fileAssetUuids);

    fileAssets.forEach((fileAsset) => {
      const { ownerId, issuerId, type, documentType, status, uuid } = fileAsset;

      // Check if fileAssets belong to programmatic user's eService (thru all eService programmatic users)
      if (!eserviceProgrammaticUserIds.includes(ownerId)) {
        throw new EntityNotFoundException(
          COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
          FileAsset.name,
          'uuid',
          uuid + ' belonging to eservice',
        );
      }

      // Check if fileAsset has no issuer (is issued by), is status: active, is document type: OA and is type: uploaded
      if (issuerId !== ownerId || status !== FILE_STATUS.ACTIVE || documentType !== FILE_TYPE.OA || type !== FILE_ASSET_TYPE.UPLOADED) {
        throw new InputValidationException(COMPONENT_ERROR_CODE.TRANSACTION_SERVICE, 'Invalid file asset provided');
      }
    });

    const transactions = await this.transactionEntityService.retrieveTransactionsByFileAssetUuids(fileAssetUuids);

    if (transactions.length === 0) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        'Failed to find existing transaction with the file assets',
      );
    }

    // Check if fileAssets belong to the same transction
    if (transactions.length > 1) {
      throw new InputValidationException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        'Only file assets from the same transaction are allowed',
      );
    }

    return { transaction: transactions[0], fileAssets };
  }

  private async revokeHandler(
    revokeTransactionReq: RevokeTransactionRequest,
    issuanceTransaction: Transaction,
    fileAssets: FileAsset[],
    revokeTransactionUser: ProgrammaticUser,
  ) {
    const { transaction: transactionReq, revocation: revocationReq } = revokeTransactionReq;

    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    let revokeTransactionUuid: string;
    let revokedFileAssetUuids: string[];
    let receiveRevokeActivityUuids: string[];
    try {
      // Create and save Revoke Transaction
      const revokeTransaction = await this.createTransaction(transactionReq, issuanceTransaction, revokeTransactionUser, entityManager);
      revokeTransactionUuid = revokeTransaction.uuid;

      // Create and save sendRevoke Activity
      revokedFileAssetUuids = await this.createSendRevokeActivity(
        revokeTransaction,
        fileAssets,
        revokeTransactionUser,
        revocationReq,
        entityManager,
      );

      // Create and insert receiveRevoke activities
      receiveRevokeActivityUuids = await this.createReceiveRevokeActivities(
        revokeTransaction,
        issuanceTransaction.uuid,
        fileAssets,
        revokeTransactionUser,
        revocationReq,
        entityManager,
      );

      await txn.commit();
    } catch (error) {
      await txn.rollback();
      this.logger.error(error);
      throw error;
    }

    // Send email to each receive transfer activity email
    try {
      await this.notificationService.processNotifications(receiveRevokeActivityUuids, {
        templateType: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
      });
    } catch (error) {
      throw new RevokeTransactionEmailFailedException(
        COMPONENT_ERROR_CODE.TRANSACTION_SERVICE,
        revokeTransactionUuid,
        revokedFileAssetUuids,
        JSON.stringify(error),
      );
    }

    return { revokeTransactionUuid, revokedFileAssetUuids };
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private async createTransaction(
    createRevokeTransactionRequest: CreateRevokeTransactionRequest,
    issuanceTransaction: Transaction,
    user: ProgrammaticUser,
    entityManager?: EntityManager,
  ) {
    const { name: transactionName, customAgencyMessage } = createRevokeTransactionRequest;
    const application = await this.applicationEntityService.retrieveApplicationByTransactionUuid(issuanceTransaction.uuid);

    const creationModel: TransactionCreationModel = {
      name: transactionName,
      type: TRANSACTION_TYPE.REVOKE,
      // temporarily hardcode this to API first as revocation can only be triggered thru endpoint now
      creationMethod: TRANSACTION_CREATION_METHOD.API,
      status: TRANSACTION_STATUS.COMPLETED,
      parentId: issuanceTransaction.id,
      customAgencyMessage,
      application,
      user,
    };

    return await this.transactionEntityService.saveTransaction(creationModel, entityManager);
  }

  private async createSendRevokeActivity(
    revokeTransaction: Transaction,
    revokeFileAssets: FileAsset[],
    revokeTransactionUser: ProgrammaticUser,
    revocationReq: RevocationRequest,
    entityManager?: EntityManager,
  ) {
    // Create send revoke activity
    const sendRevokeActivity = await this.activityEntityService.saveActivity(
      {
        status: ACTIVITY_STATUS.COMPLETED,
        type: ACTIVITY_TYPE.SEND_REVOKE,
        transaction: revokeTransaction,
        user: revokeTransactionUser,
      },
      entityManager,
    );

    const sendTransferFileAssetIds = revokeFileAssets.map((fileAsset) => fileAsset.id);

    // Create and insert into activity_files table to join the upload and sendTranfer activities and their fileAssets
    const sendRevokeActivityFileInserts: ActivityFileInsert[] = [];
    sendTransferFileAssetIds.forEach((fileAssetId) =>
      sendRevokeActivityFileInserts.push({ activityId: sendRevokeActivity.id, fileAssetId }),
    );
    await this.activityEntityService.insertActivityFiles(sendRevokeActivityFileInserts, entityManager);

    // Update FileAsset(s)
    const revokedFileAssetUuids = revokeFileAssets.map((fileAsset) => fileAsset.uuid);
    await this.fileAssetEntityService.updateFileAssets(
      revokedFileAssetUuids,
      { status: revocationTypeToFileStatusMapper(revocationReq.type) },
      entityManager,
    );

    // Update OA certificate(s)
    const { reason, type: revocationType } = revocationReq;
    const oaCertificateIds = revokeFileAssets.map((fileAsset) => fileAsset.oaCertificateId!); // OA fileAsset will definitely has oaCertificateId

    await this.oaCertificateEntityService.updateOaCertificates(
      oaCertificateIds,
      {
        status: OA_CERTIFICATE_STATUS.REVOKED,
        revocationType,
        reason,
        revokedBy: revokeTransactionUser,
      },
      entityManager,
    );

    // Create and insert fileAssetHistories
    await this.createFileAssetHistories(revokeFileAssets, revokeTransactionUser, revokeTransactionUser, entityManager);

    return revokedFileAssetUuids;
  }

  private async createReceiveRevokeActivities(
    revokeTransaction: Transaction,
    issuanceTransactionUuid: string,
    revokeFileAssets: FileAsset[],
    revokeTransactionUser: ProgrammaticUser,
    revocationReq: RevocationRequest,
    entityManager?: EntityManager,
  ) {
    const receiveRevokeActivityFileInserts: ActivityFileInsert[] = [];
    const revokeFileAssetUuids = revokeFileAssets.map((fileAsset) => fileAsset.uuid);

    // Retrieve receive transfer activities within transaction with specified active OA file assets
    const receiveTransferFileAssets = await this.fileAssetEntityService.retrieveAllChildrenUsingParentUuids(revokeFileAssetUuids);
    const receiveTransferFileAssetUuids = receiveTransferFileAssets.map((fileAsset) => fileAsset.uuid);

    const receiveTransferActivitiesWithUserAndActiveOAFileAssets =
      await this.activityEntityService.retrieveActivitiesWithUserAndActiveOAFileAssetsByTypeAndFileAssetUuidsAndTransactionUuid(
        ACTIVITY_TYPE.RECEIVE_TRANSFER,
        receiveTransferFileAssetUuids,
        issuanceTransactionUuid,
        entityManager,
      );

    const receiveRevokeActivityUuids: string[] = [];
    // For each receive transfer activity
    for (const receiveTransferActivity of receiveTransferActivitiesWithUserAndActiveOAFileAssets) {
      const { recipientInfo } = receiveTransferActivity;

      // Create a receive revoke activity
      const receiveRevokeActivity = await this.activityEntityService.saveActivity(
        {
          status: ACTIVITY_STATUS.COMPLETED,
          type: ACTIVITY_TYPE.RECEIVE_REVOKE,
          transaction: revokeTransaction,
          user: receiveTransferActivity.user,
          recipientInfo,
        },
        entityManager,
      );

      // Create activityfile relation for all file assets and add to list
      const fileAssets = receiveTransferActivity.fileAssets!;
      fileAssets.forEach((fileAsset) => {
        receiveRevokeActivityFileInserts.push({ activityId: receiveRevokeActivity.id, fileAssetId: fileAsset.id });
      });

      // Update FileAsset(s)
      const fileAssetUuids = fileAssets.map((fileAsset) => fileAsset.uuid);
      await this.fileAssetEntityService.updateFileAssets(
        fileAssetUuids,
        { status: revocationTypeToFileStatusMapper(revocationReq.type) },
        entityManager,
      );

      // Create and insert fileAssetHistories for each file
      await this.createFileAssetHistories(fileAssets, revokeTransactionUser, receiveTransferActivity.user!, entityManager);

      // Add to activity uuid list
      receiveRevokeActivityUuids.push(receiveRevokeActivity.uuid);
    }

    // Insert all activity file relations
    await this.activityEntityService.insertActivityFiles(receiveRevokeActivityFileInserts, entityManager);

    return receiveRevokeActivityUuids;
  }

  private async createFileAssetHistories(fileAssets: FileAsset[], actionBy: User, actionTo: User, entityManager?: EntityManager) {
    await this.fileAssetHistoryEntityService.insertFileAssetHistories(
      fileAssets.map((fileAsset) => ({
        type: FILE_ASSET_ACTION.REVOKED,
        actionBy,
        actionTo,
        fileAsset,
      })),
      entityManager,
    );
  }
}
