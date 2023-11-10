import { AllFileAssetUuidsResponse, SORT_BY, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { FileAssetSortOptions } from '../../typings';

export const useAllFileAssetUuids = (
  sortOptions: FileAssetSortOptions = {
    sortBy: SORT_BY.CREATED_AT,
    asc: false,
    agencyCode: null,
  },
  isEnabled = true,
) => {
  const { sortBy, asc, agencyCode } = sortOptions;

  const fetchUserAllFileAssetUuids = async () => {
    let endpoint = `/v1/file/all-files/list?sortBy=${sortBy}&asc=${asc}&statuses=${VIEWABLE_FILE_STATUSES.join(',')}`;
    if (agencyCode) {
      endpoint = `${endpoint}&agencyCode=${agencyCode}`;
    }
    const response = await apiCoreServerClient.get<AllFileAssetUuidsResponse>(endpoint);
    return response.data;
  };

  return useQuery([QueryKey.FILES, sortBy, asc, agencyCode], fetchUserAllFileAssetUuids, {
    enabled: isEnabled,
  });
};
