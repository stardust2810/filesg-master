import { RetrieveActivityRetrievableOptionsResponse } from '@filesg/common';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface QueryOptions {
  onSuccess?: (data: RetrieveActivityRetrievableOptionsResponse) => void;
  onError?: (error: unknown) => void;
}

export const useActivityRetrievalOptions = (activityUuid: string | undefined, { onSuccess, onError }: QueryOptions) => {
  const validateActivity = async () => {
    const response = await apiCoreServerClient.get<RetrieveActivityRetrievableOptionsResponse>(
      `/v1/transaction/activities/${activityUuid}/retrieval-options`,
    );
    return response.data;
  };

  return useQuery([QueryKey.ACTIVITY_RETRIEVAL_OPTIONS, QueryKey.VALIDATE_ACTIVITY, activityUuid], validateActivity, {
    refetchOnWindowFocus: false,
    enabled: false,
    retry: false,
    onSuccess,
    onError,
  });
};
