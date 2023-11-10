import { HTTPS_AGENT_PROVIDER } from '@filesg/backend-common';
import { Provider } from '@nestjs/common';
import { HttpsAgent } from 'agentkeepalive';

import { FileSGConfigService } from '../config/config.service';

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
