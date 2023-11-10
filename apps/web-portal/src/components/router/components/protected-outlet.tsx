import { USER_TYPE } from '@filesg/common';
import { PropsWithChildren, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { REDIRECTION_PATH_KEY, WebPage } from '../../../consts';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import {
  selectIsSessionTimedout as selectIsNonSingpassSessionTimedout,
  selectNonSingpassVerified,
} from '../../../store/slices/non-singpass-session';
import {
  selectIsAfterLogout,
  selectIsSessionMissing,
  selectIsSessionTimedout,
  selectIsUserLoggedIn,
  selectUserOnboarded,
  selectUserType,
} from '../../../store/slices/session';
import { getRedirectionPath } from '../../../utils/common';

interface Props {
  showNonSingpassLogin?: boolean;
  allowNonSingpassSession?: boolean;
}

export interface ProtectedRouteState {
  auth: boolean;
  nonSingpassLogin: boolean;
}

export function ProtectedOutlet({ showNonSingpassLogin = false, allowNonSingpassSession = false }: PropsWithChildren<Props>) {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
  const userOnboarded = useAppSelector(selectUserOnboarded);
  const userType = useAppSelector(selectUserType);
  const isAfterLogout = useAppSelector(selectIsAfterLogout);
  const redirectionPath = getRedirectionPath();

  const isSessionTimeout = useAppSelector(selectIsSessionTimedout);
  const isSessionMissing = useAppSelector(selectIsSessionMissing);
  const isNonSingpassVerified = useAppSelector(selectNonSingpassVerified);
  const isNonSingpassSessionTimeout = useAppSelector(selectIsNonSingpassSessionTimedout);

  useEffect(() => {
    if (isSessionTimeout || isNonSingpassSessionTimeout || isSessionMissing) {
      navigate(WebPage.ROOT, { replace: true });
      return;
    }

    if (isAfterLogout) {
      navigate(WebPage.LOGOUT, { state: { auth: false, nonSingpass: showNonSingpassLogin }, replace: true });
      return;
    }

    if (location.pathname === WebPage.LOGOUT) {
      navigate(WebPage.ROOT, { replace: true });
      return;
    }

    if (!isUserLoggedIn) {
      if (!allowNonSingpassSession || !isNonSingpassVerified) {
        // Redirect them to the public citizen page, but save the current location
        // they were trying to go to when they were redirected. This allows us to
        // send them along to that page after they login, which is a nicer user
        // experience than dropping them off on the home page.
        sessionStorage.setItem(REDIRECTION_PATH_KEY, location.pathname + location.search);
        navigate(WebPage.ROOT, { state: { auth: true, nonSingpass: showNonSingpassLogin } });
      }
      return;
    }

    if (userType === USER_TYPE.CITIZEN && userOnboarded !== true) {
      navigate(WebPage.ONBOARDING, { replace: true });
      return;
    }

    if (redirectionPath === WebPage.ONBOARDING) {
      navigate(WebPage.HOME, { replace: true });
    }
  }, [
    dispatch,
    location.pathname,
    location.search,
    navigate,
    showNonSingpassLogin,
    isUserLoggedIn,
    userOnboarded,
    isAfterLogout,
    redirectionPath,
    allowNonSingpassSession,
    isNonSingpassVerified,
    isSessionTimeout,
    isSessionMissing,
    isNonSingpassSessionTimeout,
    userType,
  ]);

  return <Outlet />;
}
