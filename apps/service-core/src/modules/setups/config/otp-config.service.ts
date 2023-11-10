import { FEATURE_TOGGLE, numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

@Injectable()
export class OtpConfigService {
  constructor(private configService: ConfigService<OtpEnvironmentVariables>) {}

  get otpLength() {
    return this.configService.get('OTP_LENGTH', { infer: true })!;
  }
  get otpExpirySeconds() {
    return this.configService.get('OTP_EXPIRY_SECONDS', { infer: true })!;
  }
  get resendWaitSeconds() {
    return this.configService.get('OTP_RESEND_WAIT_SECONDS', { infer: true })!;
  }
  get maxValidationAttemptCount() {
    return this.configService.get('OTP_MAX_VALIDATION_ATTEMPT_COUNT', { infer: true })!;
  }
  get redisRecordExpiryBuffer() {
    return this.configService.get('OTP_REDIS_RECORD_EXPIRY_BUFFER', { infer: true })!;
  }
  get maxAllowedOtpSentPerCycle() {
    return this.configService.get('OTP_MAX_ALLOWED_SENT_PER_CYCLE', { infer: true })!;
  }
  get toggleMock() {
    return this.configService.get('OTP_TOGGLE_MOCK', { infer: true })!;
  }
  get mockString() {
    return this.configService.get('OTP_MOCK_STRING', { infer: true })!;
  }
}

export class OtpEnvironmentVariables {
  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OTP_LENGTH: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OTP_EXPIRY_SECONDS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OTP_RESEND_WAIT_SECONDS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OTP_MAX_VALIDATION_ATTEMPT_COUNT: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OTP_REDIS_RECORD_EXPIRY_BUFFER: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OTP_MAX_ALLOWED_SENT_PER_CYCLE: number;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  OTP_TOGGLE_MOCK: FEATURE_TOGGLE;

  @Expose()
  @IsString()
  OTP_MOCK_STRING: string;
}
