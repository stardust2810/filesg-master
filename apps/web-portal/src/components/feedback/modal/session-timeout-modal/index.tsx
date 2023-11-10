import { Button, Modal, Typography } from '@filesg/design-system';
import { BroadcastChannel } from 'broadcast-channel';
import { formatDuration, intervalToDuration } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as workerTimers from 'worker-timers';

import { WebPage } from '../../../../consts';
import { useAppDispatch } from '../../../../hooks/common/useSlice';
import { useGetUserSessionDetails } from '../../../../hooks/queries/useGetUserSessionDetails';
import { useLogout } from '../../../../hooks/queries/useLogout';
import { resetApp } from '../../../../store/slices/app';
import { initialState, setSession } from '../../../../store/slices/session';
import { iBroadcastChannelMessage } from '../../../../typings';
import { StyledBody, StyledFooter } from './style';

interface Props {
  onCloseModal: () => void;
  resetSession?: () => void;
  sessionTimeout: Date;
  isAboutToAbsoluteTimeout: boolean;
  isNonSingpassSession?: boolean;
}

const COUNT_DOWN_EVERY_ONE_SECOND = 1000;
const ON_SESSION_DESTROYED = 'onSessionDestroyed';
const SESSION_STATE_SYNC_CHANNEL_NAME = 'session-timeout-modal-channel';

export const SessionTimeoutModal = ({
  onCloseModal,
  resetSession,
  sessionTimeout,
  isAboutToAbsoluteTimeout = false,
  isNonSingpassSession = false,
}: Props) => {
  const sessionSyncChannelRef = useRef(new BroadcastChannel(SESSION_STATE_SYNC_CHANNEL_NAME));
  const sessionSyncChannel: BroadcastChannel<iBroadcastChannelMessage<string>> = sessionSyncChannelRef.current;
  const timeLeftInMS = sessionTimeout.getTime() - new Date().getTime();
  const [timeLeft, setTimeleft] = useState(timeLeftInMS);
  const dispatch = useAppDispatch();
  const { refetch } = useGetUserSessionDetails({ fetchAutomatically: false, retryEnabled: false });
  const { mutate: logout } = useLogout();
  const navigate = useNavigate();

  const hasExistingSession = useCallback(async () => {
    const { isSuccess, data } = await refetch();
    return isSuccess && data;
  }, [refetch]);

  const resetStatesAndRouteToRootOnSessionDestroyed = () => {
    dispatch(
      setSession({
        ...initialState,
        isAfterLogout: true,
        isSessionMissing: true,
        isSessionTimedout: true,
      }),
    );
    dispatch(resetApp());
    navigate(WebPage.ROOT, { state: { auth: false } });
  };

  useEffect(() => {
    const countdownTimer = workerTimers.setInterval(() => {
      setTimeleft((prevValue) => prevValue - COUNT_DOWN_EVERY_ONE_SECOND);
    }, COUNT_DOWN_EVERY_ONE_SECOND);

    return () => {
      workerTimers.clearInterval(countdownTimer);
    };
  }, []);

  useEffect(() => {
    const countdownTimer = workerTimers.setTimeout(() => {
      if (!isAboutToAbsoluteTimeout) {
        dispatch(
          setSession({
            ...initialState,
            isAfterLogout: true,
            isSessionTimedout: true,
          }),
        );
        dispatch(resetApp());
        logout();
        navigate(WebPage.ROOT, { state: { auth: false } });
      }
    }, timeLeftInMS - 1000);

    return () => {
      workerTimers.clearTimeout(countdownTimer);
    };
  }, [dispatch, logout, navigate, timeLeftInMS, isAboutToAbsoluteTimeout]);

  const onLogoutClicked = async () => {
    logout();
  };

  const onExtendSessionClicked = async () => {
    (await hasExistingSession()) ? resetSession?.() : onSessionDestroyed();
  };

  const onSessionDestroyed = () => {
    resetStatesAndRouteToRootOnSessionDestroyed();
    sessionSyncChannel.postMessage({ type: ON_SESSION_DESTROYED });
  };

  sessionSyncChannel.onmessage = ({ type }) => {
    if (type === ON_SESSION_DESTROYED) {
      resetStatesAndRouteToRootOnSessionDestroyed();
    }
  };

  const formattedTime = formatDuration(intervalToDuration({ start: 0, end: timeLeft })) || '0 second';

  const conditionalFooter = () => {
    if (!isAboutToAbsoluteTimeout) {
      return (
        <>
          <Button
            label={'Log out'}
            onClick={onLogoutClicked}
            color="DEFAULT"
            decoration="GHOST"
            data-testid="session-timeout-logout-bttn"
          />
          <Button label={'Continue'} onClick={onExtendSessionClicked} color="PRIMARY" data-testid="session-timeout-continue-bttn" />
        </>
      );
    } else {
      return <Button label={'Ok, got it'} onClick={onCloseModal} color="PRIMARY" data-testid="session-timeout-got-it-bttn" />;
    }
  };

  return (
    <Modal>
      <Modal.Card>
        <Modal.Header>
          <Modal.Title data-testid="session-timeout-header">Session timeout</Modal.Title>
        </Modal.Header>
        <StyledBody data-testid="session-timeout-body">
          <Typography variant="BODY">
            Your session will expire in {formattedTime}. {!isAboutToAbsoluteTimeout && 'Would you like to continue?'}
            {isNonSingpassSession && 'You will be redirected to FileSG public homepage when the session expires.'}
          </Typography>
        </StyledBody>
        <StyledFooter>{conditionalFooter()}</StyledFooter>
      </Modal.Card>
    </Modal>
  );
};
