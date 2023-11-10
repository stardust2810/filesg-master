import { DATE_FORMAT_PATTERNS } from '@filesg/common';
import { FORMSG_FIELD_FILE_NAME_DELIMITER, FORMSG_FIELD_TEXTAREA_DELIMITER, FORMSG_FIELD_YES_NO_OPTION } from '@filesg/formsg';
import { TransformFnParams } from 'class-transformer';
import { format } from 'date-fns';

export const formSgDateTransformer = ({ value }: TransformFnParams) => {
  if (!value) {
    return undefined;
  }
  return format(new Date(value), DATE_FORMAT_PATTERNS.API_FORMAT);
};

export const formSgYesNoBooleanTransformer = ({ value }: TransformFnParams) => {
  if (value === '') {
    return undefined;
  }
  const acceptableTruthyValues = [FORMSG_FIELD_YES_NO_OPTION.YES];
  const acceptableFalseyValues = [FORMSG_FIELD_YES_NO_OPTION.NO];

  if (acceptableTruthyValues.includes(value)) {
    return true;
  }

  if (acceptableFalseyValues.includes(value)) {
    return false;
  }

  // Let IsBoolean validator catch the error if value is not 'parsable'
  return value;
};

export const formSgTextAreaTransformer = ({ value }: TransformFnParams) => {
  if (!value) {
    return undefined;
  }
  return value.split(FORMSG_FIELD_TEXTAREA_DELIMITER).filter((sentence: string) => sentence);
};

export const formSgBatchIssuanceFileNamesTransformer = ({ value }: TransformFnParams): string[] | undefined => {
  if (!value || typeof value !== 'string') {
    return undefined;
  }

  const fileNameList = value.split(FORMSG_FIELD_FILE_NAME_DELIMITER);

  return fileNameList.reduce<string[]>((list, fileName) => {
    // Trim whitespaces
    const trimmedFilename = fileName.trim();

    // Check if empty string
    trimmedFilename && list.push(trimmedFilename);
    return list;
  }, []);
};

export const removeEmptyObjectTransformer = ({ value }: TransformFnParams) => {
  if (!value) {
    return undefined;
  }
  return value.filter((object: Record<string, string>) => {
    return Object.keys(object).length !== 0;
  });
};
