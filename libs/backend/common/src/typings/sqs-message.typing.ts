import {
  ACTIVITY_TYPE,
  EVENT,
  FILE_TYPE,
  FileMoveSessionDetails,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_TYPE,
  TransactionDetails,
  TransferFileUpdates,
} from '@filesg/common';

import { FORMSG_PROCESS_FAIL_TYPE, FORMSG_TRANSACTION_FAIL_TYPE } from '../constants/formsg.constant';

// =============================================================================
// Core Events Queue
// =============================================================================
export type SqsCoreEventsMessage =
  | UploadToStgMessage
  | PostScanMessage
  | MoveMessage
  | DownloadMessage
  | DeleteMessage
  | FormSgIssuanceSuccessMessage
  | FormSgIssuanceFailureMessage;

// Upload to stg event
export type UploadToStgMessage = UploadToStgCompletedMessage | UploadToStgFailedMessage;

export interface UploadToStgCompletedMessage {
  event: EVENT.FILES_UPLOAD_TO_STG_COMPLETED;
  payload: {
    fileAssetInfos: FileAssetMetaData[];
    transactionId: string;
  };
}

export interface UploadToStgFailedMessage {
  event: EVENT.FILES_UPLOAD_TO_STG_FAILED;
  payload: {
    failedFiles: FailedFileAsset[];
    transactionId: string;
    creationMethod?: TRANSACTION_CREATION_METHOD; //TODO: optional for V1
  };
}

export interface FailedFileAsset {
  fileAssetId: string;
  failedReason: string;
}

export interface FileAssetMetaData {
  fileAssetId: string;
  fileName: string;
  fileType: FILE_TYPE;
  size: number;
  oaCertificateId?: string;
  oaCertificateHash?: string;
  metadata?: string;
  isPasswordEncryptionRequired?: boolean;
  encryptedAgencyPassword?: string;
}

// Post scan event
export type PostScanMessage = PostScanSuccessMessage | PostScanFailureMessage;

export interface PostScanSuccessMessage {
  event: EVENT.FILE_SCAN_SUCCESS;
  payload: PostScanSuccessPayload;
}

export interface PostScanFailureMessage {
  event: EVENT.FILE_SCAN_VIRUS | EVENT.FILE_SCAN_ERROR | EVENT.POST_SCAN_ERROR;
  payload: PostScanFailurePayload;
}

export interface PostScanSuccessPayload {
  fileAssetId: string;
}

export interface PostScanFailurePayload {
  fileAssetId: string;
  error: string;
}

// Move events
export type MoveMessage = UploadMoveCompletedMessage | UploadMoveFailedMessage | TransferMoveCompletedMessage | TransferMoveFailedMessage;

export interface UploadMoveCompletedMessage {
  event: EVENT.FILES_UPLOAD_MOVE_COMPLETED;
  payload: MoveCompletedMessagePayload;
}

export interface UploadMoveFailedMessage {
  event: EVENT.FILES_UPLOAD_MOVE_FAILED;
  payload: MoveFailedMessagePayload;
}

export interface TransferMoveCompletedMessage {
  event: EVENT.FILES_TRANSFER_MOVE_COMPLETED;
  payload: MoveCompletedMessagePayload;
}

export interface TransferMoveFailedMessage {
  event: EVENT.FILES_TRANSFER_MOVE_FAILED;
  payload: MoveFailedMessagePayload;
}

export interface MoveCompletedMessageTransferFile {
  id: string;
  updates?: TransferFileUpdates;
  isPasswordEncryptionRequired?: boolean;
  agencyPassword?: string;
}

export interface MoveFailedMessageTransferFile {
  id: string;
  error: string;
}

export interface MoveCompletedMessageTransfer {
  activityId: string;
  files: MoveCompletedMessageTransferFile[];
  encryptedPassword?: string;
}

export interface MoveFailedMessageTransfer {
  activityId: string;
  files: MoveFailedMessageTransferFile[];
}

export interface MoveCompletedMessagePayload extends MoveMessagePayload {
  transfers: MoveCompletedMessageTransfer[];
}

export interface MoveFailedMessagePayload extends MoveMessagePayload {
  transfers: MoveFailedMessageTransfer[];
}

export interface MoveMessagePayload {
  fileSession: FileMoveSessionDetails;
  transaction: TransactionDetails;
}

// Download Event
export interface DownloadMessage {
  event: EVENT.FILES_DOWNLOADED;
  payload: DownloadMessagePayload;
}

export interface DownloadMessagePayload {
  fileAssetIds: string[];
}

