import { useEffect, useState } from 'react';

import { MINIMUM_LOAD_DELAY_IN_MILLISECONDS } from '../../../consts';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppSelector } from '../../../hooks/common/useSlice';
import { useGetProfileDetails } from '../../../hooks/queries/useGetProfileDetails';
import { selectIsCorporateUser } from '../../../store/slices/session';
import { CitizenUserProfile } from './components/citizen-user-profile';
import { CorporateUserProfile } from './components/corporate-user-profile';
import { ProfileSkeleton } from './components/profile-details-skeleton';
import { StyledContainer } from './style';

const Profile = (): JSX.Element => {
  const [show, setShow] = useState(false);

  const isCorporateUser = useAppSelector(selectIsCorporateUser);

  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle('Profile');

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------
  const { data: userDetails, refetch: getProfileDetails, isLoading } = useGetProfileDetails();

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, MINIMUM_LOAD_DELAY_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, []);

  const isPageLoading = isLoading || (!isLoading && !show);

  useEffect(() => {
    if (!isCorporateUser) {
      getProfileDetails();
    }
  }, [getProfileDetails, isCorporateUser]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const getProfile = () => {
    if (isCorporateUser) {
      return <CorporateUserProfile />;
    } else {
      if (userDetails) {
        return <CitizenUserProfile userDetails={userDetails} />;
      }
    }
  };

  return (
    <StyledContainer>
      {isPageLoading ? <ProfileSkeleton numOfPersonalDetailItems={2} numOfContactFormItems={2} /> : getProfile()}
    </StyledContainer>
  );
};

export default Profile;
