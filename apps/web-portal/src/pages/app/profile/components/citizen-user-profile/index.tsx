import { DetailUserResponse } from '@filesg/common';
import { Color, FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { UserDetailsForm } from '../../../../../components/inputs/user-details-form';
import { StyledContainer } from './style';

interface Props {
  userDetails: DetailUserResponse;
}

export const CitizenUserProfile = ({ userDetails }: Props) => {
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isVerifyingMobile, setIsVerifyingMobile] = useState(false);

  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  // ---------------------------------------------------------------------------
  // React hook form
  // ---------------------------------------------------------------------------
  const emailForm = useForm<{ email: string }>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { email: '' },
  });

  const mobileForm = useForm<{ mobile: string }>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { mobile: '' },
  });

  return (
    <StyledContainer>
      <Typography variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} color={Color.GREY80} bold="SEMI" overrideFontFamily="Work Sans">
        My Profile
      </Typography>

      <UserDetailsForm
        userDetails={userDetails}
        emailForm={emailForm}
        mobileForm={mobileForm}
        isEditingEmail={isVerifyingEmail}
        setIsEditingEmail={setIsVerifyingEmail}
        isEditingMobile={isVerifyingMobile}
        setIsEditingMobile={setIsVerifyingMobile}
      />
    </StyledContainer>
  );
};
