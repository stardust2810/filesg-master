import { AllFileAssetsResponse, PaginationOptions, SORT_BY, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { InfiniteData, useInfiniteQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { FileAssetSortOptions } from '../../typings';

interface QueryOptions {
  onSuccess?: (data: InfiniteData<AllFileAssetsResponse>) => void;
}

export const useAllFileAssets = (
  queryParams: FileAssetSortOptions & PaginationOptions = {
    sortBy: SORT_BY.CREATED_AT,
    asc: false,
    page: 1,
    limit: 10,
    agencyCode: null,
    ignoreNull: false,
  },
  isEnabled = true,
  queryOptions?: QueryOptions,
) => {
  const { sortBy, asc, limit, ignoreNull, agencyCode } = queryParams;

  const fetchUserAllFiles = async ({ pageParam = 1 }) => {
    let endpoint = `/v1/file/all-files?sortBy=${sortBy}&asc=${asc}&page=${pageParam}&limit=${limit}&statuses=${VIEWABLE_FILE_STATUSES.join(
      ',',
    )}&ignoreNull=${ignoreNull ?? false}`;
    if (agencyCode) {
      endpoint = `${endpoint}&agencyCode=${agencyCode}`;
    }
    const response = await apiCoreServerClient.get<AllFileAssetsResponse>(endpoint);
    return response.data;
  };

  return useInfiniteQuery([QueryKey.AGENCY_REDIRECT, QueryKey.FILES, sortBy, asc, limit, agencyCode], fetchUserAllFiles, {
    onSuccess: queryOptions?.onSuccess,
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: isEnabled,
  });
};
