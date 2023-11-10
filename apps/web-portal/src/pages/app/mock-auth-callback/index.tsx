import { sendToastMessage } from '@filesg/design-system';
import { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { CenteredSpinner } from '../../../components/feedback/centered-spinner';
import { REDIRECTION_PATH_KEY, WebPage } from '../../../consts';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { useMockCorppassLogin } from '../../../hooks/queries/useMockCorppassLogin';
import { useMockLogin } from '../../../hooks/queries/useMockLogin';
import { selectUserOnboarded } from '../../../store/slices/session';
import { getRedirectionPath } from '../../../utils/common';

const LOGIN_ERROR_MESSAGE = 'Login failed. An unexpected error has occurred. Please try to log in again.';

const MockAuthCallback = ({ isCorppass }: { isCorppass?: boolean }): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isOnboarded = useAppSelector(selectUserOnboarded);

  const redirectionPath = getRedirectionPath();
  const [searchParams] = useSearchParams();

  const { error, isSuccess, mutate: loginRedirect } = useMockLogin();
  const { error: corppassLoginError, isSuccess: isCorppassLoginSuccess, mutate: corppassLoginRedirect } = useMockCorppassLogin();

  const loginErrorHandler = useCallback(() => {
    sessionStorage.removeItem('state');
    sessionStorage.removeItem('nonce');
    sendToastMessage(LOGIN_ERROR_MESSAGE, 'error', { autoClose: false });
    navigate(WebPage.ROOT, { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (isCorppass) {
      const uin = searchParams.get('uin');
      const uen = searchParams.get('uen');
      const role = searchParams.get('role');
      corppassLoginRedirect({ uin: uin!, uen: uen!, role: role! });
    } else {
      const code = searchParams.get('code');
      loginRedirect({ authCode: code! });
    }
    sessionStorage.removeItem('state');
    sessionStorage.removeItem('nonce');
  }, [loginRedirect, loginErrorHandler, isCorppass, searchParams, corppassLoginRedirect]);

  useEffect(() => {
    if (error || corppassLoginError) {
      loginErrorHandler();
      return;
    }

    if (isSuccess || isCorppassLoginSuccess) {
      if (!isOnboarded) {
        navigate(redirectionPath, { replace: true });
        return;
      }
      const navigationPath = redirectionPath === WebPage.ROOT || redirectionPath === WebPage.ONBOARDING ? WebPage.HOME : redirectionPath;

      sessionStorage.setItem(REDIRECTION_PATH_KEY, WebPage.ROOT);
      navigate(navigationPath, { replace: true });
    }
  }, [dispatch, error, isOnboarded, isSuccess, navigate, loginErrorHandler, redirectionPath, isCorppassLoginSuccess, corppassLoginError]);

  return <CenteredSpinner mainMessage="Logging in..." secondaryMessage="Please wait" />;
};

export default MockAuthCallback;
