import {
  EVENT_LOGGING_EVENTS,
  FORMSG_PROCESS_FAIL_TYPE,
  FORMSG_TRANSACTION_FAIL_TYPE,
  FormSgBatchProcessCompleteEvent,
  FormSgBatchProcessFailureEvent,
  FormSgBatchProcessTransactionFailureEvent,
  FormSgBatchProcessTransactionSuccessEvent,
  FormSgBatchProcessUpdateEvent,
  FormSgIssuanceBasePayloadTransaction,
  FormSgIssuanceBatchFailureMessagePayload,
  FormSgIssuanceBatchProcessFailureMessagePayload,
  FormSgIssuanceBatchSuccessMessagePayload,
  FormSgIssuanceBatchTransactionFailureMessagePayload,
  FormSgIssuanceFailureMessage,
  FormSgIssuanceFailureMessagePayload,
  FormSgIssuanceMessageBasePayload,
  FormSgIssuanceSingleFailureMessagePayload,
  FormSgIssuanceSingleSuccessMessagePayload,
  FormSgIssuanceSuccessMessage,
  FormSgIssuanceSuccessMessageBasePayload,
  FormSgIssuanceSuccessMessagePayload,
  FormSgProcessBatchCreateTxnFailure,
  FormSgProcessBatchFileUploadFailure,
  FormSgProcessCreateTxnFailure,
  FormSgProcessFailureEvent,
  FormSgProcessFileUploadFailure,
  FormSgProcessInitEvent,
  FormSgProcessSuccessEvent,
  FormSgRecipientNotificationDeliveryFailureEvent,
  FormSgRecipientNotificationDeliverySuccessEvent,
  FormSgTransactionFailureEvent,
  FormSgTransactionSuccessEvent,
  RESULT_STATUS,
} from '@filesg/backend-common';
import { COMPONENT_ERROR_CODE, EVENT } from '@filesg/common';
import { Injectable, Logger } from '@nestjs/common';
import { classToPlain } from 'class-transformer';

import { FailedToSaveException, UnknownAgencyFileAssetsException } from '../../../common/filters/custom-exceptions.filter';
import {
  EmailNotificationInfo,
  FormSgTransaction,
  FormSgTransactionUpdateModel,
  NotificationBase,
  SgNotifyNotificationInfo,
} from '../../../entities/formsg-transaction';
import { FormSgTransactionEntityService } from '../../entities/formsg-transaction/formsg-transaction.entity.service';
import { SqsService } from '../aws/sqs.service';

@Injectable()
export class FormSgTransactionService {
  private readonly logger = new Logger(FormSgTransactionService.name);

  constructor(private readonly formSgTransactionEntityService: FormSgTransactionEntityService, private readonly sqsService: SqsService) {}

  public async handleProcessInit(event: FormSgProcessInitEvent) {
    const { ids, queueEventTimestamp, processorStartedTimestamp, batchId } = event;

    const createFormSgTransactionPromises = ids.map((id) => {
      return this.formSgTransactionEntityService.createFormSgTransaction({
        id,
        queueEventTimestamp,
        processorStartedTimestamp,
        processes: [],
        batchId,
      });
    });

    const createFormSgTransactionPromisesResult = await Promise.allSettled(createFormSgTransactionPromises);
    const rejectedTxns = createFormSgTransactionPromisesResult
      .filter((result) => result.status === 'rejected')
      .map((x) => (x as PromiseRejectedResult).reason);
    if (rejectedTxns.length > 0) {
      throw new FailedToSaveException(COMPONENT_ERROR_CODE.EVENTS_SERVICE, JSON.stringify(rejectedTxns));
    }
  }

  public async handleProcessUpdate(event: FormSgBatchProcessUpdateEvent) {
    const { id, requestorEmail, batchSize } = event;

    await this.formSgTransactionEntityService.updateFormSgTransaction(
      { id },
      {
        $SET: {
          requestorEmail,
          batchSize,
          processedTransactionCount: 0,
          failedTransactionCount: 0,
          failedNotificationCount: 0,
        },
      },
    );
  }

  public async handleBatchProcessComplete(event: FormSgBatchProcessCompleteEvent) {
    const { id, timestamp } = event;

    await this.formSgTransactionEntityService.updateFormSgTransaction(
      { id },
      {
        $SET: {
          processorEndedTimestamp: timestamp,
        },
        $ADD: { processes: [{ timestamp, result: RESULT_STATUS.SUCCESS }] },
      },
    );
  }

