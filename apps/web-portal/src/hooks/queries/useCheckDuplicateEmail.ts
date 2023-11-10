import { CheckDuplicateEmailResponse } from '@filesg/common';
import { sendToastMessage } from '@filesg/design-system';
import { AxiosError } from 'axios';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { isFileSGError } from '../../utils/common';

interface QueryOptions {
  onSuccess?: (data: CheckDuplicateEmailResponse) => void;
}

export const useCheckDuplicateEmail = ({ onSuccess }: QueryOptions = {}) => {
  async function isDuplicateEmail(email: string) {
    const response = await apiCoreServerClient.get<CheckDuplicateEmailResponse>(`/v1/user/citizen/duplicate-email/${email}`);
    return response.data;
  }

  return useMutation<CheckDuplicateEmailResponse, AxiosError, string>(isDuplicateEmail, {
    onSuccess,
    onError: (error) => {
      if (!isFileSGError(error)) {
        sendToastMessage('Server error. Please try again later.', 'error');
      }
    },
  });
};
