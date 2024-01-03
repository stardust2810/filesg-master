import { ActivityDetailsResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

export const useActivityDetails = (activityUuid: string, token?: string) => {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const fetchActivityDetails = async () => {
    const authenticatedMedium = getRoutePath(null, isCorporateUser && isCorppassEnabled);
    const getAuthenticatedURL = `/v1/transaction${authenticatedMedium}/activities/${activityUuid}`;

    // Note: non-singpass and corppass/singpass have different url
    const url = token ? 'v1/transaction/non-singpass/activity' : getAuthenticatedURL;
    const config = token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined;
    const response = await apiCoreServerClient.get<ActivityDetailsResponse>(url, config);
    return response.data;
  };

  return useQuery<ActivityDetailsResponse, AxiosError>([QueryKey.ACTIVITY, activityUuid], fetchActivityDetails);
};
