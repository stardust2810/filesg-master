import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { LoginQueryBody } from './useLogin';

export const useMockLogin = () => {
  const login = async (loginParams: Pick<LoginQueryBody, 'authCode'>) => {
    try {
      await apiCoreServerClient.post('/v1/auth/mock-login', { ...loginParams, nonce: 'mock' });
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
