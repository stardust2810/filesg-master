import { ApiProperty } from '@nestjs/swagger';

import { ACTIVITY_STATUS, ACTIVITY_TYPE } from '../../constants/common';
import { TemplateContent } from '../../typings/acknowledgement-template';
import { BasicAgencyResponse } from '../agency/response';
import { DetailApplicationResponse } from '../application/response';
import { Timestamp } from '../common';
import { BasicEserviceResponse } from '../eservice/response';
import { BasicFileAssetResponse, FileAssetStatusResponse } from '../file/response';

// =============================================================================
// Defaults
// =============================================================================
export class BasicActivityResponse extends Timestamp {
  @ApiProperty()
  uuid: string;

  @ApiProperty({ enum: ACTIVITY_STATUS })
  status: ACTIVITY_STATUS;

  @ApiProperty({ enum: ACTIVITY_TYPE })
  type: ACTIVITY_TYPE;
}

// =============================================================================
// Service-based
// =============================================================================
export class ActivityDetailsResponse extends BasicActivityResponse {
  @ApiProperty({ type: BasicFileAssetResponse, isArray: true })
  files: BasicFileAssetResponse[];

  @ApiProperty({ type: String, isArray: true, nullable: true })
  customAgencyMessage: string[] | null;

  @ApiProperty({ type: String, nullable: true })
  transactionName: string | null;

  @ApiProperty({ type: Boolean })
  isAcknowledgementRequired: boolean;

  @ApiProperty({ type: Date, nullable: true })
  acknowledgedAt: Date | null;

  @ApiProperty({ type: DetailApplicationResponse })
  application: DetailApplicationResponse;

  @ApiProperty({ type: BasicEserviceResponse })
  eservice: BasicEserviceResponse;

  @ApiProperty({ type: BasicAgencyResponse })
  agency: BasicAgencyResponse;

  @ApiProperty()
  acknowledgementContent: TemplateContent | null;
}

export class ActivityStatusResponse {
  @ApiProperty({ enum: ACTIVITY_STATUS })
  uuid: string;

  @ApiProperty({ type: FileAssetStatusResponse, isArray: true, nullable: true })
  fileAssets?: FileAssetStatusResponse[] | null;
}

export class ActiveActivityResponse extends BasicActivityResponse {
  @ApiProperty({ type: BasicFileAssetResponse, isArray: true })
  files: BasicFileAssetResponse[];

  @ApiProperty({ type: BasicAgencyResponse })
  agency: BasicAgencyResponse;

  @ApiProperty()
  transactionName: string;

  @ApiProperty()
  isAcknowledgementRequired: boolean;

  @ApiProperty()
  acknowledgedAt: Date | null;
}

export class ActivitiesResponse {
  @ApiProperty({ type: ActiveActivityResponse, isArray: true })
  items: ActiveActivityResponse[];

  @ApiProperty()
  count: number;

  @ApiProperty({ type: Number, nullable: true })
  next: number | null;
}

export class ValidateActivityNonSingpassRetrievableResponse {
  @ApiProperty()
  isNonSingpassRetrievable: boolean;

  @ApiProperty()
  isBannedFromNonSingpassVerification: boolean;
}

export class AcknowledgeActivityResponse {
  @ApiProperty()
  acknowledgedAt: Date;
}
