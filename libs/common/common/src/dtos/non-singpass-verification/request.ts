import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

import { OTP_CHANNEL } from '../../constants/common';
import { IsValidFileSGDate } from '../../validators';

export class Verify1FaNonSingpassRequest {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  activityUuid: string;

  @IsNotEmpty()
  @IsString()
  @Length(9, 9)
  @ApiProperty()
  uin: string;

  @IsNotEmpty()
  @IsValidFileSGDate({ allowEmptyMonthDay: true, allowedDate: 'PAST' })
  @ApiProperty({ example: '1995-00-00' })
  dob: string;
}

export class Verify2FaOtpNonSingpassRequest {
  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty()
  inputOtp: string;
}

export class Send2FaOtpNonSingpassRequest {
  @IsString()
  @IsIn([OTP_CHANNEL.EMAIL, OTP_CHANNEL.SMS])
  @IsNotEmpty()
  @ApiProperty()
  channel: OTP_CHANNEL;
}
