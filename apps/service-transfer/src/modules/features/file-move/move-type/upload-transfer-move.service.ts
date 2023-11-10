import { FailedMove, MoveFilesFailureException } from '@filesg/aws';
import {
  LogMethod,
  MoveFailedMessageTransfer,
  MoveFailedMessageTransferFile,
  TransferMoveCompletedMessage,
  TransferMoveFailedMessage,
  UnknownFileSessionTypeException,
  UploadMoveCompletedMessage,
  UploadMoveFailedMessage,
} from '@filesg/backend-common';
import {
  AssumeMoveRole,
  AssumeTransferMoveRole,
  AssumeUploadMoveRole,
  COMPONENT_ERROR_CODE,
  EVENT,
  FEATURE_TOGGLE,
  FILE_SESSION_TYPE,
  FILE_TYPE,
  FileMoveInfoResponse,
  FileMoveSessionDetails,
  FileTransfer,
  TRANSACTION_TYPE,
  TransactionDetails,
} from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { FileSGConfigService } from '../../../setups/config/config.service';
import { CopyTransferFilesEncrypted, EncryptedFileAssetUuidToNewSizeMap, S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';

const isAssumeUploadMoveRole = (assumeRole: AssumeMoveRole): assumeRole is AssumeUploadMoveRole => {
  return !!assumeRole.receiver && (assumeRole as AssumeTransferMoveRole).owner === undefined;
};

@Injectable()
export class UploadAndTransferMoveService {
  private logger = new Logger(UploadAndTransferMoveService.name);

  constructor(
    private readonly sqsService: SqsService,
    private readonly s3Service: S3Service,
    private readonly stsService: StsService,
    private readonly fileSGConfigService: FileSGConfigService,
  ) {}

  @LogMethod({ keysToRedact: ['assumeRole', 'files', 'encryptedAgencyPassword'] })
  public async handleUploadAndTransferMove(transferInfo: FileMoveInfoResponse, approximateReceiveCount: number): Promise<void> {
    const { fileSession, transaction, transfers } = transferInfo;
    const fileSessionType = fileSession.type;

    if (fileSessionType !== FILE_SESSION_TYPE.UPLOAD && fileSessionType !== FILE_SESSION_TYPE.TRANSFER) {
      throw new UnknownFileSessionTypeException(COMPONENT_ERROR_CODE.UPLOAD_TRANSFER_MOVE_SERVICE, fileSessionType, 'handle');
    }

    try {
      const movePromiseResults = await this.handleMoveTransfer(transferInfo);

      // assuming there is always only one transfer for upload-move event (stg-clean to agency main bucket)
      if (fileSessionType === FILE_SESSION_TYPE.UPLOAD && movePromiseResults[0].status === 'fulfilled') {
        // delete all files from stg-clean
        await this.deleteAllFilesFromBucket(fileSessionType, transfers);

        if (movePromiseResults[0].value) {
          const { encryptedPassword, fileAssetUuidToNewSizeMap } = movePromiseResults[0].value!;

          return await this.sendUploadMoveCompletedMessage(
            fileSession,
            transaction,
            transfers,
            encryptedPassword,
            fileAssetUuidToNewSizeMap,
          );
        }

        return await this.sendUploadMoveCompletedMessage(fileSession, transaction, transfers);
      }

      return await this.sendTransferMoveCompletedMessage(fileSession, transaction, transfers);
    } catch (error) {
      // TODO: should rethrow the error after handle the failed move exception
      // Parent should handle this rethrow error and know is it retryable
      if (error instanceof MoveFilesFailureException) {
        let isRetryable = true;
        let reason = 'Message failed processing 3 times.';

        if (fileSessionType === FILE_SESSION_TYPE.UPLOAD) {
          isRetryable = error.failedMoves[0].isRetryable;
        }

        reason = isRetryable ? reason : 'Message failed in upload move handler which is non retryable.';

        // TODO: non retryable need to go dlq?
        if (!isRetryable) {
          return await this.handleFailedMoveException(error.failedMoves, transferInfo, reason);
        }

        if (approximateReceiveCount >= this.fileSGConfigService.awsConfig.maxMessageReceiveCount) {
          await this.handleFailedMoveException(error.failedMoves, transferInfo, reason);
        }
      }

      throw error;
    }
  }

  protected async handleMoveTransfer(transferInfo: FileMoveInfoResponse) {
    const { fileSession, fromBucket, toBucket, transfers } = transferInfo;
    const fileSessionType = fileSession.type;

    const movePromises = transfers.map(async (transfer) => {
      const { assumeRole, files } = transfer;

      if (files.length > 0) {
        const creds = await this.stsService.assumeMoveRole(fileSessionType, assumeRole);
        const s3Client = await this.s3Service.createAssumedClient(creds);

        //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #START#
        if (
          this.fileSGConfigService.systemConfig.toggleUploadMoveFailure === FEATURE_TOGGLE.ON &&
          fileSessionType === FILE_SESSION_TYPE.UPLOAD
        ) {
          const failedMoves: FailedMove[] = files.map(({ from, to }) => ({
            reason: 'TOGGLE UPLOAD MOVE FAILURE IS ON',
            isRetryable: false,
            fromKey: from.key,
            toKey: to.key,
          }));
          throw new MoveFilesFailureException(COMPONENT_ERROR_CODE.UPLOAD_TRANSFER_MOVE_SERVICE, failedMoves);
        }

        if (
          this.fileSGConfigService.systemConfig.toggleTransferMoveFailure === FEATURE_TOGGLE.ON &&
          fileSessionType === FILE_SESSION_TYPE.TRANSFER
        ) {
          const failedMoves: FailedMove[] = files.map(({ from, to }) => ({
            reason: 'TOGGLE TRANSFER MOVE FAILURE IS ON',
            isRetryable: false,
            fromKey: from.key,
            toKey: to.key,
          }));
          throw new MoveFilesFailureException(COMPONENT_ERROR_CODE.UPLOAD_TRANSFER_MOVE_SERVICE, failedMoves);
        }
        //FIXME: FOR TESTING FILEZCAD-1379. REMOVE AFTER TESTING #END#

        return await this.s3Service.copyTransferFiles(
          files,
          fromBucket,
          toBucket,
          s3Client,
          isAssumeUploadMoveRole(assumeRole) ? assumeRole : undefined,
        );
      }
    });

    const movePromiseResults = await Promise.allSettled(movePromises);
    await this.validateMovePromiseResults(movePromiseResults, transferInfo);

    return movePromiseResults;
  }

  @LogMethod({ keysToRedact: ['assumeRole', 'files', 'encryptedPassword'] })
  protected async validateMovePromiseResults(
    movePromiseResults: PromiseSettledResult<CopyTransferFilesEncrypted | undefined>[],
    transferInfo: FileMoveInfoResponse,
  ) {
    const {
      fileSession: { type: fileSessionType },
      transfers,
    } = transferInfo;

    const failedFileAssetUuids: string[] = [];

    const allTransfersFailedMoves: FailedMove[] = [];
    const otherRejectedErrors: string[] = [];

    movePromiseResults.forEach((result, index) => {
      const { files: transferFiles } = transfers[index];

      if (result.status === 'rejected') {
        if (result.reason.failedMoves) {
          const failedMoves = result.reason.failedMoves as FailedMove[];

          allTransfersFailedMoves.push(...failedMoves);
          const failedMoveToKeys = failedMoves.map((move) => move.toKey);
          transferFiles.forEach(({ to }) => failedMoveToKeys.includes(to.key) && failedFileAssetUuids.push(to.fileAssetUuid));
        } else {
          otherRejectedErrors.push(result.reason.message);
        }
      }
    });

    if (otherRejectedErrors.length > 0) {
      throw new Error(otherRejectedErrors.join(', '));
    }

    if (allTransfersFailedMoves.length > 0) {
      const failedMovePromises = transfers.map((transfer) => this.validateMoveTransfer(fileSessionType, transfer, failedFileAssetUuids));

      // we are not handling the error here (if any), only trying to delete as much as possible
      await Promise.allSettled(failedMovePromises);
      throw new MoveFilesFailureException(COMPONENT_ERROR_CODE.S3_SERVICE, allTransfersFailedMoves);
    }
  }

  // to remove those successfully transferred files in main bucket, where those failed files have been deleted in handleMoveTransfer operation

  @LogMethod()
  protected async validateMoveTransfer(
    fileSessionType: FILE_SESSION_TYPE,
    transfer: FileTransfer,
    failedFileAssetUuids: string[],
  ): Promise<void> {
    // is handled means already handled by previous operation (handleMoveTransfer) to remove from main bucket,
    // previous operation will remove the copied object in main bucket if any other object failed to move to main bucket within the same transfer
    const isHandled = transfer.files.some(({ to }) => failedFileAssetUuids.includes(to.fileAssetUuid));

    // if within this transfer there is no failure, means they were all copied, then will need to delete them
    if (!isHandled && transfer.files.length > 0) {
      const creds = await this.stsService.assumeMoveRole(fileSessionType, transfer.assumeRole);
      const s3Client = await this.s3Service.createAssumedClient(creds);

      const keysToDelete = transfer.files.map((file) => file.to.key);
      this.logger.log(`keys to delete: ${keysToDelete}`);
      await this.s3Service.deleteFilesAllVersionsFromMainBucket(keysToDelete, s3Client);
    }
  }

  protected async handleFailedMoveException(
    failedMoves: FailedMove[],
    transferInfo: FileMoveInfoResponse,
    handleReason = 'Message failed processing 3 times.',
  ): Promise<void> {
    const { fileSession, transaction, transfers } = transferInfo;
    this.logger.log(handleReason);

    if (transaction.type !== TRANSACTION_TYPE.TRANSFER) {
      await this.deleteAllFilesFromBucket(fileSession.type, transfers);
    }

    const failedMoveToKeys = failedMoves.map((move) => move.toKey);
    const failedMoveReasons = failedMoves.map((move) => move.reason);

    const resultTransfers: MoveFailedMessageTransfer[] = [];

    transfers.forEach(({ activityId, files }) => {
      const failedFileAssets: MoveFailedMessageTransferFile[] = [];

      files.forEach((file) => {
        const foundIndex = failedMoveToKeys.indexOf(file.to.key);

        // if the file's toKey matches the one failed to be moved
        if (foundIndex !== -1) {
          failedFileAssets.push({ id: file.to.fileAssetUuid, error: failedMoveReasons[foundIndex] });
        }
      });

      if (failedFileAssets.length > 0) {
        resultTransfers.push({ activityId, files: failedFileAssets });
      }
    });

    await this.sendMoveFailedMessage(fileSession, transaction, resultTransfers);
  }

  @LogMethod({ keysToRedact: ['assumeRole', 'encryptedAgencyPassword'] })
  protected async sendUploadMoveCompletedMessage(
    fileSession: FileMoveSessionDetails,
    transaction: TransactionDetails,
    transfers: FileTransfer[],
    encryptedPassword?: string,
    fileAssetUuidToNewSizeMap?: EncryptedFileAssetUuidToNewSizeMap,
  ): Promise<void> {
    this.logger.log('Sending upload move completed event message to to-be-updated queue');

    const message: UploadMoveCompletedMessage = {
      event: EVENT.FILES_UPLOAD_MOVE_COMPLETED,
      payload: {
        fileSession,
        transaction,
        transfers: transfers.map(({ activityId, files }) => ({
          activityId: activityId,
          files: files.map(({ to, isPasswordEncryptionRequired, name }) => {
            if (isPasswordEncryptionRequired && name && fileAssetUuidToNewSizeMap) {
              return {
                id: to.fileAssetUuid,
                updates: {
                  name: this.reconcileZipEncryptedFileName(name),
                  type: FILE_TYPE.ZIP,
                  size: fileAssetUuidToNewSizeMap[to.fileAssetUuid],
                  isPasswordEncrypted: isPasswordEncryptionRequired,
                },
              };
            }

            return { id: to.fileAssetUuid };
          }),
          encryptedPassword,
        })),
      },
    };

    await this.sqsService.sendMessageToQueueCoreEvents(message);
  }

  /**
   * - If FileSG knows the extension, replace
   * - Else, append the name with the correct extension as last part might not be intended to be an extension
   * - If no extension is given, append the correct extension
   */
  protected reconcileZipEncryptedFileName(name: string): string {
    const splittedName = name.split('.');

    if (splittedName.length <= 1) {
      return `${splittedName[0]}.${FILE_TYPE.ZIP}`;
    }

    const lastPart = splittedName[splittedName.length - 1];

    if (
      Object.values<string>(FILE_TYPE)
        .filter((type) => type !== FILE_TYPE.UNKNOWN)
        .includes(lastPart)
    ) {
      splittedName[splittedName.length - 1] = FILE_TYPE.ZIP;
      return splittedName.join('.');
    }

    return `${name}.${FILE_TYPE.ZIP}`;
  }

  @LogMethod({ keysToRedact: ['assumeRole', 'files'] })
  protected async sendTransferMoveCompletedMessage(
    fileSession: FileMoveSessionDetails,
    transaction: TransactionDetails,
    transfers: FileTransfer[],
  ): Promise<void> {
    this.logger.log('Sending transfer move completed event message to to-be-updated queue');

    const message: TransferMoveCompletedMessage = {
      event: EVENT.FILES_TRANSFER_MOVE_COMPLETED,
      payload: {
        fileSession,
        transaction,
        transfers: transfers.map(({ activityId, files, encryptedPassword }) => ({
          activityId: activityId,
          files: files.map((file) => ({ id: file.to.fileAssetUuid, updates: file.updates })),
          encryptedPassword,
        })),
      },
    };

    await this.sqsService.sendMessageToQueueCoreEvents(message);
  }

  @LogMethod()
  protected async sendMoveFailedMessage(
    fileSession: FileMoveSessionDetails,
    transaction: TransactionDetails,
    transfers: MoveFailedMessageTransfer[],
  ): Promise<void> {
    const event = fileSession.type === FILE_SESSION_TYPE.UPLOAD ? EVENT.FILES_UPLOAD_MOVE_FAILED : EVENT.FILES_TRANSFER_MOVE_FAILED;

    this.logger.log(`Sending move failed event (${event}) message to core-events queue`);

    const failureMessage: UploadMoveFailedMessage | TransferMoveFailedMessage = {
      event,
      payload: {
        fileSession,
        transaction,
        transfers,
      },
    };

    await this.sqsService.sendMessageToQueueCoreEvents(failureMessage);
  }

  @LogMethod({ keysToRedact: ['assumeRole', 'encryptedAgencyPassword'] })
  protected async deleteAllFilesFromBucket(fileSessionType: FILE_SESSION_TYPE, transfers: FileTransfer[]): Promise<void> {
    this.logger.log('Deleting files in bucket');
    const filesToRemove = [
      ...new Set(
        transfers.reduce<string[]>((result, item) => {
          item.files.forEach((file) => result.push(file.from.key));
          return result;
        }, []),
      ),
    ];

    const creds = await this.stsService.assumeMoveRole(fileSessionType, transfers[0].assumeRole);
    const s3Client = await this.s3Service.createAssumedClient(creds);

    if (fileSessionType === FILE_SESSION_TYPE.UPLOAD) {
      await this.s3Service.deleteFilesFromStgCleanBucket(filesToRemove, s3Client);
    } else if (fileSessionType === FILE_SESSION_TYPE.TRANSFER) {
      await this.s3Service.deleteFilesAllVersionsFromMainBucket(filesToRemove, s3Client);
    }
  }
}
