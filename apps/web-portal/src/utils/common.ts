import { EXCEPTION_ERROR_CODE } from '@filesg/common';
import { DATE_FORMAT_PATTERNS } from '@filesg/design-system';
import { format } from 'date-fns';
import { lazy } from 'react';
import { matchPath } from 'react-router-dom';

import { REDIRECTION_PATH_KEY, WebPage } from '../consts';
import { WOGAA_TRACKING_ID } from '../consts/analytics';
import { IFileSGError } from '../typings';

// =============================================================================
// Lazy import
// =============================================================================
export function lazyWithRefresh(componentImport: Parameters<typeof lazy>[0]) {
  return lazy(async () => {
    const PAGE_REFRESHED_KEY = 'lazy-force-refreshed';

    try {
      return await componentImport();
    } catch (error) {
      const hasRefreshedPage = window.sessionStorage.getItem(PAGE_REFRESHED_KEY) || 'false';

      if (hasRefreshedPage !== 'true') {
        window.sessionStorage.setItem(PAGE_REFRESHED_KEY, 'true');

        // type asserting this to any to 'ignore' typescript error as lazy cannot take in function that return void
        // returning void here does not matter because the whole page will be reloaded
        return window.location.reload() as any;
      }

      throw error;
    }
  });
}

// =============================================================================
// Formatting
// =============================================================================
export function getCookieVal(key: string) {
  const result = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return result ? result.pop() : '';
}

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / k ** i).toFixed(dm)) + ' ' + sizes[i];
};

export const formatDate = (date: string, pattern: DATE_FORMAT_PATTERNS) => format(new Date(date), pattern);

export const formatFileNameWithoutExtensionAndLastChars = (fileName: string, numberOfChars: number): string => {
  return fileName.substring(0, fileName.lastIndexOf('.') - numberOfChars);
};

export const formatFileExtensionAndLastChars = (fileName: string, numberOfChars: number): string => {
  return fileName.substring(fileName.lastIndexOf('.') - numberOfChars);
};

export const toDateTimeFormat = (inputDate: Date): string => {
  return formatDate(`${inputDate}`, DATE_FORMAT_PATTERNS.DATE_TIME);
};

const toDateFormat = (inputDate: Date): string => {
  return formatDate(`${inputDate}`, DATE_FORMAT_PATTERNS.DATE);
};

const toTimeFormat = (inputDate: Date): string => {
  return formatDate(`${inputDate}`, DATE_FORMAT_PATTERNS.TIME);
};

export function getLastLoginMessage(lastLoginAt: Date) {
  return `Last login on ${toDateFormat(lastLoginAt)} at ${toTimeFormat(lastLoginAt)} `;
}

export function maskPhoneNumber(phoneNumber: string, firstNthDigitsToMask = 4) {
  // NOTE: Assumes number has Singapore area code (+65) in front
  return phoneNumber.substring(0, 3) + '*'.repeat(firstNthDigitsToMask) + phoneNumber.substring(7);
}

// =============================================================================
// Validate
// =============================================================================

export const isPathMatching = (actualPath: string, pathToMatch: string) => matchPath(actualPath, pathToMatch);

// =============================================================================
// Error
// =============================================================================
export const isFileSGError = (error: unknown): error is IFileSGError => {
  return (error as any).response?.data.data.errorCode !== undefined;
};

export const isFileSGErrorType = (error: unknown, type: EXCEPTION_ERROR_CODE | EXCEPTION_ERROR_CODE[]): error is IFileSGError => {
  if (!error || !isFileSGError(error)) {
    return false;
  }

  const { errorCode } = error.response.data.data;
  const exceptionCode = errorCode.substring(errorCode.length - 3) as EXCEPTION_ERROR_CODE;

  if (Array.isArray(type)) {
    return type.includes(exceptionCode);
  }

  return exceptionCode === type;
};

export const isActivityBannedFromVerification = (error: unknown) =>
  isFileSGErrorType(error, EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_BAN);

// =============================================================================
// Etc
// =============================================================================
export function getTimeZone() {
  return formatDate(new Date().toISOString(), DATE_FORMAT_PATTERNS.OFFSET);
}

export function getRedirectionPath() {
  return sessionStorage.getItem(REDIRECTION_PATH_KEY) && sessionStorage.getItem(REDIRECTION_PATH_KEY) !== ''
    ? sessionStorage.getItem(REDIRECTION_PATH_KEY)!
    : WebPage.ROOT;
}

export function resetRedirectionPath() {
  sessionStorage.setItem(REDIRECTION_PATH_KEY, WebPage.ROOT);
}

export function trackWogaaTransaction(method: 'START' | 'COMPLETE', trackingId: WOGAA_TRACKING_ID) {
  if (method === 'START') {
    window.wogaaCustom?.startTransactionalService(trackingId);
    return;
  }
  window.wogaaCustom?.completeTransactionalService(trackingId);
}

export function openLinkInNewTab(link: string) {
  /*
      NOTE: Disabling detect-non-literal-fs-filename for this line as the
      rule is checking for the key 'open' - regardless of whether the object is fs
    */
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  window.open(link, '_blank', 'noopener,noreferrer');
}
