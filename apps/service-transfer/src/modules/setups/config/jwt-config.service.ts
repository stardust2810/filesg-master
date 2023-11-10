import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose } from 'class-transformer';
import { IsString } from 'class-validator';

@Injectable()
export class JwtConfigService {
  constructor(private configService: ConfigService<JwtEnvironmentVariables>) {}

  get accessTokenSecret() {
    return this.configService.get('JWT_ACCESS_TOKEN_SCT', { infer: true })!;
  }
}

export class JwtEnvironmentVariables {
  @Expose()
  @IsString()
  JWT_ACCESS_TOKEN_SCT: string;
}
