import { jsonStringifyRedactor, redactUinfin } from '@filesg/common';
import { Logger, Provider } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';

import {
  APEX_INT_CLIENT_PROVIDER,
  EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER,
  MCC_API_CLIENT_PROVIDER,
  MYICA_CLIENT_PROVIDER,
} from '../../../consts';
import { FileSGConfigService } from '../config/config.service';
import { ApexCloudService } from './apex-cloud.service';
const APEX_JWT_REQUEST_HEADER = 'x-apex-jwt';

// =============================================================================
// Internal
// =============================================================================
// gd TODO: temporarily comment out until bug is fixed
export const EventLogServiceApiClientProvider: Provider = {
  provide: EVENT_LOGS_SERVICE_API_CLIENT_PROVIDER,
  inject: [
    FileSGConfigService,
    // HTTP_AGENT_PROVIDER
  ],
  useFactory: async (
    fileSGConfigService: FileSGConfigService,
    // httpAgent: Agent
  ) => {
    const { eventLogsServiceFullUrl } = fileSGConfigService.systemConfig;

    return axios.create({
      baseURL: eventLogsServiceFullUrl,
      // httpAgent,
    });
  },
};

// =============================================================================
// External
// =============================================================================
// gd TODO: temporarily comment out until bug is fixed
// APEX CLOUD
export const ApexClientProvider: Provider = {
  provide: APEX_INT_CLIENT_PROVIDER,
  inject: [
    FileSGConfigService,
    ApexCloudService,
    // HTTPS_AGENT_PROVIDER
  ],
  useFactory: async (
    fileSGConfigService: FileSGConfigService,
    apexCloudService: ApexCloudService,
    // httpsAgent: HttpsAgent
  ) => {
    const { apexIntranetUrl } = fileSGConfigService.apexConfig;

    const logger = new Logger(APEX_INT_CLIENT_PROVIDER.description!);
    logger.log('[ApexClientProvider] In provider');
    const axiosClient = axios.create({
      baseURL: apexIntranetUrl,
      // httpsAgent,
    });

    axiosClient.interceptors.request.use(async (request) => {
      const { baseURL, url, method, data } = request;

      const dataHash = data ? createHash('sha256').update(JSON.stringify(data)).digest('hex') : '';
      const jwt = apexCloudService.getJwt(method!, baseURL! + url, dataHash);

      request.headers![APEX_JWT_REQUEST_HEADER] = jwt;
      request.headers!['Content-Type'] = 'application/json';

      logger.log(redactUinfin(JSON.stringify(request, jsonStringifyRedactor(['systemPw']))));
      return request;
    });

    axiosClient.interceptors.response.use((response) => {
      logger.log(`[Status:${response.status}] ${response.statusText}`);
      logger.log(redactUinfin(JSON.stringify(response.data, jsonStringifyRedactor(['image']))));
      return response;
    });
    return axiosClient;
  },
};

export const MyIcaClientProvider: Provider = {
  provide: MYICA_CLIENT_PROVIDER,
  inject: [
    FileSGConfigService,
    // HTTPS_AGENT_PROVIDER
  ],
  useFactory: async (
    fileSGConfigService: FileSGConfigService,
    // httpsAgent: HttpsAgent
  ) => {
    const { myIcaDologinUrl } = fileSGConfigService.agencyConfig;
    const logger = new Logger(MYICA_CLIENT_PROVIDER.description!);

    const axiosClient = axios.create({
      baseURL: myIcaDologinUrl,
      // httpsAgent,
    });

    axiosClient.interceptors.request.use((request) => {
      logger.log(redactUinfin(JSON.stringify(request)));
      return request;
    });

    axiosClient.interceptors.response.use((response) => {
      logger.log(`[Status:${response.status}] ${response.statusText}`);
      logger.log(redactUinfin(JSON.stringify(response.data)));
      return response;
    });

    return axiosClient;
  },
};

export const MccApiClientProvider: Provider = {
  provide: MCC_API_CLIENT_PROVIDER,
  inject: [
    FileSGConfigService,
    // HTTPS_AGENT_PROVIDER
  ],
  useFactory: async (
    fileSGConfigService: FileSGConfigService,
    // httpsAgent: HttpsAgent
  ) => {
    const { mccApiUrl } = fileSGConfigService.agencyConfig;
    const logger = new Logger(MCC_API_CLIENT_PROVIDER.description!);

    const axiosClient = axios.create({
      baseURL: mccApiUrl,
      // httpsAgent,
    });

    axiosClient.interceptors.request.use((request) => {
      logger.log(redactUinfin(JSON.stringify(request)));
      return request;
    });

    axiosClient.interceptors.response.use((response) => {
      logger.log(`[Status:${response.status}] ${response.statusText}`);
      logger.log(redactUinfin(JSON.stringify(response.data)));
      return response;
    });

    return axiosClient;
  },
};
