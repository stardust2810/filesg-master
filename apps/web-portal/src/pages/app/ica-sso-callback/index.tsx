import { sendToastMessage } from '@filesg/design-system';
import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { TransitionalLoader } from '../../../components/feedback/transitional-loader';
import { REDIRECTION_PATH_KEY, WebPage } from '../../../consts';
import { useAppSelector } from '../../../hooks/common/useSlice';
import { useIcaSso } from '../../../hooks/queries/useIcaSso';
import { selectUserOnboarded } from '../../../store/slices/session';
import { StyledWrapper } from './style';

const IcaSsoCallback = (): JSX.Element => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isOnboarded = useAppSelector(selectUserOnboarded);

  const { error, isSuccess, mutate: loginRedirect } = useIcaSso();

  const navigateBackToLogin = useCallback(() => {
    setTimeout(() => {
      navigate(WebPage.ROOT, { state: { auth: true }, replace: true });
      sendToastMessage('User authentication failed. Please log in to FileSG via Singpass directly.', 'error', {
        autoClose: 5000,
      });
    }, 1000);
  }, [navigate]);

  useEffect(() => {
    const { search } = window.location;
    const searchParams = new URLSearchParams(search);
    const token = searchParams.get('id');

    if (!token) {
      return navigateBackToLogin();
    }

    loginRedirect(token);
  }, [loginRedirect, navigateBackToLogin]);

  useEffect(() => {
    if (isSuccess) {
      if (!isOnboarded) {
        sessionStorage.setItem(REDIRECTION_PATH_KEY, WebPage.FILES);
        return navigate(WebPage.ONBOARDING, { replace: true });
      }

      navigate(WebPage.FILES, { replace: true });
    }
  }, [dispatch, error, isOnboarded, isSuccess, navigate, navigateBackToLogin]);

  useEffect(() => {
    if (error) {
      return navigateBackToLogin();
    }
  }, [error, navigateBackToLogin]);

  return (
    <StyledWrapper>
      <TransitionalLoader />
    </StyledWrapper>
  );
};

export default IcaSsoCallback;
