import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  FILE_ASSET_ACTION,
  FILE_STATUS,
  FILE_TYPE,
  NOTIFICATION_TEMPLATE_TYPE,
  OA_CERTIFICATE_STATUS,
  REVOCATION_TYPE,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
  TRANSACTION_TYPE,
} from '@filesg/common';
import { CustomAgencyMessage } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { Application } from '../../../entities/application';
import { FileAsset } from '../../../entities/file-asset';
import { FileAssetHistoryCreationModel } from '../../../entities/file-asset-history';
import { Transaction } from '../../../entities/transaction';
import { ActivityRecipientInfo } from '../../../typings/common';
import { ActivityFileInsert } from '../../entities/activity/activity.entity.repository';
import { ActivityEntityService } from '../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../entities/file-asset/file-asset.entity.service';
import { FileAssetHistoryEntityService } from '../../entities/file-asset-history/file-asset-history.entity.service';
import { OaCertificateEntityService } from '../../entities/oa-certificate/oa-certificate.entity.service';
import { TransactionEntityService } from '../../entities/transaction/transaction.entity.service';
import { DatabaseTransactionService } from '../../setups/database/db-transaction.service';
import { NotificationService } from '../notification/notification.service';

type IssuanceTransactionId = number;
type OwnerId = number;

interface RecipientData {
  activityRecipientInfo: ActivityRecipientInfo;
  isNonSingpassRetrievable: boolean;
  fileAssetId: number[];
}

interface GroupedFileAssets {
  application: Application;
  issuanceTransaction: Transaction;
  issuerFileAssetIds: number[];
  recipients: Record<OwnerId, RecipientData>;
  oaCertIdToExpire: string[];
  allFileAssetIds: number[];
  toCreatefileAssetHistories: FileAssetHistoryCreationModel[];
}

@Injectable()
export class ExpireDocumentsService {
  private logger = new Logger(ExpireDocumentsService.name);

  constructor(
    private readonly notificationService: NotificationService,
    private readonly oaCertificateEntityService: OaCertificateEntityService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly fileAssetHistoryEntityService: FileAssetHistoryEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
  ) {}

  public async expireDocuments() {
    let recipientExpireActivityIds: number[];
    let fileAssets: FileAsset[];
    const PROCESS_CHUNK_SIZE = 20; // total files processed will be chunk size times  1 + no of recipients for that transaction
    let totalFilesProcessed = 0;

    do {
      fileAssets = await this.fileAssetEntityService.retrieveFileAssetsByStatusAndExpireAt(PROCESS_CHUNK_SIZE);

      if (fileAssets.length === 0) {
        if (totalFilesProcessed) {
          this.logger.log(`Processed a total of ${totalFilesProcessed} files. Completed processing of all files.`);
        } else {
          this.logger.log('There are no files to be processed.');
        }
        return;
      }

      this.logger.log(`[EXPIRE-DOCS-CRON] Processing total of ${fileAssets.length} in current batch`);
      const groupedFileAssets = this.groupAndFlattenExpiringFileAssets(fileAssets);

      const txn = await this.databaseTransactionService.startTransaction();
      const { entityManager } = txn;

      try {
        recipientExpireActivityIds = (
          await Promise.all(
            Object.keys(groupedFileAssets).map((issuanceTransactionId) =>
              this.expireDocumentsByIssuanceTransaction(groupedFileAssets[Number(issuanceTransactionId)], entityManager),
            ),
          )
        ).flat();

        await txn.commit();
      } catch (err) {
        await txn.rollback();
        this.logger.error(err);
        throw err;
      }

      this.successLogging(fileAssets);

      // Email is sent outside of try-catch as it is non critical and should not block the expiry of documents
      await this.notificationService.processNotifications(recipientExpireActivityIds, {
        templateType: NOTIFICATION_TEMPLATE_TYPE.CANCELLATION,
      });

      totalFilesProcessed += fileAssets.length;
    } while (fileAssets.length > 0);
  }

