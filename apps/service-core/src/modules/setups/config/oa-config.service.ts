import { numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';

@Injectable()
export class OaConfigService {
  constructor(private configService: ConfigService<OaEnvironmentVariables>) {}

  get oaImageIdEncryptionKey() {
    return this.configService.get('OA_IMAGE_ID_ENCRYPTION_KEY', { infer: true })!;
  }

  get oaImageIdEncryptionIvLength() {
    return this.configService.get('OA_IMAGE_ID_ENCRYPTION_IV_LENGTH', { infer: true })!;
  }

  get oaImageIdEncryptionAlgo() {
    return this.configService.get('OA_IMAGE_ID_ENCRYPTION_ALGO', { infer: true })!;
  }

  get oaDidResolutionCacheExpirySeconds() {
    return this.configService.get('OA_DID_RESOLUTION_CACHE_EXPIRY_SECONDS', { infer: true })!;
  }
}

export class OaEnvironmentVariables {
  @Expose()
  @IsString()
  OA_IMAGE_ID_ENCRYPTION_ALGO: string;

  @Expose()
  @IsString()
  OA_IMAGE_ID_ENCRYPTION_IV_LENGTH: string;

  @Expose()
  @IsString()
  OA_IMAGE_ID_ENCRYPTION_KEY: string;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  OA_DID_RESOLUTION_CACHE_EXPIRY_SECONDS: number;
}