  public async handleProcessSuccess(event: FormSgProcessSuccessEvent | FormSgBatchProcessTransactionSuccessEvent) {
    const plainEvent = classToPlain(event) as FormSgProcessSuccessEvent | FormSgBatchProcessTransactionSuccessEvent;

    let requestorEmail: string | undefined = undefined;
    if (plainEvent.type === EVENT_LOGGING_EVENTS.FORMSG_PROCESS_SUCCESS) {
      requestorEmail = plainEvent.requestorEmail;
    }
    const { id, timestamp, application, transaction, transactionUuid, notificationsToSendCount } = plainEvent;

    await this.formSgTransactionEntityService.updateFormSgTransaction(
      { id },
      {
        $SET: {
          processorEndedTimestamp: timestamp,
          requestorEmail,
          application,
          transaction,
          transactionUuid,
          notificationsToSendCount,
          notificationsSent: [],
        },
        $ADD: { processes: [{ timestamp, result: RESULT_STATUS.SUCCESS }] },
      },
    );
  }

  public async handleProcessFailure(
    event: FormSgProcessFailureEvent | FormSgBatchProcessTransactionFailureEvent | FormSgBatchProcessFailureEvent,
  ) {
    const { id, timestamp, failure } = event;

    const { type: failType, reason: failedReason, subType: failSubType } = failure;
    let requestorEmail: string | undefined = undefined;
    if (failure.type === FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION) {
      requestorEmail = failure.requestorEmail;
    }

    let updates: FormSgTransactionUpdateModel = {
      processorEndedTimestamp: timestamp,
      result: RESULT_STATUS.FAILURE,
      failedReason,
      failType,
      failSubType,
      requestorEmail,
    };

    if (failType === FORMSG_PROCESS_FAIL_TYPE.CREATE_TXN || failType === FORMSG_PROCESS_FAIL_TYPE.FILE_UPLOAD) {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { type, subType, reason, ...rest } = classToPlain(failure) as
        | FormSgProcessCreateTxnFailure
        | FormSgProcessFileUploadFailure
        | FormSgProcessBatchCreateTxnFailure
        | FormSgProcessBatchFileUploadFailure;
      updates = { ...updates, ...rest };
    }

    const formSgTransaction = await this.formSgTransactionEntityService.updateFormSgTransaction(
      { id },
      {
        $SET: updates,
        $ADD: {
          processes: [{ timestamp, result: RESULT_STATUS.FAILURE, failedReason }],
        },
      },
    );

    // if failType is batch validation, send msg to core to inform end of batch processing immediately
    if (failType === FORMSG_PROCESS_FAIL_TYPE.BATCH_VALIDATION || failType === FORMSG_PROCESS_FAIL_TYPE.BATCH_OTHERS) {
      return await this.sendIssuanceFailureMessageToQueueCoreEvents(
        this.generateBatchIssuanceMessagePayload(formSgTransaction) as FormSgIssuanceBatchFailureMessagePayload,
      );
    }

    await this.validateAndHandleFailureTxnCompletion(formSgTransaction);
  }

  public async handleTransactionSuccess(event: FormSgTransactionSuccessEvent) {
    await this.formSgTransactionEntityService.updateFormSgTransactionByTransactionUuid(event.transactionUuid, {
      result: RESULT_STATUS.SUCCESS,
    });
  }

  public async handleTransactionFailure(event: FormSgTransactionFailureEvent) {
    const { transactionUuid, failure } = event;
    const { type: failType, subType: failSubType, reason: failedReason } = failure;

    const result = await this.formSgTransactionEntityService.findFormSgTransactionsByTransactionUuid(transactionUuid, true);
    const [{ id }] = result;

    const updates: FormSgTransactionUpdateModel = {
      result: RESULT_STATUS.FAILURE,
      failType: FORMSG_TRANSACTION_FAIL_TYPE.OTHERS,
      failSubType,
      failedReason,
    };

    if (failType === FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN) {
      const [{ transaction }] = result;
      const { uuid: transactionUuid, agencyFileAssets } = transaction!;

      this.validateAgencyFileAssetUuids(
        failure.agencyFileAssets.map(({ uuid }) => uuid),
        agencyFileAssets.map(({ uuid }) => uuid!),
        transactionUuid!,
      );

      const uuidToFailedReasonMap: Record<string, { failedReason: string; failSubType: string }> = {};

      failure.agencyFileAssets.forEach(({ uuid, failSubType, failedReason }) => {
        uuidToFailedReasonMap[uuid] = { failSubType, failedReason };
      });

      const newAgencyFileAssets = transaction!.agencyFileAssets.map((fileAsset) => ({
        ...fileAsset,
        failSubType: uuidToFailedReasonMap[fileAsset.uuid!]?.failSubType,
        failedReason: uuidToFailedReasonMap[fileAsset.uuid!]?.failedReason,
      }));

      updates['failType'] = FORMSG_TRANSACTION_FAIL_TYPE.VIRUS_SCAN;
      updates['transaction'] = { ...transaction!, agencyFileAssets: newAgencyFileAssets };
    }

    const formSgTransaction = await this.formSgTransactionEntityService.updateFormSgTransaction({ id }, updates);

    await this.validateAndHandleFailureTxnCompletion(formSgTransaction);
  }

