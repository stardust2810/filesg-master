import { COOKIE_HEADER, CSRF_KEY } from '@filesg/common';
import axios, { AxiosRequestConfig } from 'axios';

import { getCookieVal } from '../utils';
import { config } from './app-config';

// NOTE: calling from different domain, so need to append in front.
export const apiCoreServerClient = axios.create({
  baseURL: `${config.portalUrl}/api/core`,
  timeout: 5 * 1000,
  withCredentials: true,
});

apiCoreServerClient.interceptors.request.use(
  (configuration) => insertCSRFCookie(configuration),
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  },
);

function insertCSRFCookie(configuration: AxiosRequestConfig) {
  const cookieValue = getCookieVal(CSRF_KEY);
  if (configuration.method !== 'GET' && configuration.method !== 'OPTIONS' && configuration.method !== 'HEAD') {
    // eslint-disable-next-line security/detect-object-injection
    configuration.headers![COOKIE_HEADER] = cookieValue!;
  }
  return configuration;
}
