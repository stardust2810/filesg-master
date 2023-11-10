import { ApiProperty } from '@nestjs/swagger';

import { FILE_FAIL_CATEGORY, FILE_STATUS, FILE_TYPE, TRANSACTION_CREATION_METHOD } from '../../constants/common';
import { Metadata } from '../../typings/common';
import { Timestamp } from '../common';

// =============================================================================
// Defaults
// =============================================================================
export class BasicFileAssetResponse extends Timestamp {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: FILE_TYPE })
  type: FILE_TYPE;

  @ApiProperty()
  size: number;

  @ApiProperty({ enum: FILE_STATUS })
  status: FILE_STATUS;

  @ApiProperty({ type: Date, nullable: true })
  expireAt: Date | null;

  @ApiProperty({ type: Date, nullable: true })
  deleteAt: Date | null;

  @ApiProperty()
  isExpired: boolean;

  @ApiProperty()
  isDeleted: boolean;

  @ApiProperty()
  isPasswordEncrypted: boolean;
}

export class DetailFileAssetResponse extends BasicFileAssetResponse {
  @ApiProperty({ description: 'Record<string, string>', nullable: true })
  metadata: Metadata | null;

  @ApiProperty({ type: Date, nullable: true })
  lastViewedAt: Date | null;
}

// =============================================================================
// Service-based
// =============================================================================
export class ViewableFileAssetResponse extends DetailFileAssetResponse {
  @ApiProperty()
  agencyName: string;

  @ApiProperty()
  eServiceName: string;

  @ApiProperty()
  agencyCode: string;

  @ApiProperty()
  ownerName: string;

  @ApiProperty()
  receiveTransferActivityUuid: string;

  @ApiProperty({ nullable: true })
  receiveDeleteActivityUuid: string | null;

  @ApiProperty()
  isAcknowledgementRequired: boolean;

  @ApiProperty({ type: Date, nullable: true })
  acknowledgedAt: Date | null;

  @ApiProperty({ type: String, nullable: true })
  externalRefId: string | null;
}

export class ViewableFileAssetFromAgencyResponse extends BasicFileAssetResponse {
  @ApiProperty()
  metadata: Metadata | null;

  @ApiProperty()
  agencyName: string;

  @ApiProperty()
  eServiceName: string;

  @ApiProperty()
  agencyCode: string;

  @ApiProperty({ type: String, nullable: true })
  externalRefId: string | null;
}

export class AllFileAssetsResponse {
  @ApiProperty({ type: ViewableFileAssetResponse, isArray: true })
  items: ViewableFileAssetResponse[];

  @ApiProperty()
  count: number;

  @ApiProperty({ type: Number, nullable: true })
  next: number | null;
}

export class AllFileAssetsFromAgencyResponse {
  @ApiProperty({ type: ViewableFileAssetResponse, isArray: true })
  items: ViewableFileAssetFromAgencyResponse[];

  @ApiProperty()
  count: number;

  @ApiProperty({ type: Number, nullable: true })
  next: number | null;
}

export class FileAssetStatusResponse {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ enum: FILE_STATUS })
  status: FILE_STATUS;

  @ApiProperty({ type: String, nullable: true })
  failReason: string | null;

  @ApiProperty({ enum: FILE_FAIL_CATEGORY, nullable: true })
  failCategory: FILE_FAIL_CATEGORY | null;
}

export class AllFileAssetUuidsResponse {
  @ApiProperty()
  fileAssets: string[];
}
export interface FileInfo {
  name: string;
  checksum: string;
  fileAssetId: string;
  isPasswordEncryptionRequired?: boolean;
  encryptedAgencyPassword?: string;
}

export class CreateFileTransactionRecipientResponse {
  @ApiProperty()
  uin: string;

  @ApiProperty()
  activityUuid: string;
}

export class FileUploadTransactionInfo {
  transactionUuid: string;
  creationMethod?: TRANSACTION_CREATION_METHOD; //TODO: optional for V1
  files: FileInfo[];
  recipients: CreateFileTransactionRecipientResponse[];
}

export class FileUploadAgencyInfo {
  name: string;
  code: string;
  sk: string;
  identityProofLocation: string;
}

export class CheckAndDeleteFileSessionResponse {
  @ApiProperty()
  userUuid: string;
  @ApiProperty()
  agencyInfo: FileUploadAgencyInfo;
  @ApiProperty()
  transactionInfo: FileUploadTransactionInfo;
}

export class CreateTransactionFileResponse {
  @ApiProperty({ type: String })
  name: string;

  @ApiProperty({ type: String })
  uuid: string;
}

export class FileQrCodeResponse {
  @ApiProperty()
  token: string;
}
