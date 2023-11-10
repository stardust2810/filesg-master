import { BroadcastChannel } from 'broadcast-channel';
import { useCallback, useEffect, useRef, useState } from 'react';
import * as workerTimers from 'worker-timers';

import { resetApp, selectSessionTimeout, updateApp } from '../../store/slices/app';
import {
  initialState,
  selectAbsoluteExpiry,
  selectExtendSessionWarningDurationInSecs,
  selectIsAfterLogout,
  selectIsUserLoggedIn,
  selectSessionLengthInSecs,
  setSession,
  updateSession,
} from '../../store/slices/session';
import { iBroadcastChannelMessage } from '../../typings';
import { useLogout } from '../queries/useLogout';
import { useAppDispatch, useAppSelector } from './useSlice';
import { useWakeUpEvent } from './useWakeUpEvent';

enum SESSION_CHANNEL_TYPE {
  SESSION_TIMEOUT_UPDATED,
  SESSION_HAS_TIMED_OUT,
  CLOSE_SESSION_TIMEOUT_MODAL,
}

const SESSION_STATE_SYNC_CHANNEL_NAME = 'session-state-sync';

export const useSessionTimeout = () => {
  const sessionSyncChannelRef = useRef(new BroadcastChannel(SESSION_STATE_SYNC_CHANNEL_NAME));
  const sessionSyncChannel: BroadcastChannel<iBroadcastChannelMessage<SESSION_CHANNEL_TYPE>> = sessionSyncChannelRef.current;

  const [showSessionLogoutModal, setShowSessionLogoutModal] = useState(false);
  const [isAboutToAbsoluteTimeout, setIsAboutToAbsoluteTimeout] = useState(false);
  const [countDownTimerTimeStamp, setCountDownTimerTimeStamp] = useState<Date | null>(null);

  const { mutate: logout } = useLogout();

  const dispatch = useAppDispatch();
  const isAfterLogout = useAppSelector(selectIsAfterLogout);
  const sessionAbsoluteExpiryAt = useAppSelector(selectAbsoluteExpiry)!;
  const sessionLengthInSecs = useAppSelector(selectSessionLengthInSecs)!;
  const sessionTimeoutRedux = useAppSelector(selectSessionTimeout);
  const extendSessionWarningDurationInMS = useAppSelector(selectExtendSessionWarningDurationInSecs)! * 1000;
  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
  const { isAwake, resetIsAwake } = useWakeUpEvent(isUserLoggedIn);

  const updateAppSessionTimeout = (sessionTimeout: Date) => {
    if (isAfterLogout) {
      return;
    }

    dispatch(
      updateApp({
        sessionTimeout: sessionTimeout.toISOString(),
      }),
    );
  };

  const getNextSessionTimeout = useCallback(() => {
    const nextSessionEndTime = new Date();
    nextSessionEndTime.setTime(nextSessionEndTime.getTime() + sessionLengthInSecs * 1000);
    return nextSessionEndTime;
  }, [sessionLengthInSecs]);

  const sessionTimeoutLogout = useCallback(() => {
    dispatch(
      setSession({
        ...initialState,
        isSessionTimedout: true,
      }),
    );
    dispatch(resetApp());
    logout();
    sessionSyncChannel.postMessage({ type: SESSION_CHANNEL_TYPE.SESSION_HAS_TIMED_OUT, value: true });
  }, [dispatch, logout, sessionSyncChannel]);

  useEffect(() => {
    if (!isUserLoggedIn) {
      return;
    }

    if (!sessionAbsoluteExpiryAt) {
      return;
    }

    const absoluteSessionExpiryInMS = sessionAbsoluteExpiryAt.getTime() - new Date().getTime();
    if (absoluteSessionExpiryInMS <= 0) {
      sessionTimeoutLogout();
      return;
    }

    const sessionTimeoutTimer = workerTimers.setTimeout(() => {
      sessionTimeoutLogout();
    }, absoluteSessionExpiryInMS);

    resetIsAwake();

    return () => {
      workerTimers.clearTimeout(sessionTimeoutTimer);
      setShowSessionLogoutModal(false);
    };
  }, [dispatch, isUserLoggedIn, logout, sessionAbsoluteExpiryAt, sessionSyncChannel, sessionTimeoutLogout, isAwake, resetIsAwake]);

  useEffect(() => {
    if (!isUserLoggedIn || !sessionTimeoutRedux) {
      return;
    }

    if (new Date().getTime() > sessionAbsoluteExpiryAt.getTime()) {
      sessionTimeoutLogout();
      return;
    }

    const sessionTimeout = new Date(sessionTimeoutRedux);
    const timeTillNextWarning = sessionTimeout.getTime() - new Date().getTime() - extendSessionWarningDurationInMS;
    const sessionTimeoutTimer = workerTimers.setTimeout(() => {
      const nextSessionEndTime = getNextSessionTimeout();
      if (nextSessionEndTime.getTime() - extendSessionWarningDurationInMS > sessionAbsoluteExpiryAt.getTime()) {
        setCountDownTimerTimeStamp(sessionAbsoluteExpiryAt);
        setIsAboutToAbsoluteTimeout(true);
      } else {
        setCountDownTimerTimeStamp(sessionTimeout);
        setIsAboutToAbsoluteTimeout(false);
      }
      setShowSessionLogoutModal(true);
    }, timeTillNextWarning);

    resetIsAwake();

    return () => {
      workerTimers.clearTimeout(sessionTimeoutTimer);
      setShowSessionLogoutModal(false);
    };
  }, [
    extendSessionWarningDurationInMS,
    getNextSessionTimeout,
    isUserLoggedIn,
    sessionAbsoluteExpiryAt,
    sessionTimeoutLogout,
    sessionTimeoutRedux,
    isAwake,
    resetIsAwake,
  ]);

  const onSessionReset = () => {
    setShowSessionLogoutModal(false);
    const nextSesssionTimeoutAt = getNextSessionTimeout();
    updateAppSessionTimeout(nextSesssionTimeoutAt);
    sessionSyncChannel.postMessage({ type: SESSION_CHANNEL_TYPE.SESSION_TIMEOUT_UPDATED, value: nextSesssionTimeoutAt });
  };

  sessionSyncChannel.onmessage = ({ type, value }) => {
    switch (type) {
      case SESSION_CHANNEL_TYPE.SESSION_TIMEOUT_UPDATED: {
        setShowSessionLogoutModal(false);
        updateAppSessionTimeout(value as Date);
        break;
      }
      case SESSION_CHANNEL_TYPE.SESSION_HAS_TIMED_OUT: {
        dispatch(
          updateSession({
            isSessionTimedout: value as boolean,
          }),
        );
        break;
      }
      case SESSION_CHANNEL_TYPE.CLOSE_SESSION_TIMEOUT_MODAL: {
        setShowSessionLogoutModal(false);
        break;
      }
    }
  };

  const onSessionTimeoutModalClose = () => {
    setShowSessionLogoutModal(false);
    sessionSyncChannel.postMessage({ type: SESSION_CHANNEL_TYPE.CLOSE_SESSION_TIMEOUT_MODAL });
  };

  return {
    countDownTimerTimeStamp,
    isAboutToAbsoluteTimeout,
    showSessionLogoutModal,
    onSessionReset,
    onSessionTimeoutModalClose,
  };
};
