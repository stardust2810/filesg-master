import { AxiosError } from 'axios';
import { useEffect } from 'react';
import { UseQueryResult } from 'react-query';

import { FEATURE_TOGGLE, TOGGLABLE_FEATURES } from '../../consts/features';
import { setFeatures } from '../../store/slices/features';
import { useAppDispatch } from '../common/useSlice';
import { useDownloadUrl } from './useDownloadUrl';

type FeatureToggleResponse = {
  [feature in TOGGLABLE_FEATURES]: FEATURE_TOGGLE;
};

export const useFeatures = () => {
  const useQueryReturns = useDownloadUrl('/config/features.json', { enabled: true, cacheTime: 0 }) as UseQueryResult<
    FeatureToggleResponse,
    AxiosError
  >;
  const { data } = useQueryReturns;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && Object.keys(data).length) {
      dispatch(setFeatures(data));
    }
  }, [data, dispatch]);
};
