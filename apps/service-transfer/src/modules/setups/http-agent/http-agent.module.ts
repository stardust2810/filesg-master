import { Module } from '@nestjs/common';

import {
  AWSLambdaHttpsAgentProvider,
  AWSLambdaNodeHttpsHandlerProvider,
  HttpAgentProvider,
  HttpsAgentProvider,
  NodeHttpsHandlerProvider,
} from './http-agent.provider';

@Module({
  providers: [
    HttpAgentProvider,
    HttpsAgentProvider,
    NodeHttpsHandlerProvider,
    AWSLambdaHttpsAgentProvider,
    AWSLambdaNodeHttpsHandlerProvider,
  ],
  exports: [
    HttpAgentProvider,
    HttpsAgentProvider,
    NodeHttpsHandlerProvider,
    AWSLambdaHttpsAgentProvider,
    AWSLambdaNodeHttpsHandlerProvider,
  ],
})
export class HttpAgentModule {}
