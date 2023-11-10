import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';

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
