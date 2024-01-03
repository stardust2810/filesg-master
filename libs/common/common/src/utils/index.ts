import { AxiosResponse } from 'axios';
import { ClassConstructor, TransformFnParams, TypeOptions } from 'class-transformer';
import { isEmpty, isString } from 'class-validator';
import {
  addDays,
  addYears,
  endOfDay,
  format,
  getDate,
  getMonth,
  isAfter,
  isBefore,
  isFuture,
  isPast,
  isValid,
  parseISO,
  startOfDay,
} from 'date-fns';
import sanitizeHtml from 'sanitize-html';
import { EntityMetadataNotFoundError, ObjectLiteral, SelectQueryBuilder } from 'typeorm';

import {
  EXCEPTION_ERROR_CODE,
  FILE_STATUS,
  FORMSG_EXCEPTION_ERROR_CODE_TO_FAIL_CATEGORY,
  REVOCATION_TYPE,
  SANIZE_HTML_ESCAPED_CHAR_REPLACE_OBJECT,
} from '../constants/common';
import { AgencyPassword, IFileSGError } from '../typings/common';
import { CustomPropertyMap } from '../typings/utils';

interface ASCIICharacterInfo {
  character: string;
  startPosition: number;
  endPosition: number;
}

// =============================================================================
// Formatters
// =============================================================================
// File Size
export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Words
/**
 * Transform string into 1st character uppercase, other characters lowercase
 * If multiple words in string, only 1st word would be 1st-letter-capitalised
 */
export function transformFirstLetterUppercase(string: string) {
  return string.toLowerCase().replace(/(^.)/, (str) => str.toUpperCase());
}

/**
 * Transform string into 1st character uppercase, other characters lowercase, for all words separated by space
 *
 */
export function transformAllFirstLetterUppercase(string: string) {
  return string
    .split(' ')
    .map((word) => transformFirstLetterUppercase(word))
    .join(' ');
}

// Date
export const transformDateToFilenameString = (date: Date) => {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
};

// Whitespace
export function removeWhiteSpace(value: string) {
  return value.replaceAll(/\s/g, '');
}

export function convertBinaryRepresentation(input: string, inputRepresentation: BufferEncoding, outputRepresentation: BufferEncoding) {
  return Buffer.from(input, inputRepresentation).toString(outputRepresentation);
}

export const constructErrorMessageFromAxiosResponse = (errorResponse: AxiosResponse<any, any>): string => {
  const errorData = errorResponse.data.data;

  if (typeof errorData === 'string') {
    return errorData;
  }

  let errorMessage = errorData?.message ?? '';
  errorData?.error && (errorMessage += ` | ${JSON.stringify(errorData.error)}`);

  return errorMessage;
};

/**
 * Returns end of day date X * years from the start date, IN LOCAL TIME
 *
 * e.g. 01-01-2023 will return 01-01-2024 23:59:59.999.
 *
 * Special case: 29 Feb will return 01 Mar
 */
export function getExpiryInXYears(startDate: Date, numberOfYears: number): Date {
  const startOfStartDate = startOfDay(startDate);
  const expiryDateInXYears = addYears(startOfStartDate, numberOfYears);

  // Special handling for 29 feb, since addYears returns 28 feb year+1 for the leap year date
  if (getDate(startOfStartDate) === 29 && getMonth(startOfStartDate) === 2) {
    // date-fns
    return addDays(endOfDay(expiryDateInXYears), 1);
  }

  return endOfDay(expiryDateInXYears);
}

// =============================================================================
// Class Transformers
// =============================================================================
export const booleanTransformer =
  (mode: 'strict' | 'extended') =>
  ({ value }: TransformFnParams) => {
    const isStrictMode = mode === 'strict';
    const acceptableTruthyValues = isStrictMode ? ['true', true] : ['true', true, 1, '1'];
    const acceptableFalseyValues = isStrictMode ? ['false', false] : ['false', false, 0, '0'];

    const lowercaseValue = value && typeof value === 'string' ? value.toLowerCase() : value;

    if (acceptableTruthyValues.includes(lowercaseValue)) {
      return true;
    }

    if (acceptableFalseyValues.includes(lowercaseValue)) {
      return false;
    }

    // Let IsBoolean validator catch the error if value is not 'parsable'
    return value;
  };

export const numberTransformer = ({ value }: TransformFnParams) => parseInt(value, 10);

export const stringArraySanitizerTransformer = ({ value }: TransformFnParams) =>
  value
    .map((message: string) => sanitizeHtml(message, { allowedTags: [], allowedAttributes: {} }))
    .filter((message: string) => message !== '');

