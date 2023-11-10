import { numberTransformer } from '@filesg/common';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Expose, Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

@Injectable()
export class HttpAgentConfigService {
  constructor(private configService: ConfigService<HttpAgentEnvironmentVariables>) {}

  get httpsAgentMaxSockets() {
    return this.configService.get('HTTPS_AGENT_MAX_SOCKETS', { infer: true })!;
  }

  get httpsAgentMaxFreeSockets() {
    return this.configService.get('HTTPS_AGENT_MAX_FREE_SOCKETS', { infer: true })!;
  }

  get httpsAgentSocketTimeout() {
    return this.configService.get('HTTPS_AGENT_SOCKET_TIMEOUT', { infer: true })!;
  }

  get httpsAgentFreeSocketTimeout() {
    return this.configService.get('HTTPS_AGENT_FREE_SOCKET_TIMEOUT', { infer: true })!;
  }
}

export class HttpAgentEnvironmentVariables {
  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  HTTPS_AGENT_MAX_SOCKETS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  HTTPS_AGENT_MAX_FREE_SOCKETS: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  HTTPS_AGENT_SOCKET_TIMEOUT: number;

  @Transform(numberTransformer)
  @Expose()
  @IsNumber()
  HTTPS_AGENT_FREE_SOCKET_TIMEOUT: number;
}
