import { ActivitiesResponse, PaginationOptions, SORT_BY, VIEWABLE_ACTIVITY_TYPES } from '@filesg/common';
import { useInfiniteQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { ActivitiesSortOptions } from '../../typings';

export const useAllActivities = (
  queryParams: ActivitiesSortOptions & PaginationOptions = {
    sortBy: SORT_BY.CREATED_AT,
    asc: false,
    page: 1,
    limit: 10,
    agencyCode: null,
  },
  isEnabled = true,
) => {
  const { sortBy, asc, limit, agencyCode } = queryParams;

  const fetchUserActivities = async ({ pageParam = 1 }) => {
    let endpoint = `v1/transaction/activities?sortBy=${sortBy}&asc=${asc}&page=${pageParam}&limit=${limit}&types=${VIEWABLE_ACTIVITY_TYPES}`;
    if (agencyCode) {
      endpoint = `${endpoint}&agencyCode=${agencyCode}`;
    }
    const response = await apiCoreServerClient.get<ActivitiesResponse>(endpoint);
    return response.data;
  };

  return useInfiniteQuery([QueryKey.ACTIVITIES, sortBy, asc, limit, agencyCode], fetchUserActivities, {
    getNextPageParam: (lastPage) => lastPage.next,
    enabled: isEnabled,
  });
};
