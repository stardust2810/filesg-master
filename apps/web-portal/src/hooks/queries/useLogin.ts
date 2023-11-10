import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

export interface LoginQueryBody {
  authCode: string;
  nonce: string;
}

export const useLogin = (isCorppass?: boolean) => {
  const login = async (loginParams: LoginQueryBody) => {
    try {
      await apiCoreServerClient.post(isCorppass ? '/v1/auth/corppass/login' : '/v1/auth/login', loginParams);
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
