import { AllFileAssetUuidsResponse, FILE_ASSET_SORT_BY, VIEWABLE_FILE_STATUSES } from '@filesg/common';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { FileAssetSortOptions } from '../../typings';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

export const useAllFileAssetUuids = (
  sortOptions: FileAssetSortOptions = {
    sortBy: FILE_ASSET_SORT_BY.CREATED_AT,
    asc: false,
    agencyCodes: null,
  },
  isEnabled = true,
) => {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);
  const medium = getRoutePath(null, isCorporateUser && isCorppassEnabled);

  const { sortBy, asc, agencyCodes } = sortOptions;

  const fetchUserAllFileAssetUuids = async () => {
    let endpoint = `/v1/file${medium}/all-files/list?sortBy=${sortBy}&asc=${asc}&statuses=${VIEWABLE_FILE_STATUSES.join(',')}`;

    if (agencyCodes) {
      endpoint = `${endpoint}&agencyCodes=${agencyCodes}`;
    }

    const response = await apiCoreServerClient.get<AllFileAssetUuidsResponse>(endpoint);
    return response.data;
  };

  return useQuery([QueryKey.FILES, sortBy, asc, agencyCodes], fetchUserAllFileAssetUuids, {
    enabled: isEnabled,
  });
};
