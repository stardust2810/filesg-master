import { ViewableFileAssetResponse } from '@filesg/common';
import { AxiosError, AxiosRequestConfig } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

export const useFileAsset = (fileAssetUuid?: string, token?: string) => {
  const fetchFileAsset = async () => {
    const url = `/v1/file/${token ? 'non-singpass/' : ''}${fileAssetUuid}`;
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
