import { DetailUserResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';

interface QueryOptions {
  onSuccess?: (data: DetailUserResponse) => void;
  onError?: (err: AxiosError) => void;
}

export const useGetProfileDetails = ({ onSuccess, onError }: QueryOptions = {}) => {
  const getProfileDetails = async () => {
    const response = await apiCoreServerClient.get<DetailUserResponse>(`/v1/user/detail`);
    return response.data;
  };

  return useQuery<DetailUserResponse, AxiosError>(QueryKey.GET_USER_DETAILS, getProfileDetails, {
    onSuccess,
    onError,
    enabled: false,
  });
};
