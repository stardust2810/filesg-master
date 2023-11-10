import { numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

@Injectable()
export class NonSingpassAuthConfigService {
  constructor(private configService: ConfigService<NonSingpassAuthEnvironmentVariables>) {}

  get max1FaVerificationAttemptCount() {
    return this.configService.get('NON_SINGPASS_AUTH_MAX_1FA_VERIFICATION_ATTEMPT_COUNT', { infer: true })!;
  }
  get jwt2FATokenExpirationDuration() {
    return this.configService.get('NON_SINGPASS_AUTH_JWT_2FA_TOKEN_EXPIRATION_DURATION', { infer: true })!;
  }
  get jwtContentRetrievalTokenExpirationDurationSeconds() {
    return this.configService.get('NON_SINGPASS_AUTH_JWT_CONTENT_RETRIEVAL_TOKEN_EXPIRATION_DURATION_SECS', { infer: true })!;
  }
  get jwtContentRetrievalTokenWarningDurationSeconds() {
    return this.configService.get('NON_SINGPASS_AUTH_JWT_CONTENT_RETRIEVAL_TOKEN_WARNING_DURATION_SECS', { infer: true })!;
  }
}

export class NonSingpassAuthEnvironmentVariables {
  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  NON_SINGPASS_AUTH_MAX_1FA_VERIFICATION_ATTEMPT_COUNT: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  NON_SINGPASS_AUTH_JWT_2FA_TOKEN_EXPIRATION_DURATION: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  NON_SINGPASS_AUTH_JWT_CONTENT_RETRIEVAL_TOKEN_EXPIRATION_DURATION_SECS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  NON_SINGPASS_AUTH_JWT_CONTENT_RETRIEVAL_TOKEN_WARNING_DURATION_SECS: number;
}