export const recordSanitizerTransformer = ({ value: obj }: TransformFnParams) => {
  const sanitizedObj: Record<string, string> = {};
  for (const key in obj) {
    sanitizedObj[key] = sanitizeHtml(obj[key], { allowedTags: [], allowedAttributes: {} });
  }
  return sanitizedObj;
};

// this is mainly for csv as csv will parse unempty string as unempty string
export const transformToUndefinedIfEmpty = ({ value }: TransformFnParams) => {
  if (value === '') {
    return undefined;
  }

  return value;
};

// this is mainly for csv as csv will parse everything into string
export const stringToObjectTransformer = ({ value }: TransformFnParams) => {
  if (value === '') {
    return undefined;
  }

  return JSON.parse(value);
};

export const stringSanitizerTransformer = ({ value }: TransformFnParams) => {
  // escape if type not string, to prevent skipping type validators
  if (typeof value !== 'string') {
    return value;
  }

  return sanitizeHtmlAndDecodeEscapedSymbol(value);
};

export const queryParamArrayTransformer = ({ value }: TransformFnParams) => {
  const str = value.trim();
  return str ? str.split(',') : [];
};

/**
 * As sanitize-html escapes ALL text content - this means that ampersands, greater-than, and less-than signs are
 * converted to their equivalent HTML character references (& --> &amp;, < --> &lt;, and so on). Hence, a replace
 * has to be done after the sanitazation to decode or revert back the escaped symbol so that they are stored as
 * expected in the db.
 */
export const sanitizeHtmlAndDecodeEscapedSymbol = (value: string) => {
  const sanitizedString = sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} });
  const replace = Object.keys(SANIZE_HTML_ESCAPED_CHAR_REPLACE_OBJECT).join('|');
  // eslint-disable-next-line security/detect-non-literal-regexp
  const re = new RegExp(replace, 'gi');
  return sanitizedString.replace(re, (m) => SANIZE_HTML_ESCAPED_CHAR_REPLACE_OBJECT[m]);
};

// =============================================================================
// Validation
// =============================================================================
const getUinfinChecksum = (uinfin: string) => {
  const DIGIT_WEIGHTS = [2, 7, 6, 5, 4, 3, 2];
  const LOCAL_SUFFIX_CHAR_MAP = ['J', 'Z', 'I', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
  const FOREIGN_SUFFIX_CHAR_MAP_FG = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'M', 'L', 'K'];
  const FOREIGN_SUFFIX_CHAR_MAP_M = ['X', 'W', 'U', 'T', 'R', 'Q', 'P', 'N', 'J', 'L', 'K'];

  enum UINFIN_TYPE {
    LOCAL_T_PREFIX = 'T',
    LOCAL_S_PREFIX = 'S',
    FOREIGN_G_PREFIX = 'G',
    FOREIGN_M_PREFIX = 'M',
  }

  let totalWeights = 0;
  for (let i = 0; i < 7; ++i) {
    totalWeights += Number(uinfin.charAt(i + 1)) * DIGIT_WEIGHTS[i];
  }

  const type = uinfin.charAt(0);
  if (type === UINFIN_TYPE.LOCAL_T_PREFIX || type === UINFIN_TYPE.FOREIGN_G_PREFIX) {
    totalWeights += 4;
  }

  if (type === UINFIN_TYPE.FOREIGN_M_PREFIX) {
    totalWeights += 3;
  }

  let checkSum: string;
  switch (type) {
    case UINFIN_TYPE.LOCAL_S_PREFIX:
    case UINFIN_TYPE.LOCAL_T_PREFIX:
      checkSum = LOCAL_SUFFIX_CHAR_MAP[totalWeights % 11];
      break;
    case UINFIN_TYPE.FOREIGN_M_PREFIX:
      checkSum = FOREIGN_SUFFIX_CHAR_MAP_M[totalWeights % 11];
      break;
    default:
      checkSum = FOREIGN_SUFFIX_CHAR_MAP_FG[totalWeights % 11];
  }

  return checkSum;
};

export const redactUinfin = (input: string): string => {
  if (!input) {
    return input;
  }

  return input.replace(/[stfgmSTFGM]\d{7}[a-zA-Z]/gm, (value) => {
    return `${value.substring(0, 1)}****${value.substring(5)}`;
  });
};

