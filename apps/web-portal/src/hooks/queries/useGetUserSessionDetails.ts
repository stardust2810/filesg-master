import { UserSessionDetailsResponse } from '@filesg/common';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface MutationOptions {
  onSuccess?: (data: UserSessionDetailsResponse) => void;
  onError?: (err: unknown) => void;
  fetchAutomatically?: boolean;
  retryEnabled?: boolean;
}

export const useGetUserSessionDetails = (
  { onSuccess, onError, fetchAutomatically, retryEnabled = true }: MutationOptions = { fetchAutomatically: true },
) => {
  const fetchUserSessionDetails = async () => {
    try {
      const response = await apiCoreServerClient.get<UserSessionDetailsResponse>('/v1/auth/user-session-details');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get user session details`);
    }
  };

  return useQuery(QueryKey.GET_USER_SESSION_DETAILS, fetchUserSessionDetails, {
    onSuccess,
    onError,
    enabled: fetchAutomatically,
    retry: retryEnabled,
  });
};
