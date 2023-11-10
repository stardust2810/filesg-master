import { COOKIE_HEADER, CSRF_KEY } from '@filesg/common';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { StatusCodes } from 'http-status-codes';

import { getCookieVal } from '../utils/common';

// =============================================================================
// Functions
// =============================================================================
function insertCSRFCookie(configuration) {
  const cookieValue = getCookieVal(CSRF_KEY);
  if (configuration.method !== 'GET' && configuration.method !== 'OPTIONS' && configuration.method !== 'HEAD') {
    // eslint-disable-next-line security/detect-object-injection
    configuration.headers[COOKIE_HEADER] = cookieValue;
  }
  return configuration;
}

// Need this as error respose intereceptor is the 2nd argument
function emptyResponseInterceptor(res: AxiosResponse) {
  return res;
}

function followRestApiRedirection(error: AxiosError) {
  const { response } = error;

  if (response?.status === StatusCodes.IM_A_TEAPOT) {
    window.location.href = response.data.redirectUrl;
  }

  return Promise.reject(error);
}

// =============================================================================
// Core
// =============================================================================
export const apiCoreServerClient = axios.create({
  baseURL: 'api/core',
  timeout: 5 * 1000,
  withCredentials: true,
});

apiCoreServerClient.interceptors.request.use(insertCSRFCookie);
apiCoreServerClient.interceptors.response.use(emptyResponseInterceptor, followRestApiRedirection);

// =============================================================================
// Transfer
// =============================================================================
export const apiTransferServerClient = axios.create({
  baseURL: 'api/transfer',
  timeout: 40 * 1000,
  withCredentials: true,
});

apiTransferServerClient.interceptors.request.use(insertCSRFCookie);
apiTransferServerClient.interceptors.response.use(emptyResponseInterceptor, followRestApiRedirection);
