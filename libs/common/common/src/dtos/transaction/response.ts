import { ApiProperty } from '@nestjs/swagger';

import { NOTIFICATION_CHANNEL, TRANSACTION_STATUS, TRANSACTION_TYPE } from '../../constants/common';
import { ActivityStatusResponse } from '../activity/response';
import { Timestamp } from '../common';
import { CreateFileTransactionRecipientResponse, CreateTransactionFileResponse } from '../file/response';

// =============================================================================
// Defaults
// =============================================================================
export class BasicTransactionResponse extends Timestamp {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: TRANSACTION_STATUS })
  status: TRANSACTION_STATUS;

  @ApiProperty({ enum: TRANSACTION_TYPE })
  type: TRANSACTION_TYPE;

  @ApiProperty({ type: String, isArray: true, nullable: true })
  customAgencyMessage: string[] | null;
}

// =============================================================================
// Service-based
// =============================================================================
export class TransactionStatusResponse {
  @ApiProperty({ enum: TRANSACTION_TYPE })
  type: TRANSACTION_TYPE;

  @ApiProperty({ enum: TRANSACTION_STATUS })
  status: TRANSACTION_STATUS;

  @ApiProperty({ type: ActivityStatusResponse, isArray: true })
  activities: ActivityStatusResponse[];

  @ApiProperty({ type: Date })
  updatedAt: Date;
}

export class CreateFileTransactionResponse {
  @ApiProperty()
  accessToken: string | null;

  @ApiProperty()
  transactionUuid: string;

  @ApiProperty({ type: CreateTransactionFileResponse, isArray: true })
  files: CreateTransactionFileResponse[];

  @ApiProperty({ type: CreateFileTransactionRecipientResponse, isArray: true })
  recipients: CreateFileTransactionRecipientResponse[];
}

export class CreateFormSgFileTransactionResponse extends CreateFileTransactionResponse {
  @ApiProperty()
  notificationChannels: NOTIFICATION_CHANNEL[];
}

export class CreateRevokeTransactionResponse {
  @ApiProperty()
  revokeTransactionUuid: string;

  @ApiProperty({ type: String, isArray: true })
  revokedFileAssetUuids: string[];
}

export class RevokeTransactionResponseDto {
  @ApiProperty({ type: String, isArray: true })
  revokedFileAssets: string[];
}

export class UpdateRecipientInfoResponse {
  @ApiProperty({ description: 'request id' })
  traceId: string;
}

export class RecallTransactionResponse {
  @ApiProperty()
  transactionUuid: string;
}

