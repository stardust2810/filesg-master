import { ActivityDetailsResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

export const useActivityDetails = (activityUuid: string, token?: string) => {
  const fetchActivityDetails = async () => {
    const url = token ? 'v1/transaction/non-singpass/activity' : `/v1/transaction/activities/${activityUuid}`;
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
