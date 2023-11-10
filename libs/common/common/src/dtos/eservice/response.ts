import { ApiProperty } from '@nestjs/swagger';

import { Timestamp } from '../common';

// =============================================================================
// Defaults
// =============================================================================
export class BasicEserviceResponse extends Timestamp {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;
}

export class DetailEserviceResponse extends BasicEserviceResponse {
  @ApiProperty()
  email: string;
}

// =============================================================================
// Service-based
// =============================================================================
