import { fn, Mock } from 'jest-mock';

import { FormSgService } from '../formsg.service';

//FIXME: causes runtime missing dep error when invoking lambda
// "errorType":"Runtime.ImportModuleError","errorMessage":"Error: Cannot find module 'jest-mock'
export const mockFormSgService: Record<keyof FormSgService, Mock<any>> = {
  decryptFormData: fn(),
  decryptFormDataWithAttachments: fn(),
  validateFormId: fn(),
  authenticateWebhook: fn(),
};
