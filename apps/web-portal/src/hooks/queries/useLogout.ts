import { EXCEPTION_ERROR_CODE, isFileSGErrorType, LogoutResponse } from '@filesg/common';
import { AxiosError } from 'axios';
import { BroadcastChannel } from 'broadcast-channel';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { apiCoreServerClient } from '../../config/api-client';
import { WebPage } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { resetApp, selectSessionTimeout, updateApp } from '../../store/slices/app';
import { initialState, selectCreatedAt, selectIsCorporateUser, selectIsSessionTimedout, setSession } from '../../store/slices/session';
import { getRoutePath } from '../../utils/common';
import { useFeature } from '../common/useFeature';
import { useAppDispatch, useAppSelector } from '../common/useSlice';

const LOGOUT = 'logout';
const INVALID_SESSION_DETECTED = 'INVALID_SESSION';
const DUPLICATE_SESSION_DETECTED = 'DUPLICATE_SESSION';

type iLogoutBroadcastMsg = {
  type: string;
  value: string | null;
};
const logoutSyncChannel: BroadcastChannel<iLogoutBroadcastMsg> = new BroadcastChannel('logout-state-sync');

export const useLogout = (willNavigate = true) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const createdAt = useAppSelector(selectCreatedAt);
  const isSessionTimeout = useAppSelector(selectIsSessionTimedout);
  const sessionTimeout = useAppSelector(selectSessionTimeout);
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isCorppassEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const logout = async () => {
    const medium = getRoutePath(null, isCorporateUser && isCorppassEnabled);
    const url = `/v1/auth${medium}/logout`;
    const response = await apiCoreServerClient.post<LogoutResponse>(url);
    return response.data;
  };

  const onNonValidSessionDetected = (isSessionMissing: boolean) => {
    dispatch(
      setSession({
        ...initialState,
        isSessionMissing,
        isAfterLogout: true,
        isLoggedOut: true,
        isSessionTimedout: true,
      }),
    );

    dispatch(updateApp({ sessionTimeout: null }));

    if (willNavigate) {
      navigate(WebPage.ROOT);
    }
  };

  const onLogoutComplete = (sessionEndTime: string | null = null) => {
    performLogout(sessionEndTime);
    logoutSyncChannel.postMessage({ type: LOGOUT, value: sessionEndTime });
  };

  const performLogout = (sessionEndTime: string | null) => {
    if (!sessionTimeout || isSessionTimeout) {
      return;
    }

    dispatch(
      setSession({
        ...initialState,
        isAfterLogout: true,
        createdAt,
        endedAt: sessionEndTime,
      }),
    );

    dispatch(resetApp());

    if (willNavigate) {
      navigate(isSessionTimeout ? WebPage.ROOT : WebPage.LOGOUT, { replace: true });
      window.location.hash = '';
    }
  };

  logoutSyncChannel.onmessage = ({ type, value: sessionEndTime }) => {
    switch (type) {
      case LOGOUT:
        performLogout(sessionEndTime);
        return;
      case INVALID_SESSION_DETECTED:
      case DUPLICATE_SESSION_DETECTED:
        onNonValidSessionDetected(type === DUPLICATE_SESSION_DETECTED);
    }
  };

  return useMutation<LogoutResponse, AxiosError>(logout, {
    onSuccess: ({ sessionEndTime }) => {
      onLogoutComplete(sessionEndTime);
    },
    onError: (error) => {
      const isDuplicateSession = isFileSGErrorType(error, EXCEPTION_ERROR_CODE.DUPLICATE_SESSION);
      onNonValidSessionDetected(isDuplicateSession);
      logoutSyncChannel.postMessage({ type: isDuplicateSession ? DUPLICATE_SESSION_DETECTED : INVALID_SESSION_DETECTED, value: null });
    },
  });
};
