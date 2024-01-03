import { DATE_FORMAT_PATTERNS } from '@filesg/common';
import { format, parseJSON } from 'date-fns';
import { compile } from 'handlebars';
import { QueryFailedError } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { DB_QUERY_ERROR, MILLISECONDS, OtpDetails } from '../typings/common';
import { generateRandomString } from './encryption';

export function generateEntityUUID(entityName: string) {
  const date = Date.now();
  const randomStr = generateRandomString(16);
  return `${entityName.toLowerCase()}-${date}-${randomStr}`;
}

export function generateFileSessionUUID() {
  return generateEntityUUID('FileSession');
}

export function generateActivityUUID() {
  const date = parseJSON(new Date());
  const randomStr = generateRandomString(16);
  return `FSG-${format(date, DATE_FORMAT_PATTERNS.TRANSACTION_DATE)}-${randomStr}`;
}

export function generateCsrfToken() {
  return generateRandomString(10);
}

export function getWhitelistedCsrfURLs() {
  // FIXME: first 3 csrf not whitelisted, review whitelist urls
  return ['/core/session', '/core/session/status', '/core/agency', '/api/core/v1/file/generate-download-token'];
}

export function otpDataTransformer(otpDataString: string): OtpDetails {
  return JSON.parse(otpDataString, (key, value) => {
    switch (key as keyof OtpDetails) {
      case 'expireAt':
      case 'allowResendAt':
        return value ? parseJSON(value) : value;
      default:
        return value;
    }
  });
}

export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sleepInSecs = async (sec: number): Promise<void> => {
  return await sleep(sec * MILLISECONDS);
};

export const isQueryFailedErrorType = (error: unknown, errorCode: DB_QUERY_ERROR): error is QueryFailedError => {
  if (!(error instanceof QueryFailedError)) {
    return false;
  }

  return error.driverError.code === errorCode;
};

export function generateUuid() {
  return uuidV4();
}

export function generateOutputFromTemplate<T>(template: T, input: Record<string, string> | null): T {
  if (input === null) {
    return template;
  }

  const compliedTemplate = compile(JSON.stringify(template), { noEscape: true });
  return JSON.parse(compliedTemplate(input));
}
