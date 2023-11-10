import { ACTIVITY_TYPE, FILE_SESSION_TYPE, TRANSACTION_TYPE, USER_TYPE } from '../constants/common';
import { DownloadFile, TransactionDetails, TransferFileUpdates } from './common';

// =============================================================================
// File Session
// =============================================================================
export type FileSession = FileManageSession | FileDownloadSession;
export type FileManageSession = FileUploadMoveSession | FileTransferMoveSession | FileDeleteSession;

// File Move Session
export interface FileSessionUser {
  id: string;
  type: USER_TYPE;
}

export interface FileSessionFile {
  ownerFileAssetId: string;
  receiverFileAssetId: string;
}

export type FileUploadMoveSessionTransferFile = Pick<FileSessionFile, 'ownerFileAssetId'> & {
  name?: string;
  isPasswordEncryptionRequired?: boolean;
  encryptedAgencyPassword?: string;
};

// update property to determine whether to update receiver file asset
export type FileTransferMoveSessionTransferFile = FileSessionFile & {
  updates?: TransferFileUpdates;
};

export interface FileUploadMoveSessionTransfer {
  activityId: string;
  owner: FileSessionUser;
  files: FileUploadMoveSessionTransferFile[];
}

export interface FileTransferMoveSessionTransfer {
  activityId: string;
  owner: FileSessionUser;
  receiver: FileSessionUser;
  files: FileTransferMoveSessionTransferFile[];
  encryptedPassword?: string;
}

export interface FileUploadMoveSession extends FileSessionBase {
  type: FILE_SESSION_TYPE.UPLOAD;
  transfers: FileUploadMoveSessionTransfer[];
}

export interface FileTransferMoveSession extends FileSessionBase {
  type: FILE_SESSION_TYPE.TRANSFER;
  transfers: FileTransferMoveSessionTransfer[];
}

export interface FileSessionBase {
  type: FILE_SESSION_TYPE;
  transaction: TransactionDetails;
}

// File Delete Session
export interface FileDeleteSession {
  type: FILE_SESSION_TYPE.DELETE;
  fileAssetDeleteSessionDetails: FileAssetDeleteSessionDetails[];
}

export interface FileAssetDeleteSessionDetails {
  transactionId: number;
  transactionType: TRANSACTION_TYPE;
  activityId: number;
  activityType: ACTIVITY_TYPE;
  issuerId: number;
  owner: FileDeleteSessionFilesOwner;
  files: FileDeleteSessionFile[];
}

export interface FileDeleteSessionFile {
  fileAssetId: number;
  fileAssetUuid: string;
  oaCertId: string | null;
}

export interface FileDeleteSessionFilesOwner {
  ownerId: number;
  ownerUuid: string;
}

// =============================================================================
// File Download Session
// =============================================================================
export interface FileDownloadSession {
  type: FILE_SESSION_TYPE.DOWNLOAD;
  ownerUuid: string;
  files: DownloadFile[];
}

// =============================================================================
// File Upload Auth Session
// =============================================================================
export interface FileUploadAuthSession {
  type: FILE_SESSION_TYPE.UPLOAD_AUTH;
  transactionUuid: string;
}
