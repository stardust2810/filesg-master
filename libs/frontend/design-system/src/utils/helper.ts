import { REMOVAL_PATTERN, SCROLL_LOCK_DATA_ATTRIBUTE } from '../constants';

export function isSGDS(x: string) {
  return x.startsWith('sgds-icon-');
}

export const generateEllipsisFileNameParts = (fileName: string, numberOfChars: number): { front: string; back: string } => {
  const extensionPeriodIndex = fileName.lastIndexOf('.');
  const isFileNameWithoutExtension = extensionPeriodIndex === -1;

  const endIndex = isFileNameWithoutExtension ? fileName.length - numberOfChars : fileName.lastIndexOf('.') - numberOfChars;

  return { front: fileName.substring(0, endIndex), back: fileName.substring(endIndex) };
};

export const updateScrollLock = () => {
  const backdropWithScrollLock = Array.from(document.querySelectorAll(`div[${SCROLL_LOCK_DATA_ATTRIBUTE}=true]`));

  if (backdropWithScrollLock.length) {
    addScrollLock();
    return;
  }

  removeScrollLock();
};

export const addScrollLock = () => {
  document.querySelector('html')?.classList.add('scroll-lock');
};

export const removeScrollLock = () => {
  document.querySelector('html')?.classList.remove('scroll-lock');
};

export const toKebabCase = (string: string) =>
  string
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();

export const convertBreakpointToNumber = (breakpointInString: string): number => {
  return parseInt(breakpointInString.replace('px', ''), 10);
};

export function convertPxFromRemString(rem: string) {
  return parseFloat(rem) * 16;
}

export function removeWhitelistedUnicode(inputString: string): string {
  return inputString.replaceAll(REMOVAL_PATTERN, '');
}
