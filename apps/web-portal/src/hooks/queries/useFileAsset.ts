import { ViewableFileAssetResponse } from '@filesg/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

export const useFileAsset = (fileAssetUuid?: string, token?: string) => {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);
  const medium = getRoutePath(token, isCorporateUser && isCorppassEnabled);

  const fetchFileAsset = async () => {
    const url = `/v1/file${medium}/${fileAssetUuid}`;
    const config: AxiosRequestConfig | undefined = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await apiCoreServerClient.get<ViewableFileAssetResponse>(url, config);
    return response.data;
  };

  return useQuery<ViewableFileAssetResponse, AxiosError<ViewableFileAssetResponse>>([QueryKey.FILES, fileAssetUuid], fetchFileAsset, {
    enabled: !!fileAssetUuid,
  });
};
