import { ActivitiesResponse, ACTIVITY_SORT_BY, PaginationOptions, VIEWABLE_ACTIVITY_TYPES } from '@filesg/common';
import { useInfiniteQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { ActivitiesSortOptions } from '../../typings';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

export const useAllActivities = (
  queryParams: ActivitiesSortOptions & PaginationOptions = {
    sortBy: ACTIVITY_SORT_BY.CREATED_AT,
    asc: false,
    page: 1,
    limit: 10,
    agencyCodes: null,
  },
  isEnabled = true,
) => {
  const { sortBy, asc, limit, agencyCodes } = queryParams;
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const fetchUserActivities = async ({ pageParam = 1 }) => {
    const medium = getRoutePath(null, isCorporateUser && isCorppassEnabled);
    let endpoint = `v1/transaction${medium}/activities?sortBy=${sortBy}&asc=${asc}&page=${pageParam}&limit=${limit}&types=${VIEWABLE_ACTIVITY_TYPES}`;
    if (agencyCodes?.length) {
      endpoint = `${endpoint}&agencyCodes=${agencyCodes}`;
    }
    const response = await apiCoreServerClient.get<ActivitiesResponse>(endpoint);
    return response.data;
  };

  return useInfiniteQuery([QueryKey.ACTIVITIES, sortBy, asc, limit, agencyCodes], fetchUserActivities, {
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: isEnabled,
  });
};
