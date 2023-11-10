import { exec } from 'child_process';
import { ValidationError } from 'class-validator';
import { createHash } from 'crypto';

import { MaskType, PROPERTY_KEY_TO_NAME_MAP } from '../constants/common.constant';

export const execShellCmd = async (cmd: string) => {
  return new Promise<string>((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error || stderr) {
        reject(error ?? stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const escapeString = (str: string) => str.replace(/ /g, '\\ ');

/*
Recursively transverse the children until there are no children and flatten the errors

Sample input

[{
  "property": "storeListingVariantPriceOverrides",
  "children": [
    {
      "property": "0",
      "children": [
        {
          "property": "storeId",
          "children": [],
          "constraints": {
            "isNumber": "storeId must be a number conforming to the specified constraints",
            "constraint2": "storeId must be something else",
          }
        }
      ]
    }
  ]
}]

Sample output
{ stordId: "storeId must be a number conforming to the specified constraints, storeId must be something else" }
*/
type ErrorData = Record<string, string>;

/**
 * Given the error format from class-validator, this function returns an object where property name is the key
 * and the concated constraint errors of the property is the value
 */
export const transformValidationErrorsToErrorData = (validationErrors: ValidationError[], parentPropertyName = ''): ErrorData => {
  return Object.assign(
    {},
    ...validationErrors.map((validationError) => {
      const { property, constraints, children } = validationError;
      const propertyName = parentPropertyName ? `${parentPropertyName}.${property}` : property;

      if (!children || children.length === 0) {
        return { [propertyName]: Object.values(constraints!).join(', ') }; // If no children property, must have constraint
      }

      const childrenConstraints = transformValidationErrorsToErrorData(children, propertyName);

      if (constraints) {
        return Object.assign({ [propertyName]: Object.values(constraints).join(', ') }, childrenConstraints);
      } else {
        return childrenConstraints;
      }
    }),
  );
};

export function generateChecksum(fileBuffer: Buffer | string | Uint8Array) {
  return createHash('sha256').update(fileBuffer).digest('hex');
}

export function getNextPage(totalCount: number, page: number, limit: number): number | null {
  return totalCount - page * limit > 0 ? page + 1 : null;
}

export const maskString = (stringToMask: string, numToMask: number, maskType: MaskType) => {
  if (numToMask > stringToMask.length) {
    return stringToMask;
  }
  let prefix = '';
  let maskStartIndex = 0;

  if (maskType === MaskType.UIN) {
    maskStartIndex = 1;
    prefix = stringToMask[0];
  }

  const { length } = stringToMask;
  const frontPart = stringToMask.substring(maskStartIndex, length - numToMask);
  const backPart = stringToMask.substring(length - numToMask, length);
  return prefix + '*'.repeat(frontPart.length) + backPart;
};

export const maskUin = (uinToMask: string) => {
  return maskString(uinToMask, 4, MaskType.UIN);
};

export const isClassValidatorErrors = (error: any): error is ValidationError[] => {
  return Array.isArray(error) && !!error[0].property;
};

/**
 * Given the error format from class-validator, this function traverses through the children of each of the errors,
 * get the property key, contruct a string indicating the property is invalid and return the string for each of the errors
 */
export const transformValidationErrorsToFormSgSubTypes = (validationErrors: ValidationError[]): string[] => {
  const subTypes: string[] = [];

  validationErrors.forEach((validationError) => {
    const { property, children } = validationError;

    if (!children || children.length === 0) {
      subTypes.push(`${PROPERTY_KEY_TO_NAME_MAP[property]} is invalid`);
      return;
    }

    const result = transformValidationErrorsToFormSgSubTypes(children);
    subTypes.push(...result);
  });

  return Array.from(new Set(subTypes));
};
