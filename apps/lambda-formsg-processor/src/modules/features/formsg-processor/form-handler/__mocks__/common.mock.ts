import { COMPONENT_ERROR_CODE, EXCEPTION_ERROR_CODE } from '@filesg/common';
import { FormSgService } from '@filesg/formsg';
import { HttpStatus } from '@nestjs/common';
import { AxiosError } from 'axios';

import { MockService } from '../../../../../typings/common.mock';

export const mockFormSgService: MockService<FormSgService> = {
  decryptFormDataWithAttachments: jest.fn(),
  decryptFormData: jest.fn(),
  validateFormId: jest.fn(),
  authenticateWebhook: jest.fn(),
};

export const mockAxiosErrorMessage = 'some axios error message';

export const generateMockAxiosError = (status: HttpStatus, exceptionErrorCode: EXCEPTION_ERROR_CODE, error?: any): AxiosError => {
  return {
    name: 'axios error name',
    isAxiosError: true,
    config: {},
    toJSON: () => ({}),
    message: mockAxiosErrorMessage,
    response: {
      data: {
        data: {
          message: mockAxiosErrorMessage,
          error,
          errorCode: `${COMPONENT_ERROR_CODE.FORMSG_SERVICE}-${exceptionErrorCode}`,
        },
      },
      status,
      statusText: 'error',
      headers: {},
      config: {},
    },
  };
};
