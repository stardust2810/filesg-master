import {
  EntityNotFoundException,
  EVENT_LOGGING_EVENTS,
  EventLoggingRequest,
  FORMSG_TRANSACTION_FAIL_TYPE,
  FormSgTransactionFailureEvent,
  FormSgTransactionVirusScanFailureAgencyFileAsset,
  SqsTransferEventsMessage,
} from '@filesg/backend-common';
import {
  ACTIVITY_STATUS,
  ACTIVITY_TYPE,
  COMPONENT_ERROR_CODE,
  FEATURE_TOGGLE,
  FILE_FAIL_CATEGORY,
  FILE_STATUS,
  FORMSG_FAIL_CATEGORY,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_STATUS,
} from '@filesg/common';
import { FILESG_REDIS_CLIENT, RedisService } from '@filesg/redis';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosError, AxiosInstance, AxiosResponse } from 'axios';

import { EmailFactory } from '../../../../common/email-template/email-factory.class';
import { DatabaseException } from '../../../../common/filters/custom-exceptions.filter';
import { EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER } from '../../../../consts';
import { FileAsset } from '../../../../entities/file-asset';
import { Transaction } from '../../../../entities/transaction';
import { EMAIL_TYPES } from '../../../../utils/email-template';
import { ActivityEntityService } from '../../../entities/activity/activity.entity.service';
import { FileAssetEntityService } from '../../../entities/file-asset/file-asset.entity.service';
import { TransactionEntityService } from '../../../entities/transaction/transaction.entity.service';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { DatabaseTransactionService } from '../../../setups/database/db-transaction.service';
import { SqsService } from '../../aws/sqs.service';
import { EmailService } from '../../notification/email.service';

@Injectable()
export class PostScanEventService {
  private logger = new Logger(PostScanEventService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly awsSQSService: SqsService,
    private readonly emailService: EmailService,
    private readonly fileSGConfigService: FileSGConfigService,
    private readonly activityEntityService: ActivityEntityService,
    private readonly transactionEntityService: TransactionEntityService,
    private readonly fileAssetEntityService: FileAssetEntityService,
    private readonly databaseTransactionService: DatabaseTransactionService,
    @Inject(EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER) private readonly eventLogsServiceApiClient: AxiosInstance,
  ) {}

  // ===========================================================================
  // Main Handlers
  // ===========================================================================
  public async scanSuccessHandler(fileAssetUuid: string) {
    this.logger.log(`[Timing] Starting scanSuccessHandler with file asset of ${fileAssetUuid}`);
    this.logger.log(`Processing fileAsset: ${fileAssetUuid}, scan status: ${FILE_STATUS.CLEAN}`);

    // The status update is without transaction so it can be updated as soon as possible
    await this.fileAssetEntityService.updateFileAssetStatus(fileAssetUuid, { status: FILE_STATUS.CLEAN });

    const {
      isScanCompleted,
      isAllClean,
      virusFileAssets,
      scanErrorFileAssets,
      meta: { uploadActivityUuid, transaction },
    } = await this.getTransactionScanningStatus(fileAssetUuid);
    const { uuid: transactionUuid, fileSessionId } = transaction;

    if (!isScanCompleted) {
      return this.logger.log(`Transaction scanning not complete`);
    }
    this.logger.log(`All files scanned`);

    const redisResult = await this.insertRedisForValidation(fileSessionId!);

    if (redisResult === 'OK') {
      if (isAllClean) {
        await this.allCleanHandler(uploadActivityUuid, transactionUuid, fileSessionId!);
      } else {
        await this.virusOrScanErrorHandler(uploadActivityUuid, transaction, virusFileAssets, scanErrorFileAssets);
      }
    }

    this.logger.log(`Handling post scan completed`);
    this.logger.log(`[Timing] Ended scanSuccessHandler with file asset of ${fileAssetUuid}`);
  }

