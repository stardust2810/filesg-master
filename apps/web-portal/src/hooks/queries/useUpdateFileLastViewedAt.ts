import { useMutation, useQueryClient } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

export const useUpdateFileLastViewedAt = (fileAssetUuid?: string, token?: string) => {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const updateLastViewedAt = async () => {
    const medium = getRoutePath(token, isCorporateUser && isCorppassEnabled);
    const url = `/v1/file${medium}/${fileAssetUuid}/lastViewedAt`;
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
