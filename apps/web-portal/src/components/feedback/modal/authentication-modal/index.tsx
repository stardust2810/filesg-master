import { FEATURE_TOGGLE } from '@filesg/common';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { config } from '../../../../config/app-config';
import { WebPage } from '../../../../consts';
import { WOGAA_TRACKING_ID } from '../../../../consts/analytics';
import { trackWogaaTransaction } from '../../../../utils/common';
import { AuthenticationOptionModal } from '../authentication-option-modal';
import { MockCorppassLoginModal } from '../mock-corppass-login-modal';
import { MockLoginModal } from '../mock-login-modal';
import { NonSingpassLoginModal } from '../non-singpass-login-modal';
import { SingpassAuthenticationOptionModal } from '../singpass-authentication-option-modal';

enum AuthModalType {
  AUTH_OPTION = 'auth-option',
  SINGPASS_AUTH_OPTION = 'singpass-auth-option',
  LOGIN = 'login',
  NON_SINGPASS_LOGIN = 'non-singpass-login',
  MOCK_LOGIN = 'mock-login',
  MOCK_CORPPASS_LOGIN = 'mock-corppass-login',
}

interface AuthModalProps {
  title?: string;
  onCloseModal: () => void;
  canNonSingpassLogin?: boolean;
  canCorppassLogin?: boolean;
  showSingpassOptionsOnly?: boolean;
}

const AuthenticationModal = ({ title, onCloseModal, canNonSingpassLogin, showSingpassOptionsOnly, canCorppassLogin }: AuthModalProps) => {
  const { hash } = useLocation();

  const [type, setType] = useState<AuthModalType | null>(null);

  // ===========================================================================
  // Effects
  // ===========================================================================
  const navigate = useNavigate();

  useEffect(() => {
    switch (hash.replace('#', '')) {
      case AuthModalType.AUTH_OPTION:
        setType(AuthModalType.AUTH_OPTION);
        break;
      case AuthModalType.SINGPASS_AUTH_OPTION:
        setType(AuthModalType.SINGPASS_AUTH_OPTION);
        break;
      case AuthModalType.LOGIN:
        setType(AuthModalType.LOGIN);
        break;
      case AuthModalType.MOCK_LOGIN:
        setType(AuthModalType.MOCK_LOGIN);
        break;
      case AuthModalType.MOCK_CORPPASS_LOGIN:
        setType(AuthModalType.MOCK_CORPPASS_LOGIN);
        break;
      case AuthModalType.NON_SINGPASS_LOGIN:
        setType(AuthModalType.NON_SINGPASS_LOGIN);
        break;

      default:
        setType(AuthModalType.AUTH_OPTION);
        break;
    }
  }, [hash]);

  useEffect(() => {
    if (showSingpassOptionsOnly) {
      setType(AuthModalType.SINGPASS_AUTH_OPTION);
      window.location.hash = AuthModalType.SINGPASS_AUTH_OPTION;
      return;
    }
    setType(AuthModalType.AUTH_OPTION);
    window.location.hash = AuthModalType.AUTH_OPTION;
  }, [showSingpassOptionsOnly]);

  // ===========================================================================
  // Handlers
  // ===========================================================================

  const handleNavToAuthOption = () => {
    if (showSingpassOptionsOnly) {
      setType(AuthModalType.SINGPASS_AUTH_OPTION);
      window.location.hash = AuthModalType.SINGPASS_AUTH_OPTION;
      return;
    }
    setType(AuthModalType.AUTH_OPTION);
    window.location.hash = AuthModalType.AUTH_OPTION;
  };

  const handleNavToLogin = (isCorppass: boolean) => {
    if (config.mockAuth === FEATURE_TOGGLE.ON) {
      handleNavToMockLogin(isCorppass);
      return;
    }
    onCloseModal();
    navigate(`${WebPage.SINGPASS_AUTHCALLBACK}?isLoginAttempt=true`);
  };

  const startWogaaTrackingForNonSingpassRetrieval = () => {
    trackWogaaTransaction('START', WOGAA_TRACKING_ID.NON_SINGPASS_RETRIEVAL);
  };

  const handleNavToNonSingpassLogin = () => {
    setType(AuthModalType.NON_SINGPASS_LOGIN);
    window.location.hash = AuthModalType.NON_SINGPASS_LOGIN;
  };

  const handleNavToMockLogin = (isCorppass: boolean) => {
    setType(isCorppass ? AuthModalType.MOCK_CORPPASS_LOGIN : AuthModalType.MOCK_LOGIN);
    window.location.hash = isCorppass ? AuthModalType.MOCK_CORPPASS_LOGIN : AuthModalType.MOCK_LOGIN;
  };

  const handleCloseModal = () => {
    setType(null);
    onCloseModal();
    window.location.hash = '';
  };

  // ===========================================================================
  // Utils
  // ===========================================================================

  const contentSwitch = () => {
    switch (type) {
      case AuthModalType.AUTH_OPTION:
        return (
          <AuthenticationOptionModal
            title={title ? title : undefined}
            onSingpassButtonClick={() => handleNavToLogin(false)}
            onNonSingpassButtonClick={
              canNonSingpassLogin
                ? () => {
                    startWogaaTrackingForNonSingpassRetrieval();
                    handleNavToNonSingpassLogin();
                  }
                : undefined
            }
            onCorppassButtonClick={canCorppassLogin ? () => handleNavToLogin(true) : undefined}
            onClose={handleCloseModal}
          />
        );
      case AuthModalType.SINGPASS_AUTH_OPTION:
        return (
          <SingpassAuthenticationOptionModal
            title={title ? title : undefined}
            onForBusinessesButtonClick={() => handleNavToLogin(true)}
            onSingpassButtonClick={() => handleNavToLogin(false)}
            onClose={handleCloseModal}
          />
        );
      case AuthModalType.NON_SINGPASS_LOGIN:
        return <NonSingpassLoginModal onBackButtonClick={handleNavToAuthOption} onClose={handleCloseModal} />;
      case AuthModalType.MOCK_LOGIN:
        return <MockLoginModal onBackButtonClick={handleNavToAuthOption} onClose={handleCloseModal} />;
      case AuthModalType.MOCK_CORPPASS_LOGIN:
        return <MockCorppassLoginModal onBackButtonClick={handleNavToAuthOption} onClose={handleCloseModal} />;

      default:
        return null;
    }
  };

  return <>{contentSwitch()}</>;
};

export default AuthenticationModal;