  public async scanVirusOrErrorHandler(
    fileAssetUuid: string,
    status: FILE_STATUS.FAILED,
    failCategory: FILE_FAIL_CATEGORY.VIRUS | FILE_FAIL_CATEGORY.SCAN_ERROR | FILE_FAIL_CATEGORY.POST_SCAN_ERROR,
    failReason: string,
  ) {
    this.logger.log(`Processing fileAsset: ${fileAssetUuid}, scan status: ${status}, fail category: ${failCategory}`);

    // The status update is without transaction so it can be updated as soon as possible
    await this.fileAssetEntityService.updateFileAssetStatus(fileAssetUuid, { status, failCategory, failReason });

    const {
      isScanCompleted,
      virusFileAssets,
      scanErrorFileAssets,
      meta: { uploadActivityUuid, transaction },
    } = await this.getTransactionScanningStatus(fileAssetUuid);

    if (!isScanCompleted) {
      return this.logger.log(`Transaction scanning not complete`);
    }
    this.logger.log(`All files scanned`);

    const redisResult = await this.insertRedisForValidation(transaction.fileSessionId!);

    if (redisResult === 'OK') {
      // Since this scan is virus or scan, there is no need to check and call allCleanHandler
      await this.virusOrScanErrorHandler(uploadActivityUuid, transaction, virusFileAssets, scanErrorFileAssets);
    }

    this.logger.log(`Handling post scan completed`);
  }

  // ===========================================================================
  // Utility Methods
  // ===========================================================================
  protected async getTransactionScanningStatus(fileAssetUuid: string) {
    const transaction = await this.transactionEntityService.retrieveTransactionByFileAssetUuid(fileAssetUuid);
    this.logger.log(`Transaction found: ${transaction.uuid}`);

    if (!transaction.fileSessionId) {
      throw new EntityNotFoundException(COMPONENT_ERROR_CODE.POST_SCAN_EVENT_SERVICE, Transaction.name, 'fileSessionId');
    }

    // get upload activity and fileAssets
    // transaction will only have 1 upload type activity
    const uploadActivityUuid = transaction.activities!.find((activity) => activity.type === ACTIVITY_TYPE.UPLOAD)?.uuid;
    const uploadActivity = await this.activityEntityService.retrieveActivityWithFileAssetsByUuid(uploadActivityUuid!);
    const fileAssets = uploadActivity.fileAssets!;

    let isScanCompleted = true;
    let isAllClean: boolean | undefined = true;
    const virusFileAssets: FileAsset[] = [];
    const scanErrorFileAssets: FileAsset[] = [];

    for (const fileAsset of fileAssets) {
      const { status, failCategory } = fileAsset;

      // Short-circuit if any of the fileAssets are not scanned
      if (status !== FILE_STATUS.CLEAN && status !== FILE_STATUS.FAILED) {
        isScanCompleted = false;
        isAllClean = undefined;
        break;
      }

      // Update isAllClean if there is any fileAsset that failed scanning
      if (status === FILE_STATUS.FAILED) {
        isAllClean = false;

        if (failCategory === FILE_FAIL_CATEGORY.VIRUS) {
          virusFileAssets.push(fileAsset);
        }

        if (failCategory === FILE_FAIL_CATEGORY.SCAN_ERROR) {
          scanErrorFileAssets.push(fileAsset);
        }
      }
    }

    return {
      isScanCompleted,
      isAllClean,
      virusFileAssets,
      scanErrorFileAssets,
      meta: { uploadActivityUuid: uploadActivityUuid!, transaction },
    };
  }

  protected async virusOrScanErrorHandler(
    activityUuid: string,
    transaction: Transaction,
    virusFileAssets: FileAsset[],
    scanErrorFileAssets: FileAsset[],
  ) {
    // update upload activity & transaction to failed
    this.logger.log(`Transaction failed. Updating transaction and activity records to failed`);

    if (transaction.creationMethod === TRANSACTION_CREATION_METHOD.FORMSG) {
      try {
        const agencyFileAssets: FormSgTransactionVirusScanFailureAgencyFileAsset[] = [];
        virusFileAssets.forEach(({ uuid, failReason }) => {
          agencyFileAssets.push({
            uuid,
            failSubType: FORMSG_FAIL_CATEGORY.FILE_CONTAINS_VIRUS,
            failedReason: failReason ?? '',
          });
        });
        scanErrorFileAssets.forEach(({ uuid, failReason }) => {
          agencyFileAssets.push({
            uuid,
            failSubType: FORMSG_FAIL_CATEGORY.FILE_SCAN_FAILED,
            failedReason: failReason ?? '',
          });
        });

        let subType = virusFileAssets.length > 0 ? `${FORMSG_FAIL_CATEGORY.FILE_CONTAINS_VIRUS}` : '';
        scanErrorFileAssets.length > 0 && (subType += `, ${FORMSG_FAIL_CATEGORY.FILE_SCAN_FAILED}`);

        const event: FormSgTransactionFailureEvent = {
          type: EVENT_LOGGING_EVENTS.FORMSG_TRANSACTION_FAILURE,
          transactionUuid: transaction.uuid,
          failure: {
            type: FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN,
            subType,
            reason: 'Virus found / scan error',
            agencyFileAssets,
          },
        };

        await this.eventLogsServiceApiClient.post<void, AxiosResponse<void>, EventLoggingRequest>('v1/events', { event });
      } catch (error) {
        const errorMessage = `[EventLogs][virusOrScanErrorHandler] Saving to event logs failed, transactionUuid: ${
          transaction.uuid
        }, error: ${(error as AxiosError).message}`;

        this.logger.error(errorMessage);
      }
    }

    await this.updateTransactionAndUploadActivityStatuses(activityUuid, transaction.uuid, ACTIVITY_STATUS.FAILED);
    const fullTransaction = await this.transactionEntityService.retrieveTransactionWithApplicationDetailsByUuid(transaction.uuid);
    // if virus, send email
    if (virusFileAssets.length > 0 && fullTransaction.creationMethod !== TRANSACTION_CREATION_METHOD.FORMSG) {
      const virusFileAssetNames = virusFileAssets.map((fileAsset) => fileAsset.name);

      this.logger.log(`Virus found. FileAssets affected: ${virusFileAssetNames.join(', ')}`);

      const {
        notificationConfig: { emailToggleSend },
      } = this.fileSGConfigService;

      if (emailToggleSend === FEATURE_TOGGLE.ON) {
        await this.sendEmailNotificationToTransactionEservice(fullTransaction, virusFileAssetNames);
      }
    }
  }

