import { Provider } from '@nestjs/common';
import axios from 'axios';

import { CORE_API_CLIENT_PROVIDER, TRANSFER_API_CLIENT_PROVIDER } from '../../../const/index';
import { FileSGConfigService } from '../config/config.service';

export const CoreServiceClientProvider: Provider = {
  provide: CORE_API_CLIENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: async (fileSGConfigService: FileSGConfigService) => {
    const { coreServiceUrl } = fileSGConfigService.systemConfig;

    return axios.create({
      baseURL: coreServiceUrl,
    });
  },
};

export const TransferServiceClientProvider: Provider = {
  provide: TRANSFER_API_CLIENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: async (fileSGConfigService: FileSGConfigService) => {
    const { transferServiceUrl } = fileSGConfigService.systemConfig;

    return axios.create({
      baseURL: transferServiceUrl,
    });
  },
};
