import { AllFileAssetsResponse, FILE_ASSET_SORT_BY, PaginationOptions, VIEWABLE_FILE_STATUSES } from '@filesg/common';
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

export const useAllFileAssets = (
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

  const fetchUserAllFiles = async ({ pageParam = 1 }) => {
    let endpoint = `/v1/file${medium}/all-files?sortBy=${sortBy}&asc=${asc}&page=${pageParam}&limit=${limit}&statuses=${VIEWABLE_FILE_STATUSES.join(
      ',',
    )}&ignoreNull=${ignoreNull ?? false}`;

    if (agencyCodes) {
      endpoint = `${endpoint}&agencyCodes=${agencyCodes}`;
    }

    const response = await apiCoreServerClient.get<AllFileAssetsResponse>(endpoint);
    return response.data;
  };

  return useInfiniteQuery([QueryKey.AGENCY_REDIRECT, QueryKey.FILES, sortBy, asc, limit, agencyCodes], fetchUserAllFiles, {
    onSuccess: queryOptions?.onSuccess,
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: isEnabled,
  });
};
