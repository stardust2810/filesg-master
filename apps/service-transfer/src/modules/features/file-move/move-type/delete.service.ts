import { DeleteObjectsCommandOutput } from '@aws-sdk/client-s3';
import { AWSException, AWSOperationLiterals, FailedDelete } from '@filesg/aws';
import { DeleteFailureMessage, DeleteSuccessMessage, FilesToDeleteMessageInfo } from '@filesg/backend-common';
import { AssumeDeleteRole, COMPONENT_ERROR_CODE, EVENT, FileDeleteInfoResponse } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';

import { DeleteActivityFilesErrorException, FailedDeleteException } from '../../../../common/custom-exceptions';
import { FileSGConfigService } from '../../../setups/config/config.service';
import { S3Service } from '../../aws/s3.service';
import { SqsService } from '../../aws/sqs.service';
import { StsService } from '../../aws/sts.service';

interface ActivitiesWithFilesToDelete {
  assumeRole: AssumeDeleteRole;
  keys: string[];
}

@Injectable()
export class DeleteService {
  private logger = new Logger(DeleteService.name);

  constructor(
    private readonly s3Service: S3Service,
    private readonly sqsService: SqsService,
    private readonly stsService: StsService,
    private fileSGConfigService: FileSGConfigService,
  ) {}

  // NOTE: File deletion will trigger revocation. To remove if file deletion no longer revokes OA
  public async handleFilesDelete(fileDeleteInfoResponse: FileDeleteInfoResponse, approximateReceiveCount: number) {
    const { fileAssetDeleteDetails, fileSession } = fileDeleteInfoResponse;
    const { id: fileSessionId } = fileSession;

    const activitiesWithFilesToDelete = fileAssetDeleteDetails.map(
      ({ assumeRole, files }): ActivitiesWithFilesToDelete => ({
        assumeRole,
        keys: files.map((file) => file.key),
      }),
    );

    const filesToDeleteMessageInfo: FilesToDeleteMessageInfo[] = fileAssetDeleteDetails.map<FilesToDeleteMessageInfo>(
      ({ transactionId, transactionType, activityId, activityType, issuerId, ownerId, files }) => ({
        transactionId,
        transactionType,
        activityId,
        activityType,
        issuerId,
        ownerId,
        files: files.map(({ fileAssetId, oaCertId }) => ({ fileAssetId, oaCertId })),
      }),
    );

    try {
      const deletePromiseResults = await Promise.allSettled(
        activitiesWithFilesToDelete.map((deleteActivity) => this.handleDeleteActivityFiles(deleteActivity)),
      );

      // Check for rejected promises
      const failedDeletes = deletePromiseResults.reduce<FailedDelete[]>((errors, item) => this.failedDeletesReducer(errors, item), []);

      if (failedDeletes.length > 0) {
        // throw error for catch block to handle
        throw new FailedDeleteException(COMPONENT_ERROR_CODE.FILE_DELETE_SERVICE, 'FailedDeletes have size more than 0', { failedDeletes });
      }

      // If success, send message to coreEvents
      const successMessage: DeleteSuccessMessage = {
        event: EVENT.FILE_DELETE_SUCCESS,
        payload: {
          fileSessionId,
          filesToDeleteMessageInfo,
        },
      };

      this.sqsService.sendMessageToQueueCoreEvents(successMessage);
    } catch (error: unknown) {
      this.logger.error(error);

      let erroneousFileRecords: Record<string, string[]> = { 'Error unknown': ['all'] };

      if (error instanceof FailedDeleteException) {
        const { failedDeletes } = error.errorData as { failedDeletes: FailedDelete[] };
        erroneousFileRecords = this.createErroneousFileRecords(failedDeletes);
      }

      this.logger.error(
        `[DeleteService - handleFilesDelete] Failed with errors: ${JSON.stringify(
          erroneousFileRecords,
        )}, approximateReceiveCount: ${approximateReceiveCount}`,
      );

      if (approximateReceiveCount >= this.fileSGConfigService.awsConfig.maxMessageReceiveCount) {
        // send message to coreEvents
        const failureMessage: DeleteFailureMessage = {
          event: EVENT.FILE_DELETE_FAILED,
          payload: {
            fileSessionId,
            filesToDeleteMessageInfo,
            erroneousFileRecords,
          },
        };

        this.sqsService.sendMessageToQueueCoreEvents(failureMessage);
      }

      throw error;
    }
  }

