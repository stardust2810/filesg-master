import { ApiProperty } from '@nestjs/swagger';

import { Timestamp } from '../common';

// =============================================================================
// Defaults
// =============================================================================
export class BasicApplicationResponse extends Timestamp {
  @ApiProperty()
  uuid: string;
}

export class DetailApplicationResponse extends BasicApplicationResponse {
  @ApiProperty({ type: String, nullable: true })
  externalRefId: string | null;
}

// =============================================================================
// Service-based
// =============================================================================
