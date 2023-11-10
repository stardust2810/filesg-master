import { FormField } from '@opengovsg/formsg-sdk/dist/types';

import { FormSgFormField, QuestionFieldMap } from '../typings';

export function formUtils(formId: string, map: QuestionFieldMap) {
  function getFieldId(field: FormSgFormField) {
    const formQuestionField = map[formId];
    return formQuestionField[field];
  }

  function getFormResponse(responses: FormField[], field: FormSgFormField) {
    const { answer } = responses.find((response) => response._id === getFieldId(field))!;
    return answer;
  }

  return { getFieldId, getFormResponse };
}
