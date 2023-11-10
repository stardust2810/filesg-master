import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService<AuthEnvironmentVariables>) {}

  get fileSgSystemIntegrationClientId() {
    return this.configService.get('FILESG_SYSTEM_INTEGRATION_CLIENT_ID', { infer: true })!;
  }
}

export class AuthEnvironmentVariables {
  @Expose()
  @IsString()
  FILESG_SYSTEM_INTEGRATION_CLIENT_ID: string;
}
