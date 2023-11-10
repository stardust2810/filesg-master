import { AxiosError } from 'axios';
import { BroadcastChannel } from 'broadcast-channel';
import { StatusCodes } from 'http-status-codes';
import { QueryClient } from 'react-query';

import { resetApp, selectSessionTimeout, updateApp } from '../store/slices/app';
import {
  initialState,
  selectExtendSessionWarningDurationInSecs,
  selectIsAfterLogout,
  selectSessionLengthInSecs,
  setSession,
} from '../store/slices/session';
import { store } from '../store/store';

const UPDATE_RESET_SESSION_START_TIME = 'updateResetSessionStartTime';
const ON_UNAUTHORIZED_ACCESS = 'onUnauthorizedAccess';

const sessionSyncChannel: BroadcastChannel<string> = new BroadcastChannel('session-update-session-start-time');

const retryFn = (failureCount, error) => {
  const { response } = error as AxiosError;
  return !(response?.status === StatusCodes.UNAUTHORIZED) && !(failureCount >= 2);
};

const reinitializeRollingSession = () => {
  const sessionTimeout = selectSessionTimeout(store.getState());
  const sessionLengthInSecs = selectSessionLengthInSecs(store.getState());

  if (!sessionTimeout || !sessionLengthInSecs) {
    return;
  }

  if (new Date(sessionTimeout).getTime() - selectExtendSessionWarningDurationInSecs(store.getState())! * 1000 <= new Date().getTime()) {
    return;
  }

  const updatedSessionTimeout = new Date();
  updatedSessionTimeout.setTime(updatedSessionTimeout.getTime() + sessionLengthInSecs * 1000);
  store.dispatch(
    updateApp({
      sessionTimeout: updatedSessionTimeout.toISOString(),
    }),
  );
};

sessionSyncChannel.onmessage = (msg: string) => {
  if (msg === UPDATE_RESET_SESSION_START_TIME) {
    reinitializeRollingSession();
  } else if (msg === ON_UNAUTHORIZED_ACCESS) {
    onUnathorizedAccess();
  }
};

const onUnathorizedAccess = () => {
  if (!selectIsAfterLogout(store.getState())) {
    store.dispatch(
      setSession({
        ...initialState,
        isAfterLogout: false,
        isLoggedOut: true,
        isSessionTimedout: true,
        isSessionMissing: true,
      }),
    );
    store.dispatch(resetApp());
  }
};

const onSuccessHandler = () => {
  reinitializeRollingSession();
  sessionSyncChannel.postMessage(UPDATE_RESET_SESSION_START_TIME);
};

const onErrorHandler = (error) => {
  const { response } = error as AxiosError;
  if (response?.status !== StatusCodes.UNAUTHORIZED) {
    reinitializeRollingSession();
  } else {
    onUnathorizedAccess();
    sessionSyncChannel.postMessage(ON_UNAUTHORIZED_ACCESS);
  }
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: retryFn,
      onSuccess: onSuccessHandler,
      onError: onErrorHandler,
      cacheTime: 0,
    },
    mutations: {
      retry: false,
      onSuccess: onSuccessHandler,
      onError: onErrorHandler,
    },
  },
});
