import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

export const useOnboardCitizenUser = () => {
  const onboardCitizenUser = async () => {
    const response = await apiCoreServerClient.put<void>('/v1/user/citizen/onboard');
    return response.data;
  };

  const queryClient = useQueryClient();

  return useMutation(onboardCitizenUser, {
    onSuccess: async () => {
      await queryClient.invalidateQueries(QueryKey.GET_USER_SESSION_DETAILS);
    },
  });
};
