import { EXCEPTION_ERROR_CODE, OTP_CHANNEL, Send2FaOtpNonSingpassResponse } from '@filesg/common';
import { sendToastMessage } from '@filesg/design-system';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { selectOtpChannel, setOtpDetails } from '../../store/slices/non-singpass-session';
import { isFileSGError, isFileSGErrorType } from '../../utils/common';
import { useAppDispatch, useAppSelector } from '../common/useSlice';

export const EXPECTED_EXCEPTION_ERROR_CODES = [EXCEPTION_ERROR_CODE.NON_SINGPASS_VERIFICATION_BAN];

export const useNonSingpass2FaOtpSend = () => {
  const dispatch = useAppDispatch();
  const otpChannel = useAppSelector(selectOtpChannel);
  const isMobileOtp = otpChannel === OTP_CHANNEL.SMS;

  const sendOtp = async (token: string) => {
    const response = await apiCoreServerClient.post<Send2FaOtpNonSingpassResponse>(
      'v1/non-singpass-verification/send-otp',
      { channel: otpChannel },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  };

  return useMutation(sendOtp, {
    onSuccess: (data) => {
      dispatch(setOtpDetails(data));
      if (data.hasSentOtp) {
        sendToastMessage(`An ${isMobileOtp ? 'SMS' : 'email'} has been sent to you, please use the OTP to proceed.`, 'success', {
          role: undefined,
        });
      }
    },
    onError: (error) => {
      if (!isFileSGError(error) || !isFileSGErrorType(error, EXPECTED_EXCEPTION_ERROR_CODES)) {
        sendToastMessage('Server error. Please try again later.', 'error');
      }
    },
  });
};