  /*
   *  Group all the fileAsset by issuance transaction id for easy processing
   *  NOTE: this method is coded based on the assumption that 1 transaction can only have 1 issuance activity (SEND_TRANSFER or RECEIVE_TRANSFER) per user
   */
  protected groupAndFlattenExpiringFileAssets(fileAssets: FileAsset[]): Record<IssuanceTransactionId, GroupedFileAssets> {
    return fileAssets.reduce<Record<IssuanceTransactionId, GroupedFileAssets>>((acc, curr) => {
      const { activities, ownerId, issuerId } = curr;

      const issuanceActivity = activities!.find(
        (activity) => activity.type === ACTIVITY_TYPE.SEND_TRANSFER || activity.type === ACTIVITY_TYPE.RECEIVE_TRANSFER,
      );

      const issuanceTransaction = issuanceActivity!.transaction!;
      const issuanceTransactionId = issuanceTransaction.id;
      const application = issuanceTransaction!.application!;
      const isIssuerCopy = ownerId === issuerId;

      if (!acc[issuanceTransactionId]) {
        acc[issuanceTransactionId] = {
          application,
          issuanceTransaction,
          issuerFileAssetIds: [],
          recipients: {},
          oaCertIdToExpire: [],
          allFileAssetIds: [],
          toCreatefileAssetHistories: [],
        };
      }

      // =======================================================================
      // Common
      // =======================================================================
      acc[issuanceTransactionId].allFileAssetIds.push(curr.id);
      acc[issuanceTransactionId].toCreatefileAssetHistories.push({
        fileAssetId: curr.id,
        type: FILE_ASSET_ACTION.EXPIRED,
        actionById: issuerId,
        actionToId: ownerId,
      });

      // =======================================================================
      // Issuer's Copy
      // =======================================================================
      if (isIssuerCopy) {
        acc[issuanceTransactionId].issuerFileAssetIds.push(curr.id);

        if (curr.documentType === FILE_TYPE.OA) {
          // OA type will definitely has oaCertificateId
          acc[issuanceTransactionId].oaCertIdToExpire.push(curr.oaCertificateId!);
        }

        return acc;
      }

      // =======================================================================
      // Recipients' Copies
      // =======================================================================
      if (!acc[issuanceTransactionId].recipients[ownerId]) {
        acc[issuanceTransactionId].recipients[ownerId] = {
          activityRecipientInfo: issuanceActivity!.recipientInfo!,
          isNonSingpassRetrievable: issuanceActivity!.isNonSingpassRetrievable!,
          fileAssetId: [],
        };
      }

      acc[issuanceTransactionId].recipients[ownerId].fileAssetId.push(curr.id);

      return acc;
    }, {});
  }

  private async expireDocumentsByIssuanceTransaction(groupedData: GroupedFileAssets, entityManager?: EntityManager): Promise<number[]> {
    const expireTransaction = await this.createExpiryTransaction(groupedData, entityManager);
    const recipientExpireActivityIds = await this.createExpiryActivitiesAndConnectToFileAsset(
      expireTransaction.id,
      groupedData,
      entityManager,
    );

    await this.updateFileAssetStatusAndCreateHistory(groupedData.allFileAssetIds, groupedData.toCreatefileAssetHistories, entityManager);
    await this.updateOaStatus(groupedData.oaCertIdToExpire, entityManager);

    return recipientExpireActivityIds;
  }

  private async createExpiryTransaction(
    { application, issuanceTransaction }: GroupedFileAssets,
    entityManager?: EntityManager,
  ): Promise<Transaction> {
    const applicationType = application.applicationType!;

    return await this.transactionEntityService.saveTransaction(
      {
        applicationId: application.id,
        status: TRANSACTION_STATUS.COMPLETED,
        type: TRANSACTION_TYPE.EXPIRE,
        creationMethod: TRANSACTION_CREATION_METHOD.SYSTEM,
        customAgencyMessage: this.getExpiryCustomAgencyMsgByApplicationType(applicationType.code, applicationType.name),
        name: `Your ${application.applicationType!.name} (${applicationType.code}) has expired`,
        userId: issuanceTransaction.userId,
        parentId: issuanceTransaction.id,
      },
      entityManager,
    );
  }