  // ===========================================================================
  // Private methods
  // ===========================================================================
  private async handleDeleteActivityFiles(deleteActivityFiles: ActivitiesWithFilesToDelete) {
    const { assumeRole, keys } = deleteActivityFiles;
    try {
      const cred = await this.stsService.assumeDeleteRole(assumeRole);
      const s3Client = await this.s3Service.createAssumedClient(cred);

      return await this.s3Service.deleteFilesAllVersionsFromMainBucket(keys, s3Client);
    } catch (error) {
      this.logger.error(`[DeleteService - handleDeleteActivityFiles] ${JSON.stringify(error)}`);

      const { errorData, message, errorCode } = error as AWSException;

      if (errorCode === COMPONENT_ERROR_CODE.S3_SERVICE) {
        throw new DeleteActivityFilesErrorException(COMPONENT_ERROR_CODE.FILE_DELETE_SERVICE, message, errorData);
      }

      // throw all related keys whenever unexpected error occur
      throw new DeleteActivityFilesErrorException(COMPONENT_ERROR_CODE.FILE_DELETE_SERVICE, message, { keys });
    }
  }

  /**
   * Create erroneousFileRecords that is passed as message payload to CoreEvents queue
   *
   * @param failedDeletes
   * @returns
   */
  private createErroneousFileRecords(failedDeletes: FailedDelete[]): Record<string, string[]> {
    const erroneousFileRecords: Record<string, string[]> = {};
    for (const { keys, reason } of failedDeletes) {
      /**
       * When keys are empty or undefined, add record 'all' to indicate
       * that the reason should be added to all file records affected by this deletion
       *
       * Break the loop as all records are affected
       *  */
      if (!keys || keys.length === 0) {
        erroneousFileRecords[reason] = ['all'];
        break;
      }

      if (!erroneousFileRecords[reason]) {
        erroneousFileRecords[reason] = keys.map((key) => this.extractFileAssetUuidFromKey(key));
        continue;
      }

      erroneousFileRecords[reason].push(...keys.map((key) => this.extractFileAssetUuidFromKey(key)));
    }
    return erroneousFileRecords;
  }

  /**
   * To extract the fileAssetUuid from S3 Object key that usually takes
   * the format of <path to user's bucket>/fileAssetUuid
   *
   * @param key
   * @returns
   */
  private extractFileAssetUuidFromKey(key: string): string {
    return key.split('/').at(-1) ?? key;
  }

  private failedDeletesReducer(errors: FailedDelete[], item: PromiseSettledResult<DeleteObjectsCommandOutput>) {
    if (item.status === 'rejected') {
      this.logger.error(`[DeleteService - failedDeletesReducer] failedDeletionRecord: ${JSON.stringify(item)}`);
      const {
        reason: { errorData },
      } = item;

      if (errorData) {
        const { operation } = errorData;

        switch (operation as AWSOperationLiterals) {
          case 'DELETE_ALL_FILES_VERSIONS': {
            const { metadata, errorMessage } = errorData;
            const { keys } = metadata;

            errors.push({ reason: errorMessage, keys });
            break;
          }
          case 'LIST_OBJECT_VERSIONS': {
            const { metadata, errorMessage } = errorData;

            errors.push({ reason: errorMessage, keys: [metadata.key] });
            break;
          }
          default: {
            errors.push({ reason: 'Reason unknown', keys: errorData.keys ?? [] });
            break;
          }
        }
        return errors;
      }
      errors.push({ reason: 'Reason unknown', keys: [] });
    }
    return errors;
  }
}
