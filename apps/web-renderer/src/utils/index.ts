import { MONTH_SHORT_NAME } from '../const';

/**
 * This function assume that the dateString is a valid date string and will not throw error
 *  Not using Date object as Date Object will change the date as per user local timezone and it is not desirable.
 *
 * format dateString from 'yyyy-MM-dd' to 'dd MMM yyyy'
 * If it is a partial date, it will be 'MMM yyyy' or 'yyyy'
 *
 */
export const convertToCustomDateString = (dateString: string) => {
  const splitDateString = dateString.split('-');

  const year = splitDateString[0];
  const month = convertToCustomMonthString(splitDateString[1]);
  const day = convertToCustomDayString(splitDateString[2]);

  if (!month) {
    return year;
  }

  if (!day) {
    return `${month} ${year}`;
  }

  return `${day} ${month} ${year}`;
};

export function getCookieVal(key: string) {
  const result = document.cookie.match(`(^|;)\\s*${key}\\s*=\\s*([^;]+)`);
  return result ? result.pop() : '';
}

const convertToCustomMonthString = (monthString: string): string => {
  const month = Number(monthString);

  return month === 0 ? '' : MONTH_SHORT_NAME[month - 1];
};

/**
 * Assume that dayString is going to is defined and is a number
 */
const convertToCustomDayString = (dayString: string): string => {
  const day = Number(dayString);

  return day === 0 ? '' : `${day}`;
};