  public async handleRecipientNotificationDelivery(
    event: FormSgRecipientNotificationDeliverySuccessEvent | FormSgRecipientNotificationDeliveryFailureEvent,
  ) {
    const { type, transactionUuid, ...rest } = event;
    const isSuccessfulDelivery = type === EVENT_LOGGING_EVENTS.FORMSG_RECIPIENT_NOTIFICATION_DELIVERY_SUCCESS;

    const object: NotificationBase = { ...rest, status: isSuccessfulDelivery ? RESULT_STATUS.SUCCESS : RESULT_STATUS.FAILURE };

    const formSgTransaction = await this.formSgTransactionEntityService.updateFormSgTransactionByTransactionUuid(transactionUuid, {
      $ADD: {
        notificationsSent: [object as EmailNotificationInfo | SgNotifyNotificationInfo],
      },
    });

    const { notificationsSent, notificationsToSendCount, batchId } = formSgTransaction;

    // gd TODO: update test
    // check if txn's notificationSent's length === notificationToSendCount
    if (notificationsSent?.length === notificationsToSendCount) {
      // if this txn belongs to a batch
      if (batchId) {
        // increment the batch's processedTransactionCount by 1
        const batchHeaderRecord = await this.formSgTransactionEntityService.updateFormSgTransaction(
          { id: batchId },
          { $ADD: { processedTransactionCount: 1, ...(!isSuccessfulDelivery && { failedNotificationCount: 1 }) } },
        );

        const { batchSize, processedTransactionCount, failedTransactionCount } = batchHeaderRecord;

        // if the batch has all the transcation processed at this moment
        if (batchSize === processedTransactionCount) {
          if (failedTransactionCount! > 0) {
            return await this.sendIssuanceFailureMessageToQueueCoreEvents(
              this.generateBatchIssuanceMessagePayload(batchHeaderRecord) as FormSgIssuanceFailureMessagePayload,
            );
          }

          // send batch issuance completion message to info service core
          await this.sendIssuanceSuccessMessageToQueueCoreEvents(
            this.generateBatchIssuanceMessagePayload(batchHeaderRecord) as FormSgIssuanceSuccessMessagePayload,
          );
        }
      } else {
        // send single issuance completion message to info service core
        await this.sendIssuanceSuccessMessageToQueueCoreEvents(
          this.generateIssuanceMessagePayload(formSgTransaction) as FormSgIssuanceSuccessMessagePayload,
        );
      }
    } else {
      if (batchId && !isSuccessfulDelivery) {
        await this.formSgTransactionEntityService.updateFormSgTransaction({ id: batchId }, { $ADD: { failedNotificationCount: 1 } });
      }
    }
  }

  protected generateIssuanceMessagePayload(
    formSgTransaction: FormSgTransaction,
  ): FormSgIssuanceSuccessMessagePayload | FormSgIssuanceFailureMessagePayload {
    const { id, requestorEmail, notificationsSent, queueEventTimestamp, transaction, application, failType } = formSgTransaction;
    const { agencyFileAssets, recipientActivities, name, uuid } = transaction!;

    const base: FormSgIssuanceMessageBasePayload = {
      issuanceId: id,
      requestorEmail: requestorEmail!,
      queueEventTimestamp,
    };

    const baseTransaction: FormSgIssuanceBasePayloadTransaction = {
      applicationType: application!.type,
      name,
      fileNames: agencyFileAssets.map((file) => file.name),
      recipientNames: recipientActivities.map((activity) => activity.name),
    };

    if (failType) {
      const failureMessagePayload = base as FormSgIssuanceSingleFailureMessagePayload;

      failureMessagePayload['failType'] = failType;

      (failureMessagePayload as FormSgIssuanceSingleFailureMessagePayload)['transaction'] = baseTransaction;
      return failureMessagePayload;
    }

    const successMessagePayload = base as FormSgIssuanceSingleSuccessMessagePayload;

    successMessagePayload['hasNotificationToRecipientFailure'] = notificationsSent!.some((notification) => !!notification.failedReason);
    (successMessagePayload as FormSgIssuanceSingleSuccessMessagePayload)['transaction'] = {
      uuid: uuid!,
      ...baseTransaction,
    };

    return successMessagePayload;
  }

