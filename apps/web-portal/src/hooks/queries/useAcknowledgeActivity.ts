import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
interface Props {
  activityUuid?: string;
  onSuccess: () => void;
  onError: (error: unknown) => void;
  token?: string;
}
export const useAcknowledgeActivity = ({ activityUuid, onError, onSuccess, token }: Props) => {
  const acknowledgeActivity = async () => {
    const url = token ? 'v1/transaction/non-singpass/activity/acknowledge' : `/v1/transaction/activities/${activityUuid}/acknowledge`;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await apiCoreServerClient.post<null>(url, undefined, config);
    return response.data;
  };

  const queryClient = useQueryClient();

  return useMutation(acknowledgeActivity, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QueryKey.ACTIVITY, activityUuid]);
      onSuccess();
    },
    onError,
  });
};
