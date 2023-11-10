import { Provider } from '@nestjs/common';
import axios from 'axios';

import {
  CORE_API_CLIENT_PROVIDER,
  EVENT_LOGS_API_CLIENT_PROVIDER,
  FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_KEY,
  TRANSFER_API_CLIENT_PROVIDER,
} from '../../../const';
import { SmService } from '../../features/aws/sm.service';
import { FileSGConfigService } from '../config/config.service';

export const CoreServiceClientProvider: Provider = {
  provide: CORE_API_CLIENT_PROVIDER,
  inject: [FileSGConfigService, SmService],
  useFactory: async (fileSgConfigService: FileSGConfigService, smService: SmService) => {
    const { coreServiceUrl } = fileSgConfigService.systemConfig;
    const { fileSgSystemIntegrationClientId } = fileSgConfigService.authConfig;

    const axiosClient = axios.create({
      baseURL: coreServiceUrl,
    });

    axiosClient.interceptors.request.use(async (request) => {
      request.headers!['x-client-id'] = fileSgSystemIntegrationClientId;
      request.headers!['x-client-secret'] = await smService.getSecretValue(FILESG_SYSTEM_INTEGRATION_CLIENT_SECRET_KEY);
      return request;
    });

    return axiosClient;
  },
};

export const TransferServiceClientProvider: Provider = {
  provide: TRANSFER_API_CLIENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: async (fileSGConfigService: FileSGConfigService) => {
    const { transferServiceUrl } = fileSGConfigService.systemConfig;

    const axiosClient = axios.create({
      baseURL: transferServiceUrl,
    });

    axiosClient.interceptors.request.use((request) => {
      // this is to fix the "Request body larger than maxBodyLength limit" error when trying to upload larger file
      request.maxContentLength = Infinity;
      request.maxBodyLength = Infinity;
      return request;
    });

    return axiosClient;
  },
};

export const EventLogsServiceClientProvider: Provider = {
  provide: EVENT_LOGS_API_CLIENT_PROVIDER,
  inject: [FileSGConfigService],
  useFactory: async (fileSGConfigService: FileSGConfigService) => {
    const { eventLogsServiceUrl } = fileSGConfigService.systemConfig;

    return axios.create({
      baseURL: eventLogsServiceUrl,
    });
  },
};
