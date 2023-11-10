import { ApiProperty } from '@nestjs/swagger';

import { FILE_ASSET_ACTION, REVOCATION_TYPE, USER_TYPE } from '../../constants/common';
import { Timestamp } from '../common';

// =============================================================================
// Defaults
// =============================================================================
export class BasicFileAssetHistoryResponse extends Timestamp {
  @ApiProperty()
  uuid: string;
}

export class DetailFileAssetHistoryResponse extends BasicFileAssetHistoryResponse {
  @ApiProperty({ enum: FILE_ASSET_ACTION })
  type: FILE_ASSET_ACTION;
}

// =============================================================================
// Service-based
// =============================================================================

export class FileHistory {
  @ApiProperty()
  id: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ enum: FILE_ASSET_ACTION })
  type: FILE_ASSET_ACTION;

  @ApiProperty({ enum: REVOCATION_TYPE })
  revocationType?: REVOCATION_TYPE;

  @ApiProperty()
  actionBy: string;

  @ApiProperty({ enum: USER_TYPE })
  actionByType: USER_TYPE;
}
export class FileHistoryDisplayResponse {
  @ApiProperty({ type: FileHistory, isArray: true })
  fileHistory: FileHistory[];

  @ApiProperty()
  totalRecords: number;

  @ApiProperty()
  nextPage: number | null;
}
