import { NodeHttpHandler } from '@aws-sdk/node-http-handler';
import { HTTP_AGENT_PROVIDER, HTTPS_AGENT_PROVIDER, NODE_HTTPS_HANDLER_PROVIDER } from '@filesg/backend-common';
import { Provider } from '@nestjs/common';
import Agent, { HttpsAgent } from 'agentkeepalive';
import { Agent as AWSLambdaHttpsAgent } from 'https';

import { AWS_LAMBDA_HTTPS_AGENT_PROVIDER, AWS_LAMBDA_NODE_HTTPS_HANDLER_PROVIDER } from '../../../typings/common';
import { FileSGConfigService } from '../config/config.service';

export const HttpAgentProvider: Provider = {
  provide: HTTP_AGENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: (configService: FileSGConfigService) => {
    const { httpAgentConfig } = configService;

    return new Agent({
      maxSockets: httpAgentConfig.httpAgentMaxSockets,
      maxFreeSockets: httpAgentConfig.httpAgentMaxFreeSockets,
      timeout: httpAgentConfig.httpAgentSocketTimeout,
      freeSocketTimeout: httpAgentConfig.httpAgentFreeSocketTimeout,
    });
  },
};

export const HttpsAgentProvider: Provider = {
  provide: HTTPS_AGENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: (configService: FileSGConfigService) => {
    const { httpAgentConfig } = configService;

    return new HttpsAgent({
      maxSockets: httpAgentConfig.httpsAgentMaxSockets,
      maxFreeSockets: httpAgentConfig.httpsAgentMaxFreeSockets,
      timeout: httpAgentConfig.httpsAgentSocketTimeout, // active socket keepalive for 60 seconds
      freeSocketTimeout: httpAgentConfig.httpsAgentFreeSocketTimeout, // free socket keepalive for 30 seconds
    });
  },
};

export const NodeHttpsHandlerProvider: Provider = {
  provide: NODE_HTTPS_HANDLER_PROVIDER,
  inject: [HTTPS_AGENT_PROVIDER],
  useFactory: async (httpsAgent: HttpsAgent) => new NodeHttpHandler({ httpsAgent }),
};

// gd TODO: specifically for aws lambda to cater for ELD, to be relooked whether to switch to agentkeepalive
export const AWSLambdaHttpsAgentProvider: Provider = {
  provide: AWS_LAMBDA_HTTPS_AGENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: (configService: FileSGConfigService) =>
    new AWSLambdaHttpsAgent({ keepAlive: true, timeout: configService.awsConfig.lambdaTimeoutInMs }),
};

export const AWSLambdaNodeHttpsHandlerProvider: Provider = {
  provide: AWS_LAMBDA_NODE_HTTPS_HANDLER_PROVIDER,
  inject: [FileSGConfigService, AWS_LAMBDA_HTTPS_AGENT_PROVIDER],
  useFactory: async (configService: FileSGConfigService, httpsAgent: HttpsAgent) => {
    const { lambdaTimeoutInMs } = configService.awsConfig;
    return new NodeHttpHandler({ httpsAgent, connectionTimeout: lambdaTimeoutInMs, socketTimeout: lambdaTimeoutInMs });
  },
};
