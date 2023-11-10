import {
  EXCEPTION_ERROR_CODE,
  isFileSGError,
  isFileSGErrorType,
  Verify1FaNonSingpassRequest,
  Verify1FaNonSingpassResponse,
} from '@filesg/common';
import { sendToastMessage } from '@filesg/design-system';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';

export const EXPECTED_EXCEPTION_ERROR_CODES = [
  EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_INVALID_CREDENTIAL,
  EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_BAN,
];

interface Props {
  onSuccess?: (data: Verify1FaNonSingpassResponse, variables: Verify1FaNonSingpassRequest, context: unknown) => void | Promise<unknown>;
}

export const useNonSingpass1FaVerification = ({ onSuccess }: Props) => {
  const verify = async (verifyParams: Verify1FaNonSingpassRequest) => {
    const response = await apiCoreServerClient.post<Verify1FaNonSingpassResponse>('/v1/non-singpass-verification/verify-1fa', verifyParams);
    return response.data;
  };

  return useMutation(verify, {
    onSuccess,
    onError: (error) => {
      if (!isFileSGError(error) || !isFileSGErrorType(error, EXPECTED_EXCEPTION_ERROR_CODES)) {
        sendToastMessage('Server error. Please try again later.', 'error');
      }
    },
  });
};
