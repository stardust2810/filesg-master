import { isDateValid, isUinfinValid } from '@filesg/common';
import { DateValue } from '@filesg/design-system';

//Inline error messages
export const INVALID_FIN_NRIC_MESSAGE = 'Please input a valid NRIC/FIN.';
export const INVALID_DOB_MESSAGE = 'Please input a valid date of birth.';

//Tooltip messages
export const FIN_NRIC_TOOLTIP_TEXT =
  'Please enter your NRIC number if you are a Singapore citizen or Permanent Resident; and your Foreign Identification Number (FIN) if you are a FIN holder.';
export const DATE_TOOLTIP_TEXT =
  'Please enter ‘00’ in the respective field(s) if your birth date and/or birth month is unknown. For e.g. 00/09/1950, 00/00/1950 etc.';

//Verification error messages
export const VERIFICATION_ATTEMPT_FAILED_TEXT = 'Verification failed. Please check your particulars and try again.';
export const MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT = [
  'For data security, we have locked access to this transaction as you have reached the maximum number of verification attempts.',
  'To unlock, please contact the issuing agency directly.',
];

export const FIN_NRIC_INPUT_IDENTIFIER = 'finNric';
export const DATE_OF_BIRTH_IDENTIFIER = 'dateOfBirth';
export const VERIFY_BUTTON_IDENTIFIER = 'verifyButton';

export function finNricValidation(finNric: string) {
  if (isUinfinValid(finNric)) {
    return true;
  } else {
    return INVALID_FIN_NRIC_MESSAGE;
  }
}

export function initialFinNricValidation(finNric: string) {
  if (!finNric) {
    return true;
  } else {
    return finNricValidation(finNric);
  }
}

export function formatDateString(date: DateValue) {
  if (!date) {
    return '';
  }
  if (date.month.length === 1) {
    date.month = '0' + date.month;
  }
  if (date.day.length === 1) {
    date.day = '0' + date.day;
  }
  return date.year + '-' + date.month + '-' + date.day;
}

export function validateDateObject(value: DateValue): boolean {
  const dateString = formatDateString(value);
  return isDateValid(dateString, { allowEmptyMonthDay: true, allowedDate: 'PAST' });
}

export function initialValidateDateObject(value: DateValue) {
  if (!value.day || !value.month || !value.year) {
    return true;
  }
  return validateDateObject(value);
}
