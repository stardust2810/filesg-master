import { GetLoginContextResponse } from '@filesg/common';
import { useMutation } from 'react-query';

import { apiCoreServerClient } from '../../config/api-client';

export const useLoginContext = (isCorppass?: boolean) => {
  const loginContext = async () => {
    try {
      return await apiCoreServerClient.get<GetLoginContextResponse>(
        isCorppass ? '/v1/auth/corppass/login-context' : '/v1/auth/login-context',
      );
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
