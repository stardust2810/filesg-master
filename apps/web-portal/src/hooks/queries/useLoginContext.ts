import { GetLoginContextResponse } from '@filesg/common';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';

export const useLoginContext = (isCorppass?: boolean) => {
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);
  const medium = getRoutePath(null, isCorppass && isCorppassEnabled);
  const url = `/v1/auth${medium}/login-context`;
  const loginContext = async () => {
    try {
      return await apiCoreServerClient.get<GetLoginContextResponse>(url);
    } catch (error) {
      throw new Error('Failed to login. Redirecting back to login page...');
    }
  };

  return useMutation(loginContext, {
    onSuccess: async (response) => {
      const redirectUrl = response.data.url;
      const queryParam = getUrlVars(redirectUrl);
      sessionStorage.setItem('state', queryParam.state);
      sessionStorage.setItem('nonce', queryParam.nonce);
      window.location.replace(redirectUrl);
    },
  });
};

function getUrlVars(url): Record<string, string> {
  const vars = {};
  const hashes = url.split('?')[1];
  const hash = hashes.split('&');

  for (let i = 0; i < hash.length; i++) {
    const params = hash[i].split('=');
    vars[params[0]] = params[1];
  }
  return vars;
}
