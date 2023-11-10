import { EXCEPTION_ERROR_CODE, UserContactUpdateVerifyOtpRequest } from '@filesg/common';
import { sendToastMessage } from '@filesg/design-system';
import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { isFileSGError, isFileSGErrorType } from '../../utils/common';

interface Props {
  onSuccess?: () => void;
}

export const EXPECTED_EXCEPTION_ERROR_CODES = [
  EXCEPTION_ERROR_CODE.OTP_INVALID,
  EXCEPTION_ERROR_CODE.OTP_EXPIRED,
  EXCEPTION_ERROR_CODE.OTP_MAX_RETRIES_REACHED,
  EXCEPTION_ERROR_CODE.OTP_DOES_NOT_EXIST,
  EXCEPTION_ERROR_CODE.CONTACT_UPDATE_BAN,
];

export const useUserContactUpdateOtpVerify = ({ onSuccess }: Props = {}) => {
  const verifyOtp = async ({ channel, inputOtp }: UserContactUpdateVerifyOtpRequest) => {
    const body: UserContactUpdateVerifyOtpRequest = {
      channel,
      inputOtp,
    };

    const response = await apiCoreServerClient.post('v1/user-contact-update/verify-otp', body);
    return response.data;
  };

  const queryClient = useQueryClient();

  return useMutation(verifyOtp, {
    onSuccess: async () => {
      onSuccess && onSuccess();
      await queryClient.invalidateQueries(QueryKey.GET_USER_DETAILS);
    },
    onError: (error) => {
      if (!isFileSGError(error) || !isFileSGErrorType(error, EXPECTED_EXCEPTION_ERROR_CODES)) {
        sendToastMessage('Server error. Please try again later.', 'error');
      }
    },
  });
};
