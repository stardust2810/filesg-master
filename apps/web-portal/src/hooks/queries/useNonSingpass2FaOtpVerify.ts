import { EXCEPTION_ERROR_CODE, Verify2FaOtpNonSingpassResponse } from '@filesg/common';
import { sendToastMessage } from '@filesg/design-system';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { updateNonSingpassSession } from '../../store/slices/non-singpass-session';
import { isFileSGError, isFileSGErrorType } from '../../utils/common';
import { useAppDispatch } from '../common/useSlice';

interface VerifyOtpParam {
  token: string;
  otp: string;
}

export const EXPECTED_EXCEPTION_ERROR_CODES = [
  EXCEPTION_ERROR_CODE.OTP_INVALID,
  EXCEPTION_ERROR_CODE.OTP_EXPIRED,
  EXCEPTION_ERROR_CODE.OTP_MAX_RETRIES_REACHED,
  EXCEPTION_ERROR_CODE.OTP_DOES_NOT_EXIST,
  EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_BAN,
  EXCEPTION_ERROR_CODE.BAD_REQUEST,
];

export const useNonSingpass2FaOtpVerify = () => {
  const dispatch = useAppDispatch();

  const verifyOtp = async ({ token, otp }: VerifyOtpParam) => {
    const response = await apiCoreServerClient.post<Verify2FaOtpNonSingpassResponse>(
      'v1/non-singpass-verification/verify-otp',
      { inputOtp: otp },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  };

  return useMutation(verifyOtp, {
    onSuccess: ({ sessionId, accessToken, tokenExpiry, expiryDurationSecs, warningDurationSecs }) => {
      dispatch(
        updateNonSingpassSession({
          sessionId,
          contentRetrievalToken: accessToken,
          tokenExpiry,
          expiryDurationSecs,
          warningDurationSecs,
          hasPerformedDocumentAction: false,
        }),
      );
    },
    onError: (error) => {
      if (!isFileSGError(error) || !isFileSGErrorType(error, EXPECTED_EXCEPTION_ERROR_CODES)) {
        sendToastMessage('Server error. Please try again later.', 'error');
      }
    },
  });
};
