import { ApiProperty } from '@nestjs/swagger';

export class CheckStatusResponse {
  @ApiProperty()
  verificationAttemptCount: number;

  @ApiProperty()
  expireAt: Date;

  @ApiProperty()
  allowResendAt: Date;
}
