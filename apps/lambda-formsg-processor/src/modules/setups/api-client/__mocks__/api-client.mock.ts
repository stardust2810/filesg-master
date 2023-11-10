import { Logger, Provider } from '@nestjs/common';
import axios from 'axios';

import { CORE_API_CLIENT_PROVIDER, EVENT_LOGS_API_CLIENT_PROVIDER, TRANSFER_API_CLIENT_PROVIDER } from '../../../../const';
import { mockFileSGConfigService } from '../../config/__mocks__/config.mock';

export const mockCoreServiceApiClient = {
  post: jest.fn(),
};

export const mockTransferServiceApiClient = {
  post: jest.fn(),
};

export const mockEventLogsServiceApiClient = {
  post: jest.fn(),
};

const mockFilesgSystemIntegrationClientSecret = 'mockFilesgSystemIntegrationClientSecret';
export const MockCoreServiceClientProvider: Provider = {
  provide: CORE_API_CLIENT_PROVIDER,
  useFactory: async () => {
    const { coreServiceUrl } = mockFileSGConfigService.systemConfig;
    const { fileSgSystemIntegrationClientId } = mockFileSGConfigService.authConfig;

    const axiosClient = axios.create({
      baseURL: coreServiceUrl,
    });

    axiosClient.interceptors.request.use((request) => {
      request.headers!['x-client-id'] = fileSgSystemIntegrationClientId;
      request.headers!['x-client-secret'] = mockFilesgSystemIntegrationClientSecret;
      return request;
    });

    return axiosClient;
  },
};

export const MockEventLogsServiceClientProvider: Provider = {
  provide: EVENT_LOGS_API_CLIENT_PROVIDER,
  useFactory: async () => {
    const { eventLogsServiceUrl } = mockFileSGConfigService.systemConfig;
    const logger = new Logger(EVENT_LOGS_API_CLIENT_PROVIDER);

    const axiosClient = axios.create({
      baseURL: eventLogsServiceUrl,
    });

    axiosClient.interceptors.request.use((request) => {
      logger.log(`headers ${JSON.stringify(request.headers)}`);
      return request;
    });
    return axiosClient;
  },
};

export const MockTransferServiceClientProvider: Provider = {
  provide: TRANSFER_API_CLIENT_PROVIDER,
  useFactory: async () => {
    const { transferServiceUrl } = mockFileSGConfigService.systemConfig;
    const logger = new Logger(TRANSFER_API_CLIENT_PROVIDER);

    const axiosClient = axios.create({
      baseURL: transferServiceUrl,
    });

    axiosClient.interceptors.request.use((request) => {
      logger.log(`headers ${JSON.stringify(request.headers)}`);
      return request;
    });
    return axiosClient;
  },
};
