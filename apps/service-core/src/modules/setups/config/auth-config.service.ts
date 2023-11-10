import { numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService<AuthEnvironmentVariables>) {}

  get sigPublicKid() {
    return this.configService.get('JWKS_SIG_PUBLIC_KID', { infer: true })!;
  }
  get sigPrivateKey() {
    return this.configService.get('JWKS_SIG_PRIVATEKEY_EC', { infer: true })!.replace(/\\n/g, '\n');
  }
  get encPublicKid() {
    return this.configService.get('JWKS_ENC_PUBLIC_KID', { infer: true })!;
  }
  get encPrivateKey() {
    return this.configService.get('JWKS_ENC_PRIVATEKEY_EC', { infer: true })!.replace(/\\n/g, '\n');
  }
  get jwtAccessTokenSecret() {
    return this.configService.get('JWT_ACCESS_TOKEN_SCT', { infer: true })!;
  }
  get jwtAccessTokenExpirationDuration() {
    return this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION_DURATION', { infer: true })!;
  }
  get jwtDownloadTokenExpirationDuration() {
    return this.configService.get('JWT_DOWNLOAD_TOKEN_EXPIRATION_DURATION', { infer: true })!;
  }
  get jwtVerifyTokenSecret() {
    return this.configService.get('JWT_VERIFY_TOKEN_SCT', { infer: true })!;
  }
  get jwtVerifyTokenExpirationDurationYears() {
    return this.configService.get('JWT_VERIFY_TOKEN_EXPIRATION_DURATION_YEARS', { infer: true })!;
  }
  get corppassAgencyCacheExpirySeconds() {
    return this.configService.get('CORPPASS_AGENCY_CACHE_EXPIRY_SECONDS', { infer: true })!;
  }
}

export class AuthEnvironmentVariables {
  @Expose()
  @IsString()
  JWKS_SIG_PUBLIC_KID: string;

  @Expose()
  @IsString()
  JWKS_SIG_PRIVATEKEY_EC: string;

  @Expose()
  @IsString()
  JWKS_ENC_PUBLIC_KID: string;

  @Expose()
  @IsString()
  JWKS_ENC_PRIVATEKEY_EC: string;

  @Expose()
  @IsString()
  JWT_ACCESS_TOKEN_SCT: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  JWT_ACCESS_TOKEN_EXPIRATION_DURATION: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  JWT_DOWNLOAD_TOKEN_EXPIRATION_DURATION: number;

  @Expose()
  @IsString()
  JWT_VERIFY_TOKEN_SCT: string;

  @Expose()
  @IsString()
  JWT_VERIFY_TOKEN_EXPIRATION_DURATION_YEARS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  CORPPASS_AGENCY_CACHE_EXPIRY_SECONDS: number;
}
