import { Provider } from '@nestjs/common';
import axios from 'axios';

import { DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER, MGMT_SERVICE_API_CLIENT_PROVIDER } from '../../../typings/common';
import { FileSGConfigService } from '../config/config.service';

// gd TODO: temporarily comment out until bug is fixed
export const MgmtServiceApiClientProvider: Provider = {
  provide: MGMT_SERVICE_API_CLIENT_PROVIDER,
  inject: [
    FileSGConfigService,
    // HTTP_AGENT_PROVIDER
  ],
  useFactory: async (
    fileSGConfigService: FileSGConfigService,
    // httpAgent: Agent
  ) => {
    const { mgmtServiceFullUrl } = fileSGConfigService.systemConfig;

    return axios.create({
      baseURL: mgmtServiceFullUrl,
      // httpAgent,
    });
  },
};

export const DocEncryptionLambdaApiClientProvider: Provider = {
  provide: DOC_ENCRYPTION_LAMBDA_API_CLIENT_PROVIDER,
  inject: [
    FileSGConfigService,
    // HTTP_AGENT_PROVIDER
  ],
  useFactory: async (
    fileSGConfigService: FileSGConfigService,
    // httpAgent: Agent
  ) => {
    const { docEncryptionLambdaFullUrl } = fileSGConfigService.systemConfig;

    return axios.create({
      baseURL: docEncryptionLambdaFullUrl,
      // httpAgent,
    });
  },
};