// Delete Event
export type DeleteMessage = DeleteSuccessMessage | DeleteFailureMessage;

export interface DeleteSuccessMessage {
  event: EVENT.FILE_DELETE_SUCCESS;
  payload: DeleteSuccessMessagePayload;
}

export interface DeleteFailureMessage {
  event: EVENT.FILE_DELETE_FAILED;
  payload: DeleteFailedMessagePayload;
}

export interface DeleteFailedMessagePayload {
  fileSessionId: string;
  filesToDeleteMessageInfo: FilesToDeleteMessageInfo[];
  erroneousFileRecords: Record<string, string[]>;
}
export interface DeleteSuccessMessagePayload {
  fileSessionId: string;
  filesToDeleteMessageInfo: FilesToDeleteMessageInfo[];
}

export interface FilesToDeleteMessageInfo {
  transactionId: number;
  transactionType: TRANSACTION_TYPE;
  activityId: number;
  activityType: ACTIVITY_TYPE;
  issuerId: number;
  ownerId: number;
  files: DeleteMessageFileDetails[];
}

export interface DeleteMessageFileDetails {
  fileAssetId: number;
  oaCertId: string | null;
}
// FormSg Issuance Event
export const isSuccessFormSgIssuance = (
  messageBody: FormSgIssuanceSuccessMessage | FormSgIssuanceFailureMessage,
): messageBody is FormSgIssuanceSuccessMessage => messageBody.event === EVENT.FORMSG_ISSUANCE_SUCCESS;

export interface FormSgIssuanceBasePayloadTransaction {
  applicationType: string;
  name: string;
  fileNames: string[];
  recipientNames: string[];
}

export type FormSgIssuanceSuccessPayloadTransaction = FormSgIssuanceBasePayloadTransaction & { uuid: string };
export type FormSgIssuanceFailurePayloadTransaction = FormSgIssuanceBasePayloadTransaction;

export interface FormSgIssuanceMessageBasePayload {
  issuanceId: string;
  requestorEmail: string;
  queueEventTimestamp: string;
}

export type FormSgIssuanceSuccessMessageBasePayload = FormSgIssuanceMessageBasePayload & {
  hasNotificationToRecipientFailure: boolean;
};

export type FormSgIssuanceSingleSuccessMessagePayload = FormSgIssuanceSuccessMessageBasePayload & {
  transaction: FormSgIssuanceSuccessPayloadTransaction;
};

export type FormSgIssuanceBatchSuccessMessagePayload = FormSgIssuanceSuccessMessageBasePayload;

export type FormSgIssuanceFailureMessageBasePayload = FormSgIssuanceMessageBasePayload & {
  failType: FORMSG_PROCESS_FAIL_TYPE | FORMSG_TRANSACTION_FAIL_TYPE;
};

export type FormSgIssuanceSingleFailureMessagePayload = FormSgIssuanceFailureMessageBasePayload & {
  transaction: FormSgIssuanceFailurePayloadTransaction;
};

export type FormSgIssuanceBatchProcessFailureMessagePayload = Omit<FormSgIssuanceFailureMessageBasePayload, 'failType'> & {
  failType: FORMSG_PROCESS_FAIL_TYPE;
  failSubType: string;
};

export type FormSgIssuanceBatchTransactionFailureMessagePayload = Omit<FormSgIssuanceFailureMessageBasePayload, 'failType'> & {
  hasNotificationToRecipientFailure: boolean;
  batchSize: number;
  failedTransactionCount: number;
};

export type FormSgIssuanceBatchFailureMessagePayload =
  | FormSgIssuanceBatchProcessFailureMessagePayload
  | FormSgIssuanceBatchTransactionFailureMessagePayload;

export type FormSgIssuanceSuccessMessagePayload = FormSgIssuanceSingleSuccessMessagePayload | FormSgIssuanceBatchSuccessMessagePayload;
export type FormSgIssuanceFailureMessagePayload = FormSgIssuanceSingleFailureMessagePayload | FormSgIssuanceBatchFailureMessagePayload;

export interface FormSgIssuanceSuccessMessage {
  event: EVENT.FORMSG_ISSUANCE_SUCCESS;
  payload: FormSgIssuanceSuccessMessagePayload;
}

export interface FormSgIssuanceFailureMessage {
  event: EVENT.FORMSG_ISSUANCE_FAILURE;
  payload: FormSgIssuanceFailureMessagePayload;
}

// =============================================================================
// To Be Moved Queue
// =============================================================================
export interface SqsTransferEventsMessage {
  fileSessionId: string;
}
