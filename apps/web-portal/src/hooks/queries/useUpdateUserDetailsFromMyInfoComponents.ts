import { MyInfoComponentUserDetailsResponse, SSO_ESERVICE } from '@filesg/common';
import { AxiosError } from 'axios';
import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { selectSsoEservice } from '../../store/slices/session';
import { useAppSelector } from '../common/useSlice';

export function useUpdateUserDetailsFromMyInfoComponents() {
  const ssoEservice = useAppSelector(selectSsoEservice);

  async function updateUserDetailsFromMyInfoComponent() {
    let myInfoComponentUrl = '/v1/auth/update-user-from-myinfo';

    // eslint-disable-next-line sonarjs/no-small-switch
    switch (ssoEservice) {
      case SSO_ESERVICE.MY_ICA:
        myInfoComponentUrl = '/v1/auth/update-user-from-mcc';
        break;
      default:
        break;
    }

    const response = await apiCoreServerClient.get<MyInfoComponentUserDetailsResponse>(myInfoComponentUrl, { timeout: 15 * 1000 });
    return response.data;
  }

  const queryClient = useQueryClient();

  return useMutation<MyInfoComponentUserDetailsResponse, AxiosError<MyInfoComponentUserDetailsResponse>>(
    updateUserDetailsFromMyInfoComponent,
    {
      onSuccess: async () => {
        await queryClient.invalidateQueries(QueryKey.GET_USER_DETAILS);
      },
    },
  );
}