// fin regex is [FGM], nric is [ST];
export const isUinfinValid = (uinfin: string) => {
  if (!uinfin || typeof uinfin !== 'string') {
    return false;
  }
  const value = uinfin.toUpperCase();
  const isNricfin = (value: string) => /^[STFGM]\d{7}[A-Z]$/i.test(value);
  return isNricfin(value) && getUinfinChecksum(value) === value.charAt(uinfin.length - 1);
};

export const isUinfinMasked = (uinfin: string) => {
  if (!uinfin) {
    return false;
  }
  const isMasked = (value: string) => /^[STFGM]\*{4}\d{3}[A-Z]$/i.test(value);
  return isMasked(uinfin);
};

export type IsDateValidOptions = AllowPartialDateOptions | DisallowPartialDateOptions;

export interface AllowPartialDateOptions {
  allowEmptyMonthDay?: true;
  allowedDate: 'PAST';
  includeTimestamp?: false;
}

export interface DisallowPartialDateOptions {
  allowEmptyMonthDay?: false;
  allowedDate: 'PAST' | 'FUTURE' | 'ANY';
  includeTimestamp?: boolean;
}

function isEmptyMonthDayDatePast(dateString: string): boolean {
  // Parse the date parts to integers
  const today = new Date();
  const currYear = today.getFullYear();
  const currMonth = today.getMonth() + 1;
  const currDay = today.getDate();
  const [year, month, day] = dateString.split('-').map((part) => parseInt(part, 10));

  // =============================================================================
  // Check for year
  // =============================================================================
  // Months only matters if input year is  equal to current year
  if (year !== currYear) {
    return year < currYear;
  }

  // =============================================================================
  // Check for month
  // =============================================================================
  // day only matters if input month is equal to current month or (current month is jan and input month is empty)
  // Why Jan matters because 2023-00-21 is definitely not a past date when current is 2023-01-20
  if (month !== currMonth && (month !== 0 || currMonth !== 1)) {
    return month < currMonth;
  }

  // =============================================================================
  // Check for day
  // =============================================================================
  return day <= currDay;
}

export function isValidFileSGDate(options: IsDateValidOptions) {
  return (value: string) => isDateValid(value, options);
}

