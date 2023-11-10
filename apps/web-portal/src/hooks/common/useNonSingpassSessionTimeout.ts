import { sendToastMessage } from '@filesg/design-system';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import * as workerTimers from 'worker-timers';

import {
  resetNonSingpassSession,
  resetNonSingpassSessionDueToTimeout,
  selectContentRetrievalToken,
  selectExpiryDurationSecs,
  selectHasShownExpiryBanner,
  selectIsSessionWarningPopUpShown,
  selectTokenExpiry,
  selectWarningDurationSecs,
  setHasShownExpiryBanner,
  setIsSessionWarningPopUpShown,
} from '../../store/slices/non-singpass-session';
import { selectIsUserLoggedIn } from '../../store/slices/session';
import { useLogout } from '../queries/useLogout';
import { useAppDispatch, useAppSelector } from './useSlice';
import { useWakeUpEvent } from './useWakeUpEvent';

export const useNonSingpassSessionTimeout = () => {
  const nonSingpassSessionExpiryToast = useRef<number | string | null>(null);

  const [showSessionLogoutModal, setShowSessionLogoutModal] = useState(false);
  const [isAboutToAbsoluteTimeout, setIsAboutToAbsoluteTimeout] = useState(false);
  const [countDownTimerTimeStamp, setCountDownTimerTimeStamp] = useState<Date | null>(null);

  const { mutate: logout } = useLogout();

  const dispatch = useAppDispatch();
  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
  const isSessionWarningPopUpShown = useAppSelector(selectIsSessionWarningPopUpShown);

  const hasValidRetrivalToken = useAppSelector(selectContentRetrievalToken);
  const nonSingpassTokenExpiry = useAppSelector(selectTokenExpiry);
  const expiryDurationSecs = useAppSelector(selectExpiryDurationSecs);
  const hasShownExpiryBanner = useAppSelector(selectHasShownExpiryBanner);
  const nonSingpassSessionWarningSecs = useAppSelector(selectWarningDurationSecs);
  const { isAwake, resetIsAwake } = useWakeUpEvent(hasValidRetrivalToken !== '');

  useEffect(() => {
    if (hasValidRetrivalToken === '') {
      toast.dismiss(nonSingpassSessionExpiryToast.current!);
      return;
    }

    if (hasShownExpiryBanner) {
      return;
    }

    dispatch(setHasShownExpiryBanner(true));
    nonSingpassSessionExpiryToast.current = sendToastMessage(
      {
        title: 'Close the tab when you are done',
        description: `This session will automatically expire in ${formatDuration(
          intervalToDuration({ start: 0, end: expiryDurationSecs * 1000 }),
        )}. Close the tab once you are done, to prevent other people from accessing the information.`,
      },
      'warning',
      { autoClose: false, closeOnClick: true, delay: 500 },
    );
  }, [dispatch, expiryDurationSecs, hasShownExpiryBanner, hasValidRetrivalToken]);

  useEffect(() => {
    if (!hasValidRetrivalToken || isSessionWarningPopUpShown) {
      return;
    }

    const nonSingpassSessionWarningDuration =
      new Date(nonSingpassTokenExpiry).getTime() - new Date().getTime() - nonSingpassSessionWarningSecs * 1000;

    const nonSingpassSessionWarning = workerTimers.setTimeout(() => {
      setCountDownTimerTimeStamp(new Date(nonSingpassTokenExpiry));
      setIsAboutToAbsoluteTimeout(true);
      setShowSessionLogoutModal(true);
      dispatch(setIsSessionWarningPopUpShown(true));
    }, nonSingpassSessionWarningDuration);

    resetIsAwake();

    return () => {
      nonSingpassSessionWarning && workerTimers.clearTimeout(nonSingpassSessionWarning);
    };
  }, [
    dispatch,
    hasValidRetrivalToken,
    isAboutToAbsoluteTimeout,
    isSessionWarningPopUpShown,
    nonSingpassSessionWarningSecs,
    nonSingpassTokenExpiry,
    isAwake,
    resetIsAwake,
  ]);

  useEffect(() => {
    if (!hasValidRetrivalToken) {
      return;
    }

    const clearNonSingpassSession = new Date(nonSingpassTokenExpiry).getTime() - new Date().getTime();

    if (clearNonSingpassSession <= 0) {
      dispatch(resetNonSingpassSession());
      return;
    }

    const nonSingpassSessionEndTimer =
      !isUserLoggedIn &&
      workerTimers.setTimeout(() => {
        setShowSessionLogoutModal(false);
        toast.dismiss(nonSingpassSessionExpiryToast.current!);
        dispatch(resetNonSingpassSessionDueToTimeout());
      }, clearNonSingpassSession);

    // Reset non singpass session once user logged in
    if (isUserLoggedIn) {
      dispatch(resetNonSingpassSession());
      nonSingpassSessionEndTimer && workerTimers.clearTimeout(nonSingpassSessionEndTimer);
    }

    resetIsAwake();

    return () => {
      nonSingpassSessionEndTimer && workerTimers.clearTimeout(nonSingpassSessionEndTimer);
    };
  }, [dispatch, hasValidRetrivalToken, logout, nonSingpassTokenExpiry, isUserLoggedIn, isAwake, resetIsAwake]);

  const onSessionTimeoutModalClose = () => {
    setShowSessionLogoutModal(false);
  };

  return {
    countDownTimerTimeStamp,
    isAboutToAbsoluteTimeout,
    showSessionLogoutModal,
    onSessionTimeoutModalClose,
  };
};
