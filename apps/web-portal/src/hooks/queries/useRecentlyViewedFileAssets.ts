import { AllFileAssetsResponse, AllRecentFileAssetsResponse, FILE_ASSET_SORT_BY, PaginationOptions } from '@filesg/common';
import { InfiniteData, useInfiniteQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { FileAssetSortOptions } from '../../typings';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

interface QueryOptions {
  onSuccess?: (data: InfiniteData<AllFileAssetsResponse>) => void;
}

export const useRecentlyViewedFileAssets = (
  queryParams: FileAssetSortOptions & PaginationOptions = {
    sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
    asc: false,
    page: 1,
    limit: 10,
    agencyCodes: null,
    ignoreNull: false,
  },
  isEnabled = true,
  queryOptions?: QueryOptions,
) => {
  const { sortBy, asc, limit, ignoreNull, agencyCodes } = queryParams;
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);
  const medium = getRoutePath(null, isCorporateUser && isCorppassEnabled);

  const fetchUserRecentlyViewedFiles = async ({ pageParam = 1 }) => {
    const endpoint = `/v1/file${medium}/recent?page=${pageParam}&limit=${limit}&ignoreNull=${ignoreNull ?? false}`;

    const response = await apiCoreServerClient.get<AllRecentFileAssetsResponse>(endpoint);
    return response.data;
  };

  return useInfiniteQuery([QueryKey.AGENCY_REDIRECT, QueryKey.FILES, sortBy, asc, limit, agencyCodes], fetchUserRecentlyViewedFiles, {
    onSuccess: queryOptions?.onSuccess,
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: isEnabled,
  });
};
