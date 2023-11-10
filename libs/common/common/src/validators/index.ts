import {
  getMetadataStorage,
  MetadataStorage,
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidationTypes,
} from 'class-validator';
import { addDays, addMonths, addYears, endOfDay, isAfter, isBefore, isEqual, startOfDay } from 'date-fns';

import {
  findNonASCIICharactersWithPositions,
  isDateValid,
  IsDateValidOptions,
  isUinfinMasked,
  isUinfinValid,
  isValidFilename,
} from '../utils';

export function IsValidFileSGDate(
  validDateOptions: IsDateValidOptions = {
    allowEmptyMonthDay: false,
    allowedDate: 'ANY',
    includeTimestamp: false,
  },
  validationOptions?: ValidationOptions,
) {
  const errorMessage = (allowedDate: IsDateValidOptions['allowedDate']) => {
    let additionalMsg = '';

    switch (allowedDate) {
      case 'FUTURE':
        additionalMsg = ', larger than current date,';
        break;
      case 'PAST':
        additionalMsg = ', less than or equal to current date,';
        break;
    }

    return `Date input must be valid${additionalMsg} and in the format of (yyyy-mm-dd${
      validDateOptions.includeTimestamp ? 'Thh:mm:ss.SSSZ' : ''
    })`;
  };

  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidFileSGDate',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: errorMessage(validDateOptions.allowedDate),
        ...validationOptions,
      },
      validator: { validate: (value) => isDateValid(value, validDateOptions) },
    });
  };
}

export function IsValidUin(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidUin',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Input must be valid uin',
        ...validationOptions,
      },
      validator: { validate: isUinfinValid },
    });
  };
}

export function IsMaskedUin(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsMaskedUin',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Input must be masked uin',
        ...validationOptions,
      },
      validator: { validate: isUinfinMasked },
    });
  };
}

export function isValidSgMobile(value: string) {
  return /^\+65[89]\d{7}$/.test(value);
}

export function IsValidSgMobile(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidSgMobile',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Input must be a valid Singapore mobile (e.g. +6581234567)',
        ...validationOptions,
      },
      validator: { validate: isValidSgMobile },
    });
  };
}

export function isASCIIString(val: string) {
  return !findNonASCIICharactersWithPositions(val, true);
}

export function IsASCIICharactersOnlyString(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isASCIICharactersOnlyString',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: 'Input value must contains only ASCII characters',
        ...validationOptions,
      },
      validator: { validate: isASCIIString },
    });
  };
}

/**
 * Checks for either fields (property arg & field applied with decorator) to be present.
 * Works only for 2 fields.
 * Requires ValidateIf decorator to be used in conjuction.
 */
export function EitherOr(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EitherOr',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: `Input can only take one of either values (${propertyName}, ${property})`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const hasPropertyField = Object.keys(args.object).includes(relatedPropertyName);
          return !hasPropertyField;
        },
      },
    });
  };
}

/**
 * Enhanced ValidateIf that takes in a condition and run the validators if returned true
 * It takes in a condition, array of rules to validate and a error message
 */
export function EnhancedValidateIf(
  condition: (object: any) => boolean,
  rules: Array<(value: any, args: ValidationArguments) => boolean>,
  message: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'EnhancedValidateIf',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        ...validationOptions,
        message,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!condition(args.object)) {
            return true;
          }

          for (const rule of rules) {
            if (!rule(value, args)) {
              return false;
            }
          }

          return true;
        },
      },
    });
  };
}

export function NotMatchingRegex(pattern: RegExp, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      constraints: [pattern],
      options: {
        ...validationOptions,
      },
      validator: {
        validate: (value: string) => !value.match(pattern),
      },
    });
  };
}

export function IsValidFilename(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidFilename',
      target: object.constructor,
      propertyName: propertyName,
      options: { message: 'Input must be a valid filename', ...validationOptions },
      validator: {
        validate(value: any) {
          return typeof value === 'string' && isValidFilename(value);
        },
      },
    });
  };
}

/**
 * Checks if date is after specified field
 */
export function IsAfterDate(property: string, canBeEqual = false, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsAfterDate',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: `Input must be after ${canBeEqual ? 'or equal to ' : ''}${property} date`,
        ...validationOptions,
      },
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const comparedDate = (args.object as Record<string, unknown>)[relatedPropertyName] as string;

          if (!comparedDate) {
            return true;
          }

          if (canBeEqual) {
            return isEqual(new Date(value), new Date(comparedDate)) || isAfter(new Date(value), new Date(comparedDate));
          }

          return isAfter(new Date(value), new Date(comparedDate));
        },
      },
    });
  };
}

/**
 * Checks if date is within specified field + date range
 */
export function IsWithinDateRange(property: string, dateRange: number, dayMonthOrYear: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsWithinDateRange',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: {
        message: `Input must be within ${dateRange} ${dayMonthOrYear}s after ${property} date`,
        ...validationOptions,
      },
      validator: {
        validate(value: string, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const comparedDate = (args.object as Record<string, unknown>)[relatedPropertyName] as string;

          if (!comparedDate) {
            return true;
          }

          switch (dayMonthOrYear) {
            case 'day':
              return isBefore(startOfDay(new Date(value)), endOfDay(addDays(new Date(comparedDate), dateRange)));
            case 'month':
              return isBefore(startOfDay(new Date(value)), endOfDay(addMonths(new Date(comparedDate), dateRange)));
            case 'year':
              return isBefore(startOfDay(new Date(value)), endOfDay(addYears(new Date(comparedDate), dateRange)));
            default:
              return false;
          }
        },
      },
    });
  };
}

/**
 * Allow null value but not undefined
 *
 *  Referenced from the original IsOptional decorator
 *  ref: https://github.com/typestack/class-validator/blob/develop/src/decorator/common/IsOptional.ts
 */
export function IsNullable(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    const validationMetadata = {
      type: ValidationTypes.CONDITIONAL_VALIDATION,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [
        (object: any): boolean => {
          return object[propertyName] !== null;
        },
      ],
      ...(validationOptions && {
        message: validationOptions.message,
        groups: validationOptions.groups,
        always: validationOptions.always,
        each: validationOptions.each,
        context: validationOptions.context,
      }),
    } as Parameters<InstanceType<typeof MetadataStorage>['addValidationMetadata']>[0];

    getMetadataStorage().addValidationMetadata(validationMetadata);
  };
}

export function isNull(value: unknown) {
  return value === null;
}

export function IsRecord(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isRecord',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'The $property must be a Record<string, string> where both the key and value are strings and should not be empty.',
        ...validationOptions,
      },
      validator: {
        validate(value: any) {
          if (!value || typeof value !== 'object' || !Object.keys(value).length) {
            return false;
          }

          for (const key in value) {
            if (typeof key !== 'string' || typeof value[key] !== 'string') {
              return false;
            }
          }

          return true;
        },
      },
    });
  };
}

export function IsStringEndsWith(searchString: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isStringEndsWith',
      target: object.constructor,
      propertyName,
      constraints: [],
      options: {
        message: `String must end with ${searchString}`,
        ...validationOptions,
      },
      validator: {
        validate: (value) => {
          if (typeof value !== 'string') {
            return false;
          }

          return value.endsWith(searchString);
        },
      },
    });
  };
}
