import { AgencyListResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { useQuery } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { QueryKey } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectIsCorporateUser } from '../../store/slices/session';
import { useFeature } from '../common/useFeature';
import { useAppSelector } from '../common/useSlice';

interface QueryOptions {
  onSuccess?: (data: AgencyListResponse) => void;
  onError?: (err: AxiosError) => void;
}

export const useUserAgencies = ({ onSuccess, onError }: QueryOptions = {}) => {
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);
  const getUserAgencies = async () => {
    const endPoint = isCorporateUser && isCorppassEnabled ? `/v1/corppass/user/corppass/agency-list` : `/v1/user/citizen/agency-list`;
    const response = await apiCoreServerClient.get<AgencyListResponse>(endPoint);
    return response.data;
  };

  return useQuery<AgencyListResponse, AxiosError>(QueryKey.GET_USER_DETAILS, getUserAgencies, {
    onSuccess,
    onError,
  });
};
