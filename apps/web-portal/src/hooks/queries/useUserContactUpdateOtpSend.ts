import { EXCEPTION_ERROR_CODE, UserContactUpdateSendOtpResponse } from '@filesg/common';
import { sendToastMessage } from '@filesg/design-system';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { isFileSGError, isFileSGErrorType } from '../../utils/common';

export const EXPECTED_EXCEPTION_ERROR_CODES = [EXCEPTION_ERROR_CODE.CONTACT_UPDATE_BAN];

export const useUserContactUpdateOtpSend = (contactType: 'email' | 'mobile') => {
  const sendOtp = async (contact: string) => {
    const response = await apiCoreServerClient.post<UserContactUpdateSendOtpResponse>(
      'v1/user-contact-update/send-otp',
      contactType === 'email' ? { email: contact } : { mobile: contact },
    );
    return response.data;
  };

  return useMutation(sendOtp, {
    onSuccess: (data) => {
      if (data.hasSentOtp) {
        sendToastMessage(`A verification ${contactType === 'mobile' ? 'sms' : 'email'} has been sent`, 'success', { role: undefined });
      }
    },
    onError: (error) => {
      if (!isFileSGError(error) || !isFileSGErrorType(error, EXPECTED_EXCEPTION_ERROR_CODES)) {
        sendToastMessage('Server error. Please try again later.', 'error');
      }
    },
  });
};
