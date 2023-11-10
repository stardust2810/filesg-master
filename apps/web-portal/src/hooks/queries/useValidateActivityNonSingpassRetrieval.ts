import { ValidateActivityNonSingpassRetrievableResponse } from '@filesg/common';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface QueryOptions {
  onSuccess?: (data: ValidateActivityNonSingpassRetrievableResponse) => void;
  onError?: (error: unknown) => void;
}

export const useValidateActivityNonSingpassRetrieval = (activityUuid: string | undefined, { onSuccess, onError }: QueryOptions) => {
  const validateActivity = async () => {
    const response = await apiCoreServerClient.get<ValidateActivityNonSingpassRetrievableResponse>(
      `/v1/transaction/non-singpass/activities/${activityUuid}/validate`,
    );
    return response.data;
  };

  return useQuery([QueryKey.NON_SINGPASS, QueryKey.VALIDATE_ACTIVITY, activityUuid], validateActivity, {
    refetchOnWindowFocus: false,
    enabled: false,
    retry: false,
    onSuccess,
    onError,
  });
};
