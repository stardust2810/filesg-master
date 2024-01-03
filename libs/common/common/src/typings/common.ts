import { AxiosError, AxiosResponse } from 'axios';

import {
  ACTIVITY_TYPE,
  AUDIT_EVENT_NAME,
  FILE_SESSION_TYPE,
  FILE_STATUS,
  FILE_TYPE,
  RENDERER_ERROR_TYPE,
  RENDERER_MESSAGE_TYPE,
  ROLE,
  TRANSACTION_CREATION_METHOD,
  TRANSACTION_TYPE,
} from '../constants/common';
import { EserviceUserOnboardingRequestDetails, ProgrammaticUserOnboardingRequestDetails } from '../dtos/agency-onboarding/request';
import { FileDownloadSession } from './redis';

export interface AccessibleAgency {
  name: string;
  code: string;
}

// =============================================================================
// Onboarding
// =============================================================================
export type AgencyUserOnboardingDetails = (ProgrammaticUserOnboardingRequestDetails | EserviceUserOnboardingRequestDetails)[];

export type FileSgProgrammaticUserRole = ROLE.SYSTEM | ROLE.PROGRAMMATIC_SYSTEM_INTEGRATION;
export type AgencyProgrammaticUserRole = ROLE.PROGRAMMATIC_READ | ROLE.PROGRAMMATIC_WRITE;
export type ProgrammaticUserRole = FileSgProgrammaticUserRole | AgencyProgrammaticUserRole;

export type EserviceUserRole = ROLE.FORMSG;
// =============================================================================
// DB query options
// =============================================================================
export interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

// =============================================================================
// File management
// =============================================================================
export type Metadata = Record<string, string | number | boolean>;

export interface FileAccessDetails {
  fileAssetUuid: string;
  key: string;
}

export interface TransferFileUpdates {
  name: string;
  type: FILE_TYPE;
  size: number;
  isPasswordEncrypted: boolean;
}

export interface TransferFile {
  from: FileAccessDetails;
  to: FileAccessDetails;
  name?: string;
  isPasswordEncryptionRequired?: boolean;
  encryptedAgencyPassword?: string;
  updates?: TransferFileUpdates;
}

// File Management actions
export interface FileTransfer {
  activityId: string;
  assumeRole: AssumeMoveRole;
  files: TransferFile[];
  encryptedPassword?: string;
}

export type FileSessionResponse = FileMoveInfoResponse | FileDeleteInfoResponse;

export interface TransactionDetails {
  id: string;
  type: TRANSACTION_TYPE;
  creationMethod?: TRANSACTION_CREATION_METHOD;
}

export interface FileMoveSessionDetails {
  id: string;
  type: FILE_SESSION_TYPE.UPLOAD | FILE_SESSION_TYPE.TRANSFER;
}

export interface FileDeleteSessionInfo {
  id: string;
  type: FILE_SESSION_TYPE.DELETE;
}

export interface FileMoveInfoResponse {
  fileSession: FileMoveSessionDetails;
  transaction: TransactionDetails;
  fromBucket: string;
  toBucket: string;
  transfers: FileTransfer[];
}

export interface FileDeleteInfoResponse {
  fileSession: FileDeleteSessionInfo;
  fileAssetDeleteDetails: FileAssetDeleteDetails[];
}

export interface FileAssetDeleteDetails {
  transactionId: number;
  transactionType: TRANSACTION_TYPE;
  activityId: number;
  activityType: ACTIVITY_TYPE;
  assumeRole: AssumeDeleteRole;
  issuerId: number;
  ownerId: number;
  files: DeleteFileAsset[];
}

export interface DeleteFileAsset {
  fileAssetId: number;
  key: string;
  oaCertId: string | null;
}

// Assume roles
export interface AssumeUploadMoveRole {
  receiver: string;
}

export interface AssumeTransferMoveRole {
  owner: string;
  receiver: string;
}

export interface AssumeDeleteRole {
  owner: string;
}

export type AssumeMoveRole = AssumeUploadMoveRole | AssumeTransferMoveRole;

export type AgencyPassword = Record<string, string>;

export type ViewableFileStatus = FILE_STATUS.ACTIVE | FILE_STATUS.EXPIRED | FILE_STATUS.REVOKED;
export type ActivatedFileStatus =
  | FILE_STATUS.ACTIVE
  | FILE_STATUS.EXPIRED
  | FILE_STATUS.REVOKED
  | FILE_STATUS.PENDING_DELETE
  | FILE_STATUS.DELETED;

// =============================================================================
// Download response
// =============================================================================
export interface FileDownloadResponse extends FileDownloadSession {
  ownerUuidHash: string;
}

export interface FileDownloadInfo {
  id: string;
  name: string;
}

// =============================================================================
// Errors
// =============================================================================
export interface FileSGErrorData extends Record<string, any> {
  data: { message: string; errorCode: string };
}

export type FileSGAxiosErrorResponse = AxiosResponse<FileSGErrorData>;

export interface IFileSGError extends AxiosError {
  response: FileSGAxiosErrorResponse;
}

// =============================================================================
// Frontend common
// =============================================================================
export type RendererMessage = RendererErrorMessage | RendererProfileImageLoadedMessage;

export interface RendererErrorMessage extends RendererEventMessage {
  type: RENDERER_MESSAGE_TYPE.ERROR;
  errorType: RENDERER_ERROR_TYPE;
}

export interface RendererProfileImageLoadedMessage extends RendererEventMessage {
  type: RENDERER_MESSAGE_TYPE.PROFILE_IMAGE_LOADED;
}

export interface RendererEventMessage {
  type: RENDERER_MESSAGE_TYPE;
  message: string;
}

// =============================================================================
// Audit events
// =============================================================================
export type UserFileAuditEvent =
  | AUDIT_EVENT_NAME.USER_FILE_DOWNLOAD
  | AUDIT_EVENT_NAME.USER_FILE_PRINT_SAVE
  | AUDIT_EVENT_NAME.USER_FILE_VIEW;

export type UserActionAuditEvent = UserFileAuditEvent | AUDIT_EVENT_NAME.USER_LOGIN;

export type FileStatisticAuditEvent = UserActionAuditEvent | AUDIT_EVENT_NAME.AGENCY_FILE_DOWNLOAD;
