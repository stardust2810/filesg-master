import { IcaSsoRequest } from '@filesg/common';
import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { selectIsUserLoggedIn } from '../../store/slices/session';
import { useAppSelector } from '../common/useSlice';
import { useLogout } from './useLogout';

export const useIcaSso = () => {
  const { mutateAsync: logout } = useLogout(false);
  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);

  const ssoLogin = async (token: string) => {
    if (isUserLoggedIn) {
      await logout();
    }

    await apiCoreServerClient.post<void, void, IcaSsoRequest>('/v1/auth/ica-sso', { token });
  };

  const queryClient = useQueryClient();

  return useMutation(ssoLogin, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QueryKey.GET_USER_SESSION_DETAILS);
    },
  });
};
