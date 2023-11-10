import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

// gd TODO: move this to useCorppassLogin, and import into here
interface LoginQueryBody {
  uin: string;
  uen: string;
  role: string;
  nonce: string;
}

export const useMockCorppassLogin = () => {
  const login = async (loginParams: Omit<LoginQueryBody, 'nonce'>) => {
    try {
      await apiCoreServerClient.post('/v1/auth/mock-corppass-login', { ...loginParams, nonce: 'mock' });
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
