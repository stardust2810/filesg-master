import { sendToastMessage } from '@filesg/design-system';
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { CenteredSpinner } from '../../../components/feedback/centered-spinner';
import { REDIRECTION_PATH_KEY, WebPage } from '../../../consts';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { useLogin } from '../../../hooks/queries/useLogin';
import { useLoginContext } from '../../../hooks/queries/useLoginContext';
import { selectUserOnboarded } from '../../../store/slices/session';
import { getRedirectionPath } from '../../../utils/common';

const LOGIN_ERROR_MESSAGE = 'Login failed. An unexpected error has occurred. Please try to log in again.';

const AuthCallback = ({ isCorppass }: { isCorppass?: boolean }): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isOnboarded = useAppSelector(selectUserOnboarded);

  const redirectionPath = getRedirectionPath();
  const [searchParams] = useSearchParams();

  const { error, isSuccess, mutate: loginRedirect } = useLogin(isCorppass);
  const { mutate: loginContext, error: loginContextError } = useLoginContext(isCorppass);

  const loginErrorHandler = useCallback(() => {
    sessionStorage.removeItem('state');
    sessionStorage.removeItem('nonce');
    sendToastMessage(LOGIN_ERROR_MESSAGE, 'error', { autoClose: false });
    navigate(WebPage.ROOT, { replace: true });
  }, [navigate]);

  useEffect(() => {
    const isLoginAttempt = searchParams.get('isLoginAttempt');
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    const sessionState = sessionStorage.getItem('state');
    const sessionNonce = sessionStorage.getItem('nonce');

    if (loginContextError) {
      loginErrorHandler();
    }

    if (isLoginAttempt === 'true') {
      loginContext();
      return;
    }

    if (!code || !sessionNonce) {
      loginErrorHandler();
      return;
    }

    //check if the state are the same
    if (state !== sessionState) {
      loginErrorHandler();
      return;
    }

    loginRedirect({ authCode: code, nonce: sessionNonce });
    sessionStorage.removeItem('state');
    sessionStorage.removeItem('nonce');
  }, [loginRedirect, loginErrorHandler, searchParams, loginContext, loginContextError]);

  useEffect(() => {
    if (error) {
      loginErrorHandler();
      return;
    }

    if (isSuccess) {
      if (!isOnboarded) {
        navigate(redirectionPath, { replace: true });
        return;
      }

      const navigationPath = redirectionPath === WebPage.ROOT || redirectionPath === WebPage.ONBOARDING ? WebPage.HOME : redirectionPath;

      sessionStorage.setItem(REDIRECTION_PATH_KEY, WebPage.ROOT);
      navigate(navigationPath, { replace: true });
    }
  }, [dispatch, error, isOnboarded, isSuccess, navigate, loginErrorHandler, redirectionPath]);

  return <CenteredSpinner mainMessage="Logging in..." secondaryMessage="Please wait" />;
};

export default AuthCallback;
