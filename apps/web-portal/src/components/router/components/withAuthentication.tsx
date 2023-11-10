import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from '../../../hooks/common/useSlice';
import { selectHasShowedCorppassFirstLoginModal, setHasShowedCorppassFirstLoginModal } from '../../../store/slices/app';
import { selectIsCorporateUserFirstLogin, selectIsUserLoggedIn } from '../../../store/slices/session';
import AuthenticationModal from '../../feedback/modal/authentication-modal';
import { CorppassFirstLoginInformationModal } from '../../feedback/modal/corppass-first-login-information-modal';
import { ProtectedRouteState } from './protected-outlet';

export const withAuthentication = (WrappedComponent) => {
  return (props) => {
    const dispatch = useAppDispatch();
    const { state } = useLocation();
    const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
    const isCorporateUserFirstLogin = useAppSelector(selectIsCorporateUserFirstLogin);
    const hasShowedCorppassFirstLoginModal = useAppSelector(selectHasShowedCorppassFirstLoginModal);

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showCorppassFirstLoginModal, setShowCorppassFirstLoginModal] = useState(false);

    const onClose = () => {
      setShowCorppassFirstLoginModal(false);
    };

    useEffect(() => {
      if (isCorporateUserFirstLogin && !hasShowedCorppassFirstLoginModal) {
        setShowCorppassFirstLoginModal(true);
        dispatch(setHasShowedCorppassFirstLoginModal(true));
      }
    }, [dispatch, hasShowedCorppassFirstLoginModal, isCorporateUserFirstLogin]);

    useEffect(() => {
      const stateFromPrevPage = state as ProtectedRouteState;

      if (stateFromPrevPage) {
        setShowLoginModal(stateFromPrevPage.auth);
      }

      if (isUserLoggedIn) {
        setShowLoginModal(false);
      }
    }, [dispatch, state, isUserLoggedIn]);

    return (
      <>
        {showLoginModal && <AuthenticationModal onCloseModal={() => setShowLoginModal(false)} showSingpassOptionsOnly={true} />}
        {showCorppassFirstLoginModal && <CorppassFirstLoginInformationModal onClose={onClose} onGetStartedButtonClick={onClose} />}
        <WrappedComponent {...props} />
      </>
    );
  };
};
