import { REMOVAL_PATTERN } from '../constants';

export function isSGDS(x: string) {
  return x.startsWith('sgds-icon-');
}

export function getFileNameWithoutExtensionAndLastChars(fileName: string, numberOfChars: number): string {
  return fileName.substring(0, fileName.lastIndexOf('.') - numberOfChars);
}
export function getFileExtensionAndLastChars(fileName: string, numberOfChars: number): string {
  return fileName.substring(fileName.lastIndexOf('.') - numberOfChars);
}

export const toggleScrollLock = () => {
  document.querySelector('html')?.classList.toggle('scroll-lock');
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
