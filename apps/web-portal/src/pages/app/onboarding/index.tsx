import { FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { WebPage } from '../../../consts';
import { WOGAA_TRACKING_ID } from '../../../consts/analytics';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppSelector } from '../../../hooks/common/useSlice';
import { selectUserOnboarded } from '../../../store/slices/session';
import { getRedirectionPath, trackWogaaTransaction } from '../../../utils/common';
import { Marketing } from './components/marketing';
import SignupForm from './components/signup-form';
import { StyledMarketingContainer, StyledSignupFormWrapper, StyledWrapper } from './style';

const OnBoarding = () => {
  const navigate = useNavigate();
  const redirectionPath = getRedirectionPath();
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

  const userOnboarded = useAppSelector(selectUserOnboarded);

  // ---------------------------------------------------------------------------
  // Query Hooks
  // ---------------------------------------------------------------------------

  usePageTitle('Onboarding');

  useEffect(() => {
    trackWogaaTransaction('START', WOGAA_TRACKING_ID.ONBOARDING);
  }, []);

  useEffect(() => {
    if (userOnboarded) {
      const navigationPath = redirectionPath === WebPage.ROOT ? WebPage.HOME : redirectionPath;
      navigate(navigationPath, { replace: true });
    }
  }, [navigate, redirectionPath, userOnboarded]);

  return (
    <StyledWrapper>
      <StyledSignupFormWrapper>
        <SignupForm />
      </StyledSignupFormWrapper>

      {!isSmallerThanSmallTablet && (
        <StyledMarketingContainer>
          <Marketing />
        </StyledMarketingContainer>
      )}
    </StyledWrapper>
  );
};

export default OnBoarding;