// value is in yyyy-mm-dd format
export function isDateValid(
  value: string,
  options: IsDateValidOptions = { includeTimestamp: false, allowEmptyMonthDay: false, allowedDate: 'ANY' },
) {
  const { includeTimestamp, allowEmptyMonthDay, allowedDate } = options;
  const dateFormatRegex = /^(19|20)\d\d-(0[0-9]|1[012])-(0[0-9]|[12][0-9]|3[01])$/;
  const timeFormatRegex = /^T(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]).([0-9]{3})Z$/;

  const regex = !includeTimestamp
    ? dateFormatRegex
    : // eslint-disable-next-line security/detect-non-literal-regexp
      new RegExp(dateFormatRegex.source.replace('$', '') + timeFormatRegex.source.replace('^', ''));

  const isValidDateFormat = regex.test(value);

  if (isValidDateFormat) {
    const deconstructedDate = value.split('-');
    const isPartialDate = deconstructedDate[1] === '00' || deconstructedDate[2] === '00';
    const parsedDate = parseISO(value);

    if (!allowEmptyMonthDay && isPartialDate) {
      return false;
    }

    if (allowEmptyMonthDay && isPartialDate && isEmptyMonthDayDatePast(value)) {
      return true;
    }

    if (
      isValid(parsedDate) &&
      (allowedDate === 'ANY' || (allowedDate === 'FUTURE' && isFuture(parsedDate)) || (allowedDate === 'PAST' && isPast(parsedDate)))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Returns a boolean on whether given date has expired.
 * Expiry happens on the day after the expireAt date.
 *
 * Comparison is done with only date (using start of day).
 * @example // Given today's date = 30/01/2023
 * isExpiredByDate(new Date('31/01/2023')) // returns false
 * isExpiredByDate(new Date('30/01/2023')) // returns false
 * isExpiredByDate(new Date('29/01/2023')) // returns true
 */
export function isExpiredByDate(expireAt: Date) {
  return isBefore(startOfDay(expireAt), startOfDay(new Date()));
}

/**
 * Returns a boolean on whether fileasset is considered deleted by status & deleteAt date
 * Deletion occurs on the deleteAt date.
 *
 * Comparison is done with only date (using start of day).
 * @example // Given today's date = 30/01/2023, in the event fileasset status !== deleted
 * isFileDeleted(FILE_STATUS.ACTIVE, new Date('31/01/2023')) // returns false
 * isFileDeleted(FILE_STATUS.ACTIVE, new Date('30/01/2023')) // returns true
 * isFileDeleted(FILE_STATUS.ACTIVE, new Date('29/01/2023')) // returns true
 */
export function isDeletedByDate(deleteAt: Date): boolean {
  return !isAfter(startOfDay(deleteAt), startOfDay(new Date()));
}

/**
 * Taken from valid-filename lib
 * https://github.com/sindresorhus/valid-filename
 *
 * Not using lib because of ESM requirement
 */
export function isValidFilename(filename: string) {
  /**
   * Unicode characters u0000 to u001F are control characters and are generally not used in JS
   * However, we are filtering out these characters, hence disabling the eslint rule
   */
  // eslint-disable-next-line no-control-regex
  const filenameReservedRegex = /[<>:"/\\|?*\u0000-\u001F]/g;
  const doublePeriodRuleRegex = /\.\.+/g;
  const endingPeriodOrSpaceRegex = /(\.| )$/;

  const windowsReservedNameRegex = /^(con|prn|aux|nul|com\d|lpt\d)$/i;

  if (!filename || filename.length > 255) {
    return false;
  }

  return !(
    filenameReservedRegex.test(filename) ||
    windowsReservedNameRegex.test(filename) ||
    doublePeriodRuleRegex.test(filename) ||
    endingPeriodOrSpaceRegex.test(filename)
  );
}

export function isValidFilePath(pathToFile: string) {
  // Maximum path length for windows is 260
  // https://learn.microsoft.com/en-us/windows/win32/fileio/naming-a-file#maximum-path-length-limitation
  if (pathToFile.length > 260) {
    return false;
  }

  const directoryFileArray = pathToFile.split('/');
  return directoryFileArray.every((value) => isValidFilename(value));
}

// =============================================================================
// Specific Agency Password key-value pair validators
// =============================================================================
export function isValidAgencyPasswordFilePath(agencyPassword: AgencyPassword): boolean {
  const filePaths = Object.keys(agencyPassword);
  return filePaths.every((filePath) => isValidFilePath(filePath));
}

export function agencyPasswordPasswordValidation(agencyPassword: AgencyPassword, maxLength: number): boolean {
  const passwords = Object.values(agencyPassword);
  return passwords.every((password) => {
    // Check if is string and is not empty
    if (!isString(password) || isEmpty(password)) {
      return false;
    }

    // Check if password more that max length
    return password.length <= maxLength;
  });
}

export function isNotDuplicateAgencyPasswordFilePath(agencyPassword: AgencyPassword): boolean {
  const filePaths = Object.keys(agencyPassword);
  const uniqueFilePaths = new Set(filePaths);

  return filePaths.length === uniqueFilePaths.size;
}

/**
 * Function that helps to find the non-ASCII characters in given string and return the
 * non-ASCII value together with its position.
 * When resultInBoolean is set to true, it will return boolean indicating whether non-ASCII character is found.
 */
export function findNonASCIICharactersWithPositions(text: string, resultInBoolean: true): boolean;
export function findNonASCIICharactersWithPositions(text: string, resultInBoolean: false): ASCIICharacterInfo[];
export function findNonASCIICharactersWithPositions(text: string, resultInBoolean?: undefined): ASCIICharacterInfo[];
export function findNonASCIICharactersWithPositions(text: string, resultInBoolean?: boolean) {
  // eslint-disable-next-line no-control-regex
  const nonASCIIRegex = /[^\x00-\x7F]+/g; // Regular expression to match non-ASCII characters

  const nonASCIICharactersWithPositions: ASCIICharacterInfo[] = [];
  let match;

  while ((match = nonASCIIRegex.exec(text)) !== null) {
    const nonASCIICharacter = match[0];
    const startPosition = match.index;
    const endPosition = match.index + nonASCIICharacter.length;

    nonASCIICharactersWithPositions.push({
      character: nonASCIICharacter,
      startPosition,
      endPosition,
    });
  }

  return resultInBoolean ? nonASCIICharactersWithPositions.length > 0 : nonASCIICharactersWithPositions;
}

// =============================================================================
// Others
// =============================================================================
export function revocationTypeToFileStatusMapper(revocationType: REVOCATION_TYPE.CANCELLED | REVOCATION_TYPE.EXPIRED) {
  switch (revocationType) {
    case REVOCATION_TYPE.CANCELLED:
      return FILE_STATUS.REVOKED;

    case REVOCATION_TYPE.EXPIRED:
      return FILE_STATUS.EXPIRED;
  }
}

export const isFileSGError = (error: unknown): error is IFileSGError => {
  return (error as any).response?.data.data.errorCode !== undefined;
};

export const isFileSGErrorType = (error: unknown, type: EXCEPTION_ERROR_CODE | EXCEPTION_ERROR_CODE[]): error is IFileSGError => {
  const exceptionCode = getExceptionCodeFromErrorException(error);

  if (!exceptionCode) {
    return false;
  }

  if (Array.isArray(type)) {
    return type.includes(exceptionCode);
  }

  return exceptionCode === type;
};

export const getExceptionCodeFromErrorException = (error: unknown) => {
  if (!error || !isFileSGError(error)) {
    return null;
  }
  const { errorCode } = error.response.data.data;
  return errorCode.substring(errorCode.length - 3) as EXCEPTION_ERROR_CODE;
};

/**
 * Given the error from axios, this functions extract the exception code and return the
 * the mapped fail category based on the code
 */
export const getFailCategoryFromErrorException = (error: unknown) => {
  const exceptionCode = getExceptionCodeFromErrorException(error);

  if (!exceptionCode) {
    return null;
  }

  return FORMSG_EXCEPTION_ERROR_CODE_TO_FAIL_CATEGORY[exceptionCode] ?? null;
};

export const jsonStringifyRedactor = (keysToRedact: string[]) => (key: string, value: any) => {
  if (keysToRedact.includes(key)) {
    return '<REDACTED-VALUE>';
  }
  return value;
};

export const getTypeOptions = (
  types: { name: string; value: ClassConstructor<any> }[],
  keepDiscriminatorProperty?: boolean,
  propertyName?: string,
): TypeOptions => {
  return {
    discriminator: {
      property: propertyName ?? 'type',
      subTypes: types,
    },
    keepDiscriminatorProperty,
  };
};

export const pluralise = (count: number, singular: string, plural: string = singular + 's') => {
  return [1, -1].includes(count) ? singular : plural;
};

export function compareArrays<T>(original: T[], compared: T[]) {
  original ??= [];
  compared ??= [];

  const missingElements: T[] = [];
  const additionalElements: T[] = [];

  for (const element of compared) {
    if (!original.includes(element)) {
      additionalElements.push(element);
    }
  }

  for (const element of original) {
    if (!compared.includes(element)) {
      missingElements.push(element);
    }
  }

  const isEqual = missingElements.length === 0 && additionalElements.length === 0;
  return { isEqual, missingElements, additionalElements };
}

export const findDuplicateStrings = (arr: string[]) => {
  const seen: Record<string, boolean> = {};
  const duplicates: string[] = [];

  for (const item of arr) {
    if (seen[item]) {
      duplicates.push(item);
    } else {
      seen[item] = true;
    }
  }

  return duplicates;
};

/**
 * Customizes the selection of columns in a TypeORM SelectQueryBuilder based on a provided custom property map.
 * Allows you to specify which columns to select from related entities and apply optional conditions.
 *
 * @param qb The TypeORM SelectQueryBuilder for the main entity.
 * @param customPropertyMap An object that defines the custom property mapping.
 * @param options An optional object with configuration options.
 */
export function normalizeCustomPropertyMap<T extends ObjectLiteral>(qb: SelectQueryBuilder<T>, customPropertyMap: CustomPropertyMap) {
  if (!customPropertyMap) {
    return;
  }

  for (const property in customPropertyMap) {
    const { path, filterOnly, ignoreNull } = customPropertyMap[property];
    const parts = path.split('.');
    const entityPart = 2 <= parts.length ? parts[parts.length - 2] : qb.alias;
    const columnPart = parts[parts.length - 1];

    const relationMetadata = qb.expressionMap.mainAlias?.metadata.findRelationWithPropertyPath(entityPart);
    const hasAlreadyJoined =
      qb.expressionMap.aliases.find((a) => a.metadata.tableNameWithoutPrefix === entityPart) ??
      qb.expressionMap.joinAttributes.find((ja) => ja.relationCache === relationMetadata)?.alias;
    const isRelationJoinable = !hasAlreadyJoined && relationMetadata;

    if (!relationMetadata) {
      throw new EntityMetadataNotFoundError(`Unable to join entity ${qb.alias} with relation ${entityPart}`);
    }

    isRelationJoinable && qb.leftJoinAndSelect(`${qb.alias}.${entityPart}`, entityPart);
    filterOnly && qb.leftJoinAndSelect(`${qb.alias}.${entityPart}`, `new${entityPart}`);
    ignoreNull && qb.andWhere(`${entityPart}.${columnPart} IS NOT NULL`);
  }
}