  protected generateBatchIssuanceMessagePayload(
    batchHeaderRecord: FormSgTransaction,
  ): FormSgIssuanceSuccessMessageBasePayload | FormSgIssuanceBatchProcessFailureMessagePayload {
    const { id, requestorEmail, queueEventTimestamp, failType, failSubType, failedNotificationCount, batchSize, failedTransactionCount } =
      batchHeaderRecord;
    const hasNotificationToRecipientFailure = failedNotificationCount! > 0;

    const base: FormSgIssuanceMessageBasePayload = {
      issuanceId: id,
      requestorEmail: requestorEmail!,
      queueEventTimestamp,
    };

    if (failType) {
      const failureMessagePayload: FormSgIssuanceBatchProcessFailureMessagePayload = {
        ...base,
        failType: failType as FORMSG_PROCESS_FAIL_TYPE,
        failSubType: failSubType!,
      };
      return failureMessagePayload;
    }

    if (failedTransactionCount! > 0) {
      const failureMessagePayload: FormSgIssuanceBatchTransactionFailureMessagePayload = {
        ...base,
        hasNotificationToRecipientFailure,
        batchSize: batchSize!,
        failedTransactionCount: failedTransactionCount!,
      };
      return failureMessagePayload;
    }

    const successMessagePayload: FormSgIssuanceBatchSuccessMessagePayload = {
      ...base,
      hasNotificationToRecipientFailure,
    };

    return successMessagePayload;
  }

  protected async sendIssuanceSuccessMessageToQueueCoreEvents(payload: FormSgIssuanceSuccessMessagePayload) {
    const message: FormSgIssuanceSuccessMessage = { event: EVENT.FORMSG_ISSUANCE_SUCCESS, payload };
    await this.sqsService.sendMessageToQueueCoreEvents(message);
  }

  protected async sendIssuanceFailureMessageToQueueCoreEvents(payload: FormSgIssuanceFailureMessagePayload) {
    const message: FormSgIssuanceFailureMessage = {
      event: EVENT.FORMSG_ISSUANCE_FAILURE,
      payload,
    };

    await this.sqsService.sendMessageToQueueCoreEvents(message);
  }

  protected validateAgencyFileAssetUuids(newFileAssetUuids: string[], existingAgencyFileAssetUuids: string[], transactionUuid: string) {
    const unknownAgencyFileAssetUuids: string[] = [];

    newFileAssetUuids.forEach((uuid) => {
      if (!existingAgencyFileAssetUuids.includes(uuid)) {
        unknownAgencyFileAssetUuids.push(uuid);
      }
    });

    if (unknownAgencyFileAssetUuids.length > 0) {
      throw new UnknownAgencyFileAssetsException(COMPONENT_ERROR_CODE.FORMSG_SERVICE, transactionUuid, unknownAgencyFileAssetUuids);
    }
  }

  protected async validateAndHandleFailureTxnCompletion(formSgTransaction: FormSgTransaction) {
    const { batchId } = formSgTransaction;

    if (batchId) {
      // increment the batch's processedTransactionCount and failedTransactionCount by 1
      const batchHeaderRecord = await this.formSgTransactionEntityService.updateFormSgTransaction(
        { id: batchId },
        { $ADD: { processedTransactionCount: 1, failedTransactionCount: 1 } },
      );

      const { batchSize, processedTransactionCount } = batchHeaderRecord;

      // if the batch has all the transcation processed at this moment
      if (batchSize === processedTransactionCount) {
        // send batch issuance completion message to info service core
        await this.sendIssuanceFailureMessageToQueueCoreEvents(
          this.generateBatchIssuanceMessagePayload(batchHeaderRecord) as FormSgIssuanceFailureMessagePayload,
        );
      }
    } else {
      // send single issuance completion message to info service core
      await this.sendIssuanceFailureMessageToQueueCoreEvents(
        this.generateIssuanceMessagePayload(formSgTransaction) as FormSgIssuanceFailureMessagePayload,
      );
    }
  }
}
