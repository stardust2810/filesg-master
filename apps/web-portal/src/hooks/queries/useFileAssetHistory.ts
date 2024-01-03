import { FileHistoryDisplayResponse, PaginationOptions } from '@filesg/common';
import { InfiniteData, useInfiniteQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

interface QueryOptions {
  fileAssetId: string;
  onSuccess?: (data: InfiniteData<FileHistoryDisplayResponse>) => void;
}

export const useFileAssetHistory = ({ limit }: PaginationOptions, { fileAssetId, onSuccess }: QueryOptions, token?: string) => {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const fetchFileAssetHistory = async ({ pageParam = 1 }) => {
    const medium = getRoutePath(token, isCorporateUser && isCorppassEnabled);
    const url = `/v1/file${medium}/${fileAssetId}/history?page=${pageParam}&limit=${limit}`;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;

    const response = await apiCoreServerClient.get<FileHistoryDisplayResponse>(url, config);
    // await new Promise((r) => setTimeout(r, 5000));
    // return { fileHistory: [], totalRecords: 0, nextPage: undefined };
    return response.data;
  };

  return useInfiniteQuery([QueryKey.FILE_HISTORY, fileAssetId, limit], fetchFileAssetHistory, {
    onSuccess,
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });
};