  /**
   * Returning the recipient expiryActivityId for emailing
   */
  private async createExpiryActivitiesAndConnectToFileAsset(
    expireTransactionId: number,
    { issuanceTransaction, recipients, issuerFileAssetIds }: GroupedFileAssets,
    entityManager?: EntityManager,
  ): Promise<number[]> {
    const agencyActivity = await this.activityEntityService.saveActivity(
      {
        transactionId: expireTransactionId,
        status: ACTIVITY_STATUS.COMPLETED,
        type: ACTIVITY_TYPE.TRIGGER_EXPIRE,
        userId: issuanceTransaction.userId,
      },
      entityManager,
    );

    const recipientIds = Object.keys(recipients).map((id) => Number(id));

    const recipientActivities = await this.activityEntityService.insertActivities(
      recipientIds.map((recipientId) => ({
        transactionId: expireTransactionId,
        status: ACTIVITY_STATUS.COMPLETED,
        type: ACTIVITY_TYPE.RECEIVE_EXPIRE,
        userId: recipientId,
        parentId: agencyActivity.id,
        recipientInfo: recipients[recipientId].activityRecipientInfo,
        isNonSingpassRetrievable: recipients[recipientId].isNonSingpassRetrievable,
      })),
      entityManager,
    );

    const toBeInsertedActivityFile: ActivityFileInsert[] = issuerFileAssetIds.map((fileAssetId) => ({
      activityId: agencyActivity.id,
      fileAssetId,
    }));

    for (let i = 0; i < recipientIds.length; i++) {
      const recipientId = recipientIds[i];
      const recipientActivityId = recipientActivities.identifiers[i].id;
      const recipientFileAssetIds = recipients[recipientId].fileAssetId;

      recipientFileAssetIds.forEach((recipientFileAssetId) => {
        toBeInsertedActivityFile.push({
          activityId: recipientActivityId,
          fileAssetId: recipientFileAssetId,
        });
      });
    }

    await this.activityEntityService.insertActivityFiles(toBeInsertedActivityFile, entityManager);

    return recipientActivities.identifiers.map((identifier) => identifier.id);
  }

  private async updateFileAssetStatusAndCreateHistory(
    allFileAssetIds: number[],
    toCreatefileAssetHistories: FileAssetHistoryCreationModel[],
    entityManager?: EntityManager,
  ) {
    await this.fileAssetEntityService.updateFileAssets(allFileAssetIds, { status: FILE_STATUS.EXPIRED }, entityManager);
    await this.fileAssetHistoryEntityService.insertFileAssetHistories(toCreatefileAssetHistories, entityManager);
  }

  private async updateOaStatus(oaCertIdToExpire: string[], entityManager?: EntityManager): Promise<void> {
    if (oaCertIdToExpire.length === 0) {
      return;
    }

    await this.oaCertificateEntityService.updateOaCertificates(
      oaCertIdToExpire,
      {
        status: OA_CERTIFICATE_STATUS.REVOKED,
        revocationType: REVOCATION_TYPE.EXPIRED,
      },
      entityManager,
    );
  }

  private successLogging(processedFileAssets: FileAsset[]) {
    this.logger.log(
      {
        processedFileAssets: processedFileAssets.map(({ uuid, ownerId, expireAt, oaCertificateId }) => ({
          fileAssetUuid: uuid,
          ownerId: ownerId,
          fileAssetExpireAt: expireAt,
          fileAssetOaCertId: oaCertificateId,
        })),
        processedFileAssetsLength: processedFileAssets.length,
      },
      'expire-docs cronJob processed successfully',
    );
  }

  // TODO: this should be improved, maybe by storing the message in database
  private getExpiryCustomAgencyMsgByApplicationType(applicationTypeCode: string, applicationTypeName: string): CustomAgencyMessage | null {
    const expiryMsg = [
      `Your ${applicationTypeName} (${applicationTypeCode}) has expired. You can still view expired passes by clicking "Open in FileSG"`,
    ];

    return {
      transaction: expiryMsg,
      email: expiryMsg,
    };
  }
}
