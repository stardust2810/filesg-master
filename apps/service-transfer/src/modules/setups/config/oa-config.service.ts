import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class OAConfigService {
  constructor(private configService: ConfigService<OAEnvironmentVariables>) {}

  get rendererUrl() {
    return this.configService.get('OA_RENDERER_URL', { infer: true })!;
  }

  get revocationLocation() {
    return this.configService.get('OA_REVOCATION_LOC', { infer: true })!;
  }

  get oaImageIdEncryptionKey() {
    return this.configService.get('OA_IMAGE_ID_ENCRYPTION_KEY', { infer: true })!;
  }

  get oaImageIdEncryptionIvLength() {
    return this.configService.get('OA_IMAGE_ID_ENCRYPTION_IV_LENGTH', { infer: true })!;
  }

  get oaImageIdEncryptionAlgo() {
    return this.configService.get('OA_IMAGE_ID_ENCRYPTION_ALGO', { infer: true })!;
  }
}

export class OAEnvironmentVariables {
  @Expose()
  @IsString()
  OA_RENDERER_URL: string;

  @Expose()
  @IsString()
  OA_REVOCATION_LOC: string;

  @Expose()
  @IsString()
  OA_IMAGE_ID_ENCRYPTION_ALGO: string;

  @Expose()
  @IsString()
  OA_IMAGE_ID_ENCRYPTION_IV_LENGTH: string;

  @Expose()
  @IsString()
  OA_IMAGE_ID_ENCRYPTION_KEY: string;
}
