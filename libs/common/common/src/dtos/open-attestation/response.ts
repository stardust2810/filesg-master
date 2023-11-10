import { VerificationFragment } from '@govtechsg/oa-verify';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { OA_CERTIFICATE_STATUS, OA_REVOCATION_REASON_CODE, REVOCATION_TYPE } from '../../constants/common';
import { Timestamp } from '../common';
import { BasicUserResponse } from '../user/response';

export class CertificateRevocationResponse {
  @ApiProperty()
  revoked: boolean;

  @ApiProperty()
  documentHash: string;

  @ApiPropertyOptional({ enum: OA_REVOCATION_REASON_CODE })
  reasonCode?: OA_REVOCATION_REASON_CODE;
}

export class BasicOACertificateResponse extends Timestamp {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: OA_CERTIFICATE_STATUS })
  status: OA_CERTIFICATE_STATUS;

  @ApiProperty({ enum: REVOCATION_TYPE })
  revocationType: REVOCATION_TYPE | null;
}

export class DetailOACertificateResponse extends BasicOACertificateResponse {
  @ApiProperty()
  reason: string | null;

  @ApiProperty({ type: BasicUserResponse })
  revokedBy: BasicUserResponse | null;
}

export class CertificateVerificationResponse {
  isValid: boolean;
  fragments: VerificationFragment[];
}
