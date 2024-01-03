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
  @ApiProperty({
    description: 'Use the JWT as the bearer token when calling file-upload api',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0cmFuc2FjdGlvblV1aWQiOiJ0cmFuc2FjdGlvbi14eHh4eHh4eHh4eHh4LXh4eHh4eHh4eHh4eHh4eHgiLCJ0eXBlIjoiZmlsZS11cGxvYWQiLCJpYXQiOjE3MDExNTI5NzcsImV4cCI6MTcwMTE1MzAzN30.TbM_04hA41dBNNiXrQNwFsIThIXLYO2-VrkS9KJz-1Y',
  })
  accessToken: string | null;

  @ApiProperty({ example: 'transaction-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx' })
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
  @ApiProperty({ type: String, isArray: true, example: ['fileasset-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx'] })
  revokedFileAssets: string[];
}

export class UpdateRecipientInfoResponse {
  @ApiProperty({
    description: 'trace id for the request made. Provide this id to FileSG team for debugging.',
    example: '845aabb7-1e83-4511-bd4d-7316c843e85e',
  })
  traceId: string;
}

export class RecallTransactionResponse {
  @ApiProperty({ example: 'transaction-xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx' })
  transactionUuid: string;
}
