import { ApiProperty } from '@nestjs/swagger';

import { STATUS } from '../../constants/common';
import { BasicApplicationResponse } from '../application/response';
import { Timestamp } from '../common';

// =============================================================================
// Defaults
// =============================================================================
export class BasicAgencyResponse extends Timestamp {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  code: string;
}

export class DetailAgencyResponse extends BasicAgencyResponse {
  @ApiProperty({ enum: STATUS })
  status: STATUS;
}

// =============================================================================
// Service-based
// =============================================================================
// TODO: moved these to respective response file

export class ImportEServiceResponse {
  @ApiProperty()
  eserviceUuid: string;

  @ApiProperty()
  eserviceName: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  clientSecret: string;

  @ApiProperty({ type: BasicApplicationResponse, isArray: true })
  applications: BasicApplicationResponse[];
}

export class ImportAgencyResponse {
  @ApiProperty()
  agencyName: string;

  @ApiProperty()
  agencyUuid: string;

  @ApiProperty({ type: ImportEServiceResponse, isArray: true })
  eservices: ImportEServiceResponse[];
}
