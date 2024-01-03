import { plainToClass, Transform } from 'class-transformer';

import { FILE_ENCRYPTION_MAX_PASSWORD_CHAR } from '../dtos/transaction/request';
import { AgencyPassword } from '../typings/common';
import {
  agencyPasswordPasswordValidation,
  getExpiryInXYears,
  isDateValid,
  isValidAgencyPasswordFilePath,
  isValidFilename,
  isValidFilePath,
  pluralise,
  queryParamArrayTransformer,
  redactUinfin,
  stringSanitizerTransformer,
  transformAllFirstLetterUppercase,
  transformFirstLetterUppercase,
} from '.';

function formDate(year: number, month: number, day: number) {
  return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

describe('utils', () => {
  describe('isDateValid', () => {
    /**
     * Set mock system date, as test might fail if modified date is an invalid date
     * e.g. 30 Mar 23, currMonth - 1 will result in 30 Feb 23, or
     * e.g. 01 Mar 23, currDay - 1 will result in 00 Mar 23 (partial date)
     * e.g. 31 Mar 23, currDay - 1 will result in 32 Mar 23
     */
    const mockCurrDate = new Date('2023-04-15');
    jest.useFakeTimers();
    jest.setSystemTime(mockCurrDate);

    const today = new Date();
    const currYear = today.getFullYear();
    const currMonth = today.getMonth() + 1;
    const currDay = today.getDate();

    describe('allowEmptyMonthDay is true', () => {
      describe('past date only', () => {
        describe('full date', () => {
          it('should return false when it is full future date', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth + 1, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay + 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return true when it is today date', () => {
            expect(isDateValid(formDate(currYear, currMonth, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is full past date', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth - 1, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay - 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });
        });

        describe('partial date (year)', () => {
          it('should return false when it is only future year', () => {
            expect(isDateValid(formDate(currYear + 1, 0, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return true when it is only current year', () => {
            expect(isDateValid(formDate(currYear, 0, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only past year', () => {
            expect(isDateValid(formDate(currYear - 1, 0, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });
        });

        describe('partial date (year and month)', () => {
          it('should return false when it is only future year and future month', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth + 1, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return false when it is only future year and current month', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return false when it is only future year and past month', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth - 1, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return false when it is only current year and future month', () => {
            expect(isDateValid(formDate(currYear, currMonth + 1, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return true when it is only current year and current month', () => {
            expect(isDateValid(formDate(currYear, currMonth, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only current year and past month', () => {
            expect(isDateValid(formDate(currYear, currMonth - 1, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only past year and future month', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth + 1, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only past year and current month', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only past year and past month', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth - 1, 0), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });
        });

        describe('partial date (year and day)', () => {
          it('should return false when it is only future year and future day', () => {
            expect(isDateValid(formDate(currYear + 1, 0, currDay + 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return false when it is only future year and current day', () => {
            expect(isDateValid(formDate(currYear + 1, 0, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return false when it is only future year and past day', () => {
            expect(isDateValid(formDate(currYear + 1, 0, currDay - 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return true when it is only current year and future day', () => {
            expect(isDateValid(formDate(currYear, 0, currDay + 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return false when it is only current year and current day', () => {
            expect(isDateValid(formDate(currYear, 0, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return false when it is only current year and past day', () => {
            expect(isDateValid(formDate(currYear, 0, currDay - 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return false when curr month is january and it is only current year and future day', () => {
            const mockJanDate = new Date('2023-01-21');
            jest.setSystemTime(mockJanDate);

            expect(isDateValid(formDate(2023, 0, 21 + 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore

            // resetting back jest time
            jest.setSystemTime(mockCurrDate);
          });

          it('should return true when curr month is january and it is only current year and current day', () => {
            const mockJanDate = new Date('2023-01-21');
            jest.setSystemTime(mockJanDate);

            expect(isDateValid(formDate(2023, 0, 21), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore

            // resetting back jest time
            jest.setSystemTime(mockCurrDate);
          });

          it('should return true when curr month is january and it is only current year and past day', () => {
            const mockJanDate = new Date('2023-01-21');
            jest.setSystemTime(mockJanDate);

            expect(isDateValid(formDate(2023, 0, 21 - 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore

            // resetting back jest time
            jest.setSystemTime(mockCurrDate);
          });

          it('should return true when it is only past year and future day', () => {
            expect(isDateValid(formDate(currYear - 1, 0, currDay + 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only past year and current day', () => {
            expect(isDateValid(formDate(currYear - 1, 0, currDay), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is only past year and past  day', () => {
            expect(isDateValid(formDate(currYear - 1, 0, currDay - 1), { allowEmptyMonthDay: true, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });
        });
      });
    });

    describe('allowEmptyMonthDay is false', () => {
      describe('future date only', () => {
        describe('full date', () => {
          it('should return true when it is full future date', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth + 1, currDay), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay + 1), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(true); // prettier-ignore
          });

          it('should return false when it is today date', () => {
            expect(isDateValid(formDate(currYear, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(false); // prettier-ignore
          });

          it('should return false when it is full past date', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(false); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth - 1, currDay), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(false); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay - 1), { allowEmptyMonthDay: false, allowedDate: 'FUTURE' })).toEqual(false); // prettier-ignore
          });
        });
      });

      describe('past date only', () => {
        describe('full date', () => {
          it('should return false when it is full future date', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth + 1, currDay), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay + 1), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(false); // prettier-ignore
          });

          it('should return true when it is today date', () => {
            expect(isDateValid(formDate(currYear, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is full past date', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth - 1, currDay), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay - 1), { allowEmptyMonthDay: false, allowedDate: 'PAST' })).toEqual(true); // prettier-ignore
          });
        });
      });

      describe('past or future date', () => {
        describe('full date', () => {
          it('should return true when it is full future date', () => {
            expect(isDateValid(formDate(currYear + 1, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth + 1, currDay), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay + 1), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is today date', () => {
            expect(isDateValid(formDate(currYear, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
          });

          it('should return true when it is full past date', () => {
            expect(isDateValid(formDate(currYear - 1, currMonth, currDay), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth - 1, currDay), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
            expect(isDateValid(formDate(currYear, currMonth, currDay - 1), { allowEmptyMonthDay: false, allowedDate: 'ANY' })).toEqual(true); // prettier-ignore
          });
        });
      });
    });
  });

  describe('redactUinfin', () => {
    it('should be able to redact S series NRIC by itself', () => {
      const input = 'S8745677C';

      expect(redactUinfin(input)).toEqual('S****677C');
    });

    it('should be able to redact S series NRIC in a long text', () => {
      const input =
        'Lorem ipsum dolor sit amet, consectetuer S8745677C adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';
      const output =
        'Lorem ipsum dolor sit amet, consectetuer S****677C adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';

      expect(redactUinfin(input)).toEqual(output);
    });

    it('should be able to redact T series NRIC by itself', () => {
      const input = 'T1614231F';

      expect(redactUinfin(input)).toEqual('T****231F');
    });

    it('should be able to redact T series NRIC in a long text', () => {
      const input =
        'Lorem ipsum dolor sit amet, consectetuer T1614231F adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';
      const output =
        'Lorem ipsum dolor sit amet, consectetuer T****231F adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';

      expect(redactUinfin(input)).toEqual(output);
    });

    it('should be able to redact F series NRIC by itself', () => {
      const input = 'F8512345U';

      expect(redactUinfin(input)).toEqual('F****345U');
    });

    it('should be able to redact F series NRIC in a long text', () => {
      const input =
        'Lorem ipsum dolor sit amet, consectetuer F8512345U adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';
      const output =
        'Lorem ipsum dolor sit amet, consectetuer F****345U adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';

      expect(redactUinfin(input)).toEqual(output);
    });

    it('should be able to redact G series NRIC by itself', () => {
      const input = 'G8467810X';

      expect(redactUinfin(input)).toEqual('G****810X');
    });

    it('should be able to redact G series NRIC in a long text', () => {
      const input =
        'Lorem ipsum dolor sit amet, consectetuer G8467810X adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';
      const output =
        'Lorem ipsum dolor sit amet, consectetuer G****810X adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';

      expect(redactUinfin(input)).toEqual(output);
    });

    it('should be able to redact M series NRIC by itself', () => {
      const input = 'M1712332N';

      expect(redactUinfin(input)).toEqual('M****332N');
    });

    it('should be able to redact M series NRIC in a long text', () => {
      const input =
        'Lorem ipsum dolor sit amet, consectetuer M1712332N adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';
      const output =
        'Lorem ipsum dolor sit amet, consectetuer M****332N adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate';

      expect(redactUinfin(input)).toEqual(output);
    });
  });

  describe('getExpiryInXYears', () => {
    const numberOfYears = 1;

    it('should return the end of day datetime 1 year after start date, e.g. 01-01-2023 (any time) -> 01-01-2024 23:59:59', () => {
      const startDate = new Date('2024, 02, 28');
      expect(getExpiryInXYears(startDate, numberOfYears)).toEqual(new Date('2025, 02, 28, 23:59:59.999'));
    });

    it('should handle 29 Feb and return 01 Mar of the next year', () => {
      const startDate = new Date('2024, 02, 29');
      expect(getExpiryInXYears(startDate, numberOfYears)).toEqual(new Date('2025, 02, 28, 23:59:59.999'));
    });
  });

  describe('isValidFilename', () => {
    describe('should return true', () => {
      it('if given filename with extension', () => {
        const path = 'file.jpg';
        expect(isValidFilename(path)).toEqual(true);
      });

      it('if given filename without extension', () => {
        const path = 'file';
        expect(isValidFilename(path)).toEqual(true);
      });

      it('if given filename with more than 1 period between subnames', () => {
        const path = 'file.file.jpg';
        expect(isValidFilename(path)).toEqual(true);
      });
    });

    describe('should return false', () => {
      it('if filename contains one of the excluded characters', () => {
        const excludedCharactersList = ['<', '>', ':', '"', '\\', '/', '|', '?', '*'];
        for (let i = 0; i < 32; i++) {
          // 00 to 1F
          excludedCharactersList.push(String.fromCharCode(i));
        }

        function createFilenameWithExcludedCharacter(excludedChar: string) {
          return 'file' + excludedChar + '.jpg';
        }

        excludedCharactersList.forEach((char) => expect(isValidFilename(createFilenameWithExcludedCharacter(char))).toEqual(false));
      });

      it('if filename contains more than 1 consecutive period', () => {
        const path1 = 'file..jpg';
        expect(isValidFilename(path1)).toEqual(false);

        const path2 = 'file..file.jpg';
        expect(isValidFilename(path2)).toEqual(false);

        const path3 = 'file...file.jpg';
        expect(isValidFilename(path3)).toEqual(false);
      });

      it('if filename ends with space or period', () => {
        const path1 = 'file.jpg ';
        expect(isValidFilename(path1)).toEqual(false);

        const path2 = 'file.jpg.';
        expect(isValidFilename(path2)).toEqual(false);
      });

      it('if filename contains only space or period', () => {
        const path1 = '.';
        expect(isValidFilename(path1)).toEqual(false);
        const path2 = ' ';
        expect(isValidFilename(path2)).toEqual(false);
      });

      it('if filename is an empty string', () => {
        const path = '';
        expect(isValidFilename(path)).toEqual(false);
      });

      it('if filename length is longer than 255 char', () => {
        const filename255Chars =
          'Lorem ipsum dolor sit amet consectetuer adipiscing elit Aenean commodo ligula eget dolor Aenean massa Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus Donec quam felis ultricies nec pellentesque eu pretium quis semq ult';

        const filename256Chars =
          'Lorem ipsum dolor sit amet consectetuer adipiscing elit Aenean commodo ligula eget dolor Aenean massa Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus Donec quam felis ultricies nec pellentesque eu pretium quis semq ultr';

        expect(isValidFilePath(filename255Chars)).toEqual(true);
        expect(isValidFilePath(filename256Chars)).toEqual(false);
      });
    });
  });

  describe('isValidFilePath', () => {
    // FIXME: unable to spy, to fix
    // it('validates path using isValidFilename', () => {
    //   const isValidFilenameSpy = jest.spyOn(utils, 'isValidFilename');

    //   const directory = 'path';
    //   const filename = 'file.jpg';
    //   const path = directory + '/' + filename;

    //   isValidFilePath(path);

    //   expect(isValidFilenameSpy).toBeCalledWith(directory);
    //   expect(isValidFilenameSpy).toBeCalledWith(filename);
    // });

    describe('should return true if given', () => {
      it('filename with extension only', () => {
        const path = 'file.jpg';
        expect(isValidFilePath(path)).toEqual(true);
      });

      it('filename without extension only', () => {
        const path = 'file';
        expect(isValidFilePath(path)).toEqual(true);
      });

      it('filename with more than 1 period between subnames', () => {
        const path = 'file.file.jpg';
        expect(isValidFilePath(path)).toEqual(true);
      });

      it('directory and filename with extension', () => {
        const path = 'path/file.jpg';
        expect(isValidFilePath(path)).toEqual(true);
      });

      it('multiple directories and filename with extension', () => {
        const path = 'path1/path2/path3/file.jpg';
        expect(isValidFilePath(path)).toEqual(true);
      });
    });

    describe('should return false if given', () => {
      it('entire path length with more than 260 chars', () => {
        const path260Chars =
          'Lorem ipsum dolor sit amet consectetuer adipiscing elit Aenean commodo ligula eget dolor Aenean massa Cum sociis natoque/penatibus et magnis dis parturient montes, nascetur ridiculus mus Donec quam felis ultricies nec pellentesque eu pretium quis semq ultricie';

        const path261Chars =
          'Lorem ipsum dolor sit amet consectetuer adipiscing elit Aenean commodo ligula eget dolor Aenean massa Cum sociis natoque/penatibus et magnis dis parturient montes, nascetur ridiculus mus Donec quam felis ultricies nec pellentesque eu pretium quis semq ultricies';

        expect(isValidFilePath(path260Chars)).toEqual(true);
        expect(isValidFilePath(path261Chars)).toEqual(false);
      });

      it('filename contains one of the excluded characters', () => {
        const excludedCharactersList = ['<', '>', ':', '"', '\\', '|', '?', '*'];
        for (let i = 0; i < 32; i++) {
          // 00 to 1F
          excludedCharactersList.push(String.fromCharCode(i));
        }

        function createFilenameWithExcludedCharacter(excludedChar: string) {
          return 'file' + excludedChar + '.jpg';
        }

        excludedCharactersList.forEach((char) => expect(isValidFilePath(createFilenameWithExcludedCharacter(char))).toEqual(false));
      });

      it('directory contains one of the excluded characters', () => {
        const excludedCharactersList = ['<', '>', ':', '"', '\\', '|', '?', '*'];
        for (let i = 0; i < 32; i++) {
          // 00 to 1F
          excludedCharactersList.push(String.fromCharCode(i));
        }

        function createFilenameWithExcludedCharacter(excludedChar: string) {
          return 'path' + excludedChar + '/file.jpg';
        }

        excludedCharactersList.forEach((char) => expect(isValidFilePath(createFilenameWithExcludedCharacter(char))).toEqual(false));
      });

      it('filename contains more than 1 consecutive period', () => {
        const path1 = 'file..jpg';
        expect(isValidFilePath(path1)).toEqual(false);

        const path2 = 'file..file.jpg';
        expect(isValidFilePath(path2)).toEqual(false);

        const path3 = 'file...file.jpg';
        expect(isValidFilePath(path3)).toEqual(false);
      });

      it('directory contains more than 1 consecutive period', () => {
        const path2 = 'pa..th/file.jpg';
        expect(isValidFilePath(path2)).toEqual(false);

        const path3 = 'pa..th/file.jpg';
        expect(isValidFilePath(path3)).toEqual(false);
      });

      it('filename ends with space or period', () => {
        const path1 = 'file.jpg ';
        expect(isValidFilePath(path1)).toEqual(false);

        const path2 = 'file.jpg.';
        expect(isValidFilePath(path2)).toEqual(false);
      });

      it('directory ends with space or period', () => {
        const path1 = 'path /file.jpg';
        expect(isValidFilePath(path1)).toEqual(false);

        const path2 = 'path./file.jpg';
        expect(isValidFilePath(path2)).toEqual(false);
      });

      it('filename contains only space or period', () => {
        const path1 = '.';
        expect(isValidFilename(path1)).toEqual(false);
        const path2 = ' ';
        expect(isValidFilename(path2)).toEqual(false);
      });

      it('directory contains only space or period', () => {
        const path1 = './file.jpg';
        expect(isValidFilename(path1)).toEqual(false);
        const path2 = ' /file.jpg';
        expect(isValidFilename(path2)).toEqual(false);
      });

      it('if filename is an empty string', () => {
        const path = '';
        expect(isValidFilename(path)).toEqual(false);
      });
    });
  });

  describe('isValidAgencyPasswordFilePath', () => {
    // FIXME: unable to spy, to fix
    // it('should validate every key with isValidFilePath', () => {
    //   const isValidFilePathSpy = jest.spyOn(utils, 'isValidFilePath');

    //   const path1 = 'path1/file1.jpg';
    //   const path2 = 'path2/file2.jpg';

    //   const mockAgencyPassword = {
    //     [path1]: 'password1',
    //     [path2]: 'password1',
    //   };

    //   isValidAgencyPasswordFilePath(mockAgencyPassword);

    //   expect(isValidFilePathSpy).toBeCalledWith(path1);
    //   expect(isValidFilePathSpy).toBeCalledWith(path2);
    // });

    describe('should return true if', () => {
      it('contains valid file path as key and valid password as value', () => {
        const mockAgencyPassword = {
          'path/file.jpg': 'password',
        };

        expect(isValidAgencyPasswordFilePath(mockAgencyPassword)).toEqual(true);
      });

      it('contains multiple valid file path as key and valid password as value', () => {
        const mockAgencyPassword = {
          'path1/file1.jpg': 'password1',
          'path2/file2.pdf': 'password2',
          'path3/file3.xlsx': 'password3',
        };

        expect(isValidAgencyPasswordFilePath(mockAgencyPassword)).toEqual(true);
      });
      it('contains multiple valid file path as key and duplicate valid password as value', () => {
        const mockAgencyPassword = {
          'path1/file1.jpg': 'password',
          'path2/file2.pdf': 'password',
          'path3/file3.xlsx': 'password',
        };

        expect(isValidAgencyPasswordFilePath(mockAgencyPassword)).toEqual(true);
      });
    });

    describe('should return false if', () => {
      it('contains invalid file path as key', () => {
        const mockAgencyPassword = {
          'path1/file1..jpg': 'password1',
        };

        expect(isValidAgencyPasswordFilePath(mockAgencyPassword)).toEqual(false);
      });
    });
  });

  describe('agencyPasswordPasswordValidation', () => {
    describe('should return true if', () => {
      it('passwords is a string with length less than max length', () => {
        const mockAgencyPassword = {
          'path1/file1.jpg': 'password',
          'path1/file2.jpg': 'p@ssw0rd',
          'path1/file3.jpg': 'pa55word',
        };

        expect(agencyPasswordPasswordValidation(mockAgencyPassword, FILE_ENCRYPTION_MAX_PASSWORD_CHAR)).toEqual(true);
      });
    });

    describe('should return false if', () => {
      it('password is not a string or is an empty string', () => {
        const mockAgencyPassword1 = {
          'path1/file1.jpg': 1,
        } as unknown as AgencyPassword;

        expect(agencyPasswordPasswordValidation(mockAgencyPassword1, FILE_ENCRYPTION_MAX_PASSWORD_CHAR)).toEqual(false);

        const mockAgencyPassword2 = {
          'path1/file1.jpg': '',
        };

        expect(agencyPasswordPasswordValidation(mockAgencyPassword2, FILE_ENCRYPTION_MAX_PASSWORD_CHAR)).toEqual(false);
      });

      it('password length is more than max length', () => {
        const password201Chars =
          'Lorem ipsum dolor sit amet consectetuer adipiscing elit Aenean commodo ligula eget dolor Aenean massa Cum sociis natoque/penatibus et magnis dis parturient montes, nascetur ridiculus mus Donec quam fel';

        const mockAgencyPassword = {
          'path1/file1.jpg': password201Chars,
        };

        expect(agencyPasswordPasswordValidation(mockAgencyPassword, FILE_ENCRYPTION_MAX_PASSWORD_CHAR)).toEqual(false);
      });
    });
  });

  describe('isNotDuplicateAgencyPasswordFilePath', () => {
    it('[NOT TESTED, SEE COMMENTS] should return false if contains duplicate file path as key', () => {
      // Unable to test duplicate path, since object cannot have duplicate key. But json is able to have.
    });
  });

  describe('pluralise', () => {
    const singularRegularNoun = 'file';
    const pluralRegularNoun = 'files';
    const singularIrregularNoun = 'wolf';
    const pluralIrregularNoun = 'wolves';
    it('should be singular if count is 1', () => {
      expect(pluralise(1, singularRegularNoun)).toBe(singularRegularNoun);
      expect(pluralise(1, singularRegularNoun, pluralRegularNoun)).toBe(singularRegularNoun);

      expect(pluralise(1, singularIrregularNoun, pluralIrregularNoun)).toBe(singularIrregularNoun);
    });

    it('should be plural if count is 0', () => {
      expect(pluralise(0, singularRegularNoun)).toBe(pluralRegularNoun);
      expect(pluralise(0, singularRegularNoun, pluralRegularNoun)).toBe(pluralRegularNoun);

      expect(pluralise(0, singularIrregularNoun, pluralIrregularNoun)).toBe(pluralIrregularNoun);
    });

    it('should be plural if count is > 1', () => {
      expect(pluralise(2, singularRegularNoun)).toBe(pluralRegularNoun);
      expect(pluralise(2, singularRegularNoun, pluralRegularNoun)).toBe(pluralRegularNoun);

      expect(pluralise(2, singularIrregularNoun, pluralIrregularNoun)).toBe(pluralIrregularNoun);
    });
  });

  describe('transformFirstLetterUppercase', () => {
    it('should return correct values', () => {
      const fullCaps = 'HELLO WORLD';
      const allLower = 'hello world';
      const randomCase = 'heLlo woRlD';
      const kebabCase = 'hello-world';
      const screamKebabCase = 'HELLO-WORLD';
      const beginsWithNonAlphabet = '12345 hello WORLD';

      expect(transformFirstLetterUppercase(fullCaps)).toEqual('Hello world');
      expect(transformFirstLetterUppercase(allLower)).toEqual('Hello world');
      expect(transformFirstLetterUppercase(randomCase)).toEqual('Hello world');
      expect(transformFirstLetterUppercase(kebabCase)).toEqual('Hello-world');
      expect(transformFirstLetterUppercase(screamKebabCase)).toEqual('Hello-world');
      expect(transformFirstLetterUppercase(beginsWithNonAlphabet)).toEqual('12345 hello world');
    });
  });

  describe('transformAllFirstLetterUppercase', () => {
    it('should return correct values', () => {
      const fullCaps = 'HELLO WORLD';
      const allLower = 'hello world';
      const randomCase = 'heLlo woRlD';
      const kebabCase = 'hello-world';
      const screamKebabCase = 'HELLO-WORLD';

      expect(transformAllFirstLetterUppercase(fullCaps)).toEqual('Hello World');
      expect(transformAllFirstLetterUppercase(allLower)).toEqual('Hello World');
      expect(transformAllFirstLetterUppercase(randomCase)).toEqual('Hello World');
      expect(transformAllFirstLetterUppercase(kebabCase)).toEqual('Hello-world');
      expect(transformAllFirstLetterUppercase(screamKebabCase)).toEqual('Hello-world');
    });
  });

  describe('stringSanitizerTransformer', () => {
    class StringSanitiserTest {
      @Transform(stringSanitizerTransformer)
      input: string;
    }
    it('should sanitise the input string', () => {
      const inputOne = 'test<p>this</p>';
      const expectedOutputOne = 'testthis';
      const firstTest = plainToClass(StringSanitiserTest, { input: inputOne });
      expect(firstTest.input).toEqual(expectedOutputOne);
    });
    it('should not alter the input as it is not string', () => {
      const inputTwo = 123;
      const expectedOutputTwo = 123;
      const secondTest = plainToClass(StringSanitiserTest, { input: inputTwo });
      expect(secondTest.input).toEqual(expectedOutputTwo);

      const inputThree = false;
      const expectedOutputThree = false;
      const thirdTest = plainToClass(StringSanitiserTest, { input: inputThree });
      expect(thirdTest.input).toEqual(expectedOutputThree);
    });
  });

  describe('queryParamArrayTransformer', () => {
    class TestClass {
      @Transform(queryParamArrayTransformer)
      agencyCodes: string[];
    }

    it('should non empty array when string is given with items separated by delimiter "," ', () => {
      const test = plainToClass(TestClass, { agencyCodes: 'agency1,agency2' });
      expect(test.agencyCodes).toEqual(['agency1', 'agency2']);
    });

    it('should return empty array when empty string is given', () => {
      const test = plainToClass(TestClass, { agencyCodes: '' });
      expect(test.agencyCodes).toEqual([]);
    });

    it('should return empty array when string with spaces is given', () => {
      const test = plainToClass(TestClass, { agencyCodes: '   ' });
      expect(test.agencyCodes).toEqual([]);
    });
  });
});
