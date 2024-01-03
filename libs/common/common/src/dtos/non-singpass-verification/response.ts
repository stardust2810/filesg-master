import { ApiProperty } from '@nestjs/swagger';

import { OtpDetailsResponse } from '../common';

export class Verify1FaNonSingpassResponse {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  maskedMobile?: string;

  @ApiProperty()
  maskedEmail?: string;
}

export class Send2FaOtpNonSingpassResponse extends OtpDetailsResponse {}

export class Verify2FaOtpNonSingpassResponse {
  @ApiProperty()
  sessionId: string;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  tokenExpiry: string;

  @ApiProperty()
  expiryDurationSecs: number;

  @ApiProperty()
  warningDurationSecs: number;
}
