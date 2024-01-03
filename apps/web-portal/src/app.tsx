import { AnnouncementBanner, Toast } from '@filesg/design-system';
import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';

import AppLayout from './components/layout/app';
import { config } from './config/app-config';
import { useAppDispatch, useAppSelector } from './hooks/common/useSlice';
import { useActiveAnnouncements } from './hooks/queries/useActiveAnnouncements';
import { useFeatures } from './hooks/queries/useFeatures';
import { useGetUserSessionDetails } from './hooks/queries/useGetUserSessionDetails';
import { useHiddenAnnouncementIds } from './hooks/queries/useHiddenAnnouncementIds';
import { resetApp, selectSessionTimeout, setHasUnexpectedError, updateApp } from './store/slices/app';
import { resetSession, setSession } from './store/slices/session';

export const App = () => {
  const dispatch = useAppDispatch();
  const sessionTimeout = useAppSelector(selectSessionTimeout);

  const { data: activeAnnouncements } = useActiveAnnouncements();
  useFeatures();
  const { hiddenAnnouncementIds, hideAnnouncement } = useHiddenAnnouncementIds();

  // ===========================================================================
  // Handlers
  // ===========================================================================

  // To allow reset of hasUnexpectedError whenever user refresh page, to ensure the layout is not affected by the unexpectedError
  useEffect(() => {
    dispatch(setHasUnexpectedError(false));
  }, [dispatch]);

  const onCloseAnnouncementHandler = (announcementId: string) => () => {
    hideAnnouncement(announcementId);
  };

  const { isLoading } = useGetUserSessionDetails({
    onSuccess: (userData) => {
      if (userData) {
        dispatch(
          setSession({
            userName: userData.name,
            userMaskedUin: userData.maskedUin,
            userType: userData.type,
            userRole: userData.role,
            isOnboarded: userData.isOnboarded,
            isAfterLogout: false,
            lastLoginAt: userData.lastLoginAt,
            createdAt: userData.createdAt,
            absoluteExpiry: userData.expiresAt,
            sessionLengthInSecs: userData.sessionLengthInSecs,
            isLoggedOut: false,
            isSessionTimedout: false,
            endedAt: null,
            extendSessionWarningDurationInSecs: userData.extendSessionWarningDurationInSecs,
            isSessionMissing: false,
            ssoEservice: userData.ssoEservice,
            corporateUen: userData.corporateUen,
            corporateName: userData.corporateName,
            accessibleAgencies: userData.accessibleAgencies,
          }),
        );
        updateSessionTimeoutInAppStore(userData.sessionLengthInSecs);
      } else if (sessionTimeout) {
        dispatch(resetApp());
      }
    },
    onError: () => {
      dispatch(resetSession());
      dispatch(resetApp());
    },
  });

  const updateSessionTimeoutInAppStore = (sessionLengthInSecs: number) => {
    if (!sessionTimeout) {
      const sessionTimeoutAt = new Date();
      sessionTimeoutAt.setTime(sessionTimeoutAt.getTime() + sessionLengthInSecs * 1000);
      dispatch(updateApp({ sessionTimeout: sessionTimeoutAt.toISOString() }));
    }
  };

  useEffect(() => {
    if (config.wogaaScriptUrl) {
      const wogaaScript = document.createElement('script');
      wogaaScript.setAttribute('src', config.wogaaScriptUrl);

      const head = document.getElementsByTagName('head')[0];
      head.appendChild(wogaaScript);

      return () => {
        head.removeChild(wogaaScript);
      };
    }
  }, []);

  return (
    <>
      {activeAnnouncements
        .filter(({ id }) => !hiddenAnnouncementIds.includes(id))
        .map(({ id, title, description }) => (
          <AnnouncementBanner key={id} title={title} description={description} onClose={onCloseAnnouncementHandler(id)} type="TECHNICAL" />
        ))}
      <BrowserRouter>
        <AppLayout isUserSessionDetailsLoading={isLoading} />
      </BrowserRouter>
      <Toast />
    </>
  );
};
