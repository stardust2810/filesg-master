import { ApiProperty } from '@nestjs/swagger';

import { ROLE, SSO_ESERVICE, STATUS, USER_TYPE } from '../../constants/common';
import { AccessibleAgency } from '../../typings/common';
import { Timestamp } from '../common';

// =============================================================================
// Defaults
// =============================================================================
export class BasicUserResponse extends Timestamp {
  @ApiProperty()
  uuid: string;

  @ApiProperty({ type: String, nullable: true })
  name: string | null;

  @ApiProperty({ enum: USER_TYPE })
  type: USER_TYPE;

  @ApiProperty({ enum: ROLE })
  role: ROLE;

  @ApiProperty()
  isOnboarded: boolean;

  @ApiProperty({ enum: STATUS })
  status: STATUS;
}

export class DetailUserResponse extends BasicUserResponse {
  @ApiProperty({ type: String, nullable: true })
  email: string | null;

  @ApiProperty({ type: String, nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ type: Date, nullable: true })
  lastLoginAt: Date | null;

  @ApiProperty({ type: String })
  maskedUin: string | null;
}

// =============================================================================
// Service-based
// =============================================================================
export class UserSessionDetailsResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty({ enum: USER_TYPE })
  type: USER_TYPE;

  @ApiProperty({ type: String, nullable: true })
  maskedUin: string | null;

  @ApiProperty({ type: String, nullable: true })
  name: string | null;

  @ApiProperty({ enum: ROLE })
  role: ROLE;

  @ApiProperty()
  isOnboarded: boolean | null;

  @ApiProperty()
  lastLoginAt: Date | null;

  @ApiProperty()
  createdAt: Date | null;

  @ApiProperty()
  expiresAt: Date | null;

  @ApiProperty()
  sessionLengthInSecs: number;

  @ApiProperty()
  extendSessionWarningDurationInSecs: number;

  @ApiProperty({ enum: SSO_ESERVICE, nullable: true })
  ssoEservice: SSO_ESERVICE | null;

  @ApiProperty({ type: String, nullable: true })
  corporateUen: string | null;

  @ApiProperty({ type: String, nullable: true })
  corporateName: string | null;

  @ApiProperty()
  accessibleAgencies: AccessibleAgency[] | null;
}

export class UserSessionDestroyedResposne {
  @ApiProperty()
  loginTime: Date | null;

  @ApiProperty()
  logoutTime: Date | null;
}

export class EserviceProgrammaticUserResponse {
  @ApiProperty()
  uuid: string;

  @ApiProperty()
  eserviceId: string;

  @ApiProperty()
  eserviceName: string;

  @ApiProperty()
  clientId: string;

  @ApiProperty()
  secretKey: string;
}

export class CheckDuplicateEmailResponse {
  @ApiProperty()
  isDuplicate: boolean;
}

export class SingpassLoginParamsResponse {
  @ApiProperty()
  clientId: string;

  @ApiProperty()
  redirectUrl: string;
}

export class AgencyBasicInfoResponse {
  @ApiProperty()
  agencyCode: string;

  @ApiProperty()
  agencyName: string;
}

export class AgencyListResponse {
  @ApiProperty()
  agencies: AgencyBasicInfoResponse[];
}
