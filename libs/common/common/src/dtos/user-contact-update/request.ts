import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumberString, ValidateIf } from 'class-validator';

import { OTP_CHANNEL } from '../../constants/common';
import { EitherOr, IsASCIICharactersOnlyString, IsValidSgMobile } from '../../validators';

export class UserContactUpdateSendOtpRequest {
  @EitherOr('mobile')
  @ValidateIf((req: UserContactUpdateSendOtpRequest) => !!req.email)
  @IsNotEmpty()
  @IsEmail()
  @IsASCIICharactersOnlyString()
  @ApiProperty()
  email?: string;

  @EitherOr('email')
  @ValidateIf((req: UserContactUpdateSendOtpRequest) => !!req.mobile)
  @IsNotEmpty()
  @IsValidSgMobile()
  @ApiProperty()
  mobile?: string;
}

export class UserContactUpdateVerifyOtpRequest {
  @IsNotEmpty()
  @IsEnum(OTP_CHANNEL)
  @ApiProperty({ enum: OTP_CHANNEL })
  channel: OTP_CHANNEL;

  @IsNotEmpty()
  @IsNumberString()
  @ApiProperty()
  inputOtp: string;
}
