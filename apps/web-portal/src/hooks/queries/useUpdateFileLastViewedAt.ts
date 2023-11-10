import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

export const useUpdateFileLastViewedAt = (fileAssetUuid?: string, token?: string) => {
  const updateLastViewedAt = async () => {
    const url = `/v1/file/${token ? 'non-singpass/' : ''}update/${fileAssetUuid}/lastViewedAt`;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;
    const response = await apiCoreServerClient.post(url, undefined, config);
    return response.data;
  };

  const queryClient = useQueryClient();

  /**
   * UpdateFileLastViewedAt is a best effort action that will not affect the front end view.
   * The call will retry 3 times on error.
   **/
  return useMutation(updateLastViewedAt, {
    onSuccess: async () => {
      await queryClient.invalidateQueries([QueryKey.FILES]);
    },
    retry: 3,
  });
};
