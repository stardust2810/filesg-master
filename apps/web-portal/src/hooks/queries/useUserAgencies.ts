import { AgencyListResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface QueryOptions {
  onSuccess?: (data: AgencyListResponse) => void;
  onError?: (err: AxiosError) => void;
}

export const useUserAgencies = ({ onSuccess, onError }: QueryOptions = {}) => {
  const getUserAgencies = async () => {
    const response = await apiCoreServerClient.get<AgencyListResponse>(`/v1/user/citizen/agency-list`);
    return response.data;
  };

  return useQuery<AgencyListResponse, AxiosError>(QueryKey.GET_USER_DETAILS, getUserAgencies, {
    onSuccess,
    onError,
  });
};
