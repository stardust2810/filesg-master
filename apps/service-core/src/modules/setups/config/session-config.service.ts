import { FEATURE_TOGGLE, numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsEnum, IsNumber } from 'class-validator';

@Injectable()
export class SessionConfigService {
  constructor(private configService: ConfigService<SessionEnvironmentVariables>) {}

  get sessionLengthInSecs() {
    return this.configService.get('SESSION_LENGTHS_SECS', { infer: true })!;
  }

  get extendSessionWarningDurationInSecs() {
    return this.configService.get('EXTEND_SESSION_WARNING_DURATION_SECS', { infer: true })!;
  }

  get absoluteSessionExpiryInMins() {
    return this.configService.get('ABSOLUTE_SESSION_EXPIRY_MINS', { infer: true })!;
  }

  get toggleConcurrentSession() {
    return this.configService.get('TOGGLE_CONCURRENT_SESSION', { infer: true })!;
  }
}

export class SessionEnvironmentVariables {
  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  SESSION_LENGTHS_SECS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  EXTEND_SESSION_WARNING_DURATION_SECS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  ABSOLUTE_SESSION_EXPIRY_MINS: number;

  @Expose()
  @IsEnum(FEATURE_TOGGLE)
  TOGGLE_CONCURRENT_SESSION: FEATURE_TOGGLE;
}
