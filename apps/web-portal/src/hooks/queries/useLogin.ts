import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';

export interface LoginQueryBody {
  authCode: string;
  nonce: string;
}

export const useLogin = (isCorppass?: boolean) => {
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);
  const medium = getRoutePath(null, isCorppass && isCorppassEnabled);
  const url = `/v1/auth${medium}/login`;

  const login = async (loginParams: LoginQueryBody) => {
    try {
      await apiCoreServerClient.post(url, loginParams);
    } catch (error) {
      throw new Error('Failed to login. Redirecting back to login page...');
    }
  };
  const queryClient = useQueryClient();

  return useMutation(login, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QueryKey.GET_USER_SESSION_DETAILS);
    },
  });
};