  protected async allCleanHandler(activityUuid: string, transactionUuid: string, fileSessionId: string) {
    // update upload activity to clean
    this.logger.log(`All files clean. Updating activity record`);
    await this.updateTransactionAndUploadActivityStatuses(activityUuid, transactionUuid, ACTIVITY_STATUS.CLEAN);

    // updated to be moved queue
    this.logger.log(`Updating To Be Moved queue`);
    const transferEventsQueueMessage: SqsTransferEventsMessage = {
      fileSessionId,
    };

    await this.awsSQSService.sendMessageToQueueTransferEvents(transferEventsQueueMessage);
  }

  private async updateTransactionAndUploadActivityStatuses(activityUuid: string, transactionUuid: string, status: ACTIVITY_STATUS) {
    const txn = await this.databaseTransactionService.startTransaction();
    const { entityManager } = txn;

    try {
      await this.activityEntityService.updateActivityStatus(activityUuid, status, entityManager);
      this.logger.log(`Activity record updated`);

      if (status === ACTIVITY_STATUS.FAILED) {
        await this.transactionEntityService.updateTransactionStatus(transactionUuid, TRANSACTION_STATUS.FAILED, entityManager);
        this.logger.log(`Transaction record updated`);
      }
      await txn.commit();
    } catch (error) {
      await txn.rollback();
      throw new DatabaseException(COMPONENT_ERROR_CODE.POST_SCAN_EVENT_SERVICE, 'updating', 'activity & transaction');
    }
  }

  private async sendEmailNotificationToTransactionEservice(transaction: Transaction, virusFileAssetNames: string[]) {
    const templateType = EMAIL_TYPES.VIRUS_SCAN_ERROR;

    const { application, uuid } = transaction;
    const { externalRefId, eservice } = application!;
    const { emails: agencyEmails, agency } = eservice!;
    const { name: agencyName, code: agencyCode } = agency!;
    const recipientName = agencyCode ? `${agencyName} (${agencyCode})` : `${agencyName}`;

    const virusOrScanErrorData = {
      recipient: recipientName,
      affectedFiles: virusFileAssetNames,
      transactionId: uuid,
      externalRefId,
      fileSGConfigService: this.fileSGConfigService,
    };
    this.logger.log(`Virus Scan Data: ${JSON.stringify(virusOrScanErrorData)}`);
    const { title, content } = EmailFactory.build(templateType, virusOrScanErrorData);

    await this.emailService.sendEmail(agencyEmails, title, content);
  }

  /**
   * The purpose of this function is to utilise the nx set from redis to ensure only one insert to same key can happen
   * at the same time. By using the result of this function, we decide which post scan handler should send message to
   * transfer event queue or trigger send email
   */
  protected async insertRedisForValidation(fileSessionId: string) {
    // pre-pending post-scan into the key to avoid mixing with existing key using fileSessionId, such key will be used to
    // ensure only one sending of message to the transfer event queue
    const key = `post-scan-${fileSessionId}`;
    return await this.redisService.set(
      FILESG_REDIS_CLIENT.FILE_SESSION,
      key,
      `${new Date().toISOString()}`,
      'NX',
      this.fileSGConfigService.redisConfig.insertValidationTtlInSeconds,
    );
  }
}
