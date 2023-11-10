import { OTP_CHANNEL,OTP_TYPE } from '@filesg/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class OtpCheckRequest {
  @IsNotEmpty()
  @IsEnum(OTP_TYPE)
  @ApiProperty({ enum: OTP_TYPE })
  type: OTP_TYPE;

  @IsNotEmpty()
  @IsEnum(OTP_CHANNEL)
  @ApiProperty({ enum: OTP_CHANNEL })
  channel: OTP_CHANNEL;
}
