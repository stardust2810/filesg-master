import { BroadcastChannel } from 'broadcast-channel';
import { useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';

import { QueryKey } from '../../../consts';
import { useNonSingpassSessionTimeout } from '../../../hooks/common/useNonSingpassSessionTimeout';
import { useSessionTimeout } from '../../../hooks/common/useSessionTimeout';
import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { resetApp } from '../../../store/slices/app';
import {
  selectIsSessionTimedout as selectIsNonSingpassSessionTimedout,
  setIsSessionTimedout,
} from '../../../store/slices/non-singpass-session';
import { selectIsSessionMissing, selectIsSessionTimedout, selectIsUserLoggedIn, updateSession } from '../../../store/slices/session';
import { SessionLogoutModal } from '../../feedback/modal/session-logout-modal';
import { SessionTimeoutModal } from '../../feedback/modal/session-timeout-modal';

const USER_LOGIN_STATE_SYNC = 'user-login-state-sync';
const USER_LOGIN_SUCCESS_MESSAGE = 'user-login-success';

export const withSessionModals = (WrappedComponent) => {
  return (props) => {
    const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
    const isSessionTimedout = useAppSelector(selectIsSessionTimedout);
    const isNonSingpassSessionTimedout = useAppSelector(selectIsNonSingpassSessionTimedout);
    const isSessionMissing = useAppSelector(selectIsSessionMissing);

    // ==================================================================================
    //  Broadcast channel to sync the user login across tabs and route them to home page
    // ==================================================================================
    const sessionSyncChannelRef = useRef(new BroadcastChannel(USER_LOGIN_STATE_SYNC));
    const sessionSyncChannel: BroadcastChannel<string> = sessionSyncChannelRef.current;
    const queryClient = useQueryClient();

    useEffect(() => {
      if (isUserLoggedIn) {
        sessionSyncChannel.postMessage(USER_LOGIN_SUCCESS_MESSAGE);
      }
    }, [sessionSyncChannel, isUserLoggedIn]);

    sessionSyncChannel.onmessage = async (msg: string) => {
      if (msg === USER_LOGIN_SUCCESS_MESSAGE && !isUserLoggedIn) {
        await queryClient.invalidateQueries(QueryKey.GET_USER_SESSION_DETAILS);
      }
    };

    const { countDownTimerTimeStamp, isAboutToAbsoluteTimeout, showSessionLogoutModal, onSessionReset, onSessionTimeoutModalClose } =
      useSessionTimeout();

    const {
      countDownTimerTimeStamp: nonSpCountDownTimerTimeStamp,
      isAboutToAbsoluteTimeout: nonSpIsAboutToAbsoluteTimeout,
      showSessionLogoutModal: nonSpShowSessionLogoutModal,
      onSessionTimeoutModalClose: nonSpOnSessionTimeoutModalClose,
    } = useNonSingpassSessionTimeout();

    const dispatch = useAppDispatch();

    const onSessionModalCloseClicked = () => {
      dispatch(resetApp());
      isSessionTimedout && dispatch(updateSession({ isSessionTimedout: false, isSessionMissing: false }));
      isNonSingpassSessionTimedout && dispatch(setIsSessionTimedout(false));
    };

    return (
      <>
        {(isSessionTimedout || isNonSingpassSessionTimedout) && (
          <SessionLogoutModal onModalCloseClicked={onSessionModalCloseClicked} type="SESSION_TIMEOUT" />
        )}

        {isSessionMissing && <SessionLogoutModal onModalCloseClicked={onSessionModalCloseClicked} type="SESSION_MISSING" />}

        {showSessionLogoutModal && countDownTimerTimeStamp && countDownTimerTimeStamp > new Date() && (
          <SessionTimeoutModal
            resetSession={onSessionReset}
            sessionTimeout={countDownTimerTimeStamp}
            onCloseModal={onSessionTimeoutModalClose}
            isAboutToAbsoluteTimeout={isAboutToAbsoluteTimeout}
          />
        )}

        {nonSpShowSessionLogoutModal && nonSpCountDownTimerTimeStamp && nonSpCountDownTimerTimeStamp > new Date() && (
          <SessionTimeoutModal
            sessionTimeout={nonSpCountDownTimerTimeStamp}
            isAboutToAbsoluteTimeout={nonSpIsAboutToAbsoluteTimeout}
            onCloseModal={nonSpOnSessionTimeoutModalClose}
            isNonSingpassSession={true}
          />
        )}
        <WrappedComponent {...props} />
      </>
    );
  };
  // };
};
