import {
  Alert,
  Button,
  Checkbox,
  Color,
  ErrorInfo,
  FSG_DEVICES,
  IconLabel,
  RESPONSIVE_VARIANT,
  TextLink,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { UserDetailsForm } from '../../../../../components/inputs/user-details-form';
import { WebPage } from '../../../../../consts';
import { WOGAA_TRACKING_ID } from '../../../../../consts/analytics';
import { INFO_NOT_LOADED_ERROR } from '../../../../../consts/error';
import { useGetProfileDetails } from '../../../../../hooks/queries/useGetProfileDetails';
import { useLogout } from '../../../../../hooks/queries/useLogout';
import { useOnboardCitizenUser } from '../../../../../hooks/queries/useOnboardCitizenUser';
import { useUpdateUserDetailsFromMyInfoComponents } from '../../../../../hooks/queries/useUpdateUserDetailsFromMyInfoComponents';
import { trackWogaaTransaction } from '../../../../../utils/common';
import { SignupFormSkeleton } from './components/skeleton-loader';
import {
  AgreementContainer,
  StyledBodyContainer,
  StyledCtaContainer,
  StyledErrorContainer,
  StyledFormContent,
  StyledFormInfoContainer,
  StyledFormWrapper,
  StyledWrapper,
  TermsContainer,
} from './style';

const SIGN_UP_FORM_TITLE = 'Welcome to FileSG';
const SIGN_UP_FORM_DESC = 'Please check that your particulars and contact details are accurate.';
function SignupForm() {
  /**
   * 1. Make call to backend -> Backend call MyInfo / MCC to retrieve user details
   * 2. Update user record with myInfo details
   * 3a. When user click submit, check if user has email & mobile. Update user isOnboarded: 1
   * 3b. If user changes email -> verify otp -> update email in user record
   * 4b. If user logs out -> come back to onboard, fetch from myInfo again
   */
  const [isEditingEmail, setIsEdittingEmail] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState('');

  const { image, title, descriptions } = INFO_NOT_LOADED_ERROR('page');
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  // =============================================================================
  // Queries
  // =============================================================================
  const {
    data: myInfoData,
    isLoading: isUpdatingMyInfoData,
    error: myInfoError,
    mutate: updateUser,
  } = useUpdateUserDetailsFromMyInfoComponents();

  const {
    data: userDetails,
    isLoading: isLoadingUserDetails,
    error: userDetailsError,
    refetch: getProfileDetails,
  } = useGetProfileDetails();
  const { isLoading: isLoadingLogout, mutate: logout } = useLogout();
  const { isLoading: isLoadingOnboardCitizenUser, mutate: onboardUser } = useOnboardCitizenUser();

  // ===========================================================================
  // Handlers
  // ===========================================================================
  async function onSubmitForm() {
    await verifyingStateHandler();

    if (isEmailValid && isMobileValid) {
      onboardUser();
      trackWogaaTransaction('COMPLETE', WOGAA_TRACKING_ID.ONBOARDING);
      trackWogaaTransaction('COMPLETE', WOGAA_TRACKING_ID.ONBOARD_VIA_EMAIL_LINK);
    }
  }

  async function verifyingStateHandler() {
    await triggerEmail('email');
    await triggerMobile('mobile');

    if (duplicateEmail) {
      setEmailError('email', { type: 'custom', message: 'This email address is already in use. Please change to a different email.' });
    }

    if (isEditingEmail) {
      setEmailError('email', { type: 'custom', message: 'Please verify your email address.' });
    }

    if (isEditingMobile) {
      setMobileError('mobile', { type: 'custom', message: 'Please verify your mobile number.' });
    }
  }

  // ===========================================================================
  // React hook form
  // ===========================================================================
  const emailForm = useForm<{ email: string }>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { email: '' },
  });

  const {
    trigger: triggerEmail,
    setError: setEmailError,
    formState: { isValid: isEmailValid },
  } = emailForm;

  const mobileForm = useForm<{ mobile: string }>({
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: { mobile: '' },
  });

  const {
    trigger: triggerMobile,
    setError: setMobileError,
    formState: { isValid: isMobileValid },
  } = mobileForm;

  const {
    register: registerTerms,
    handleSubmit: handleFormSubmit,
    formState: { errors: termsErrors },
  } = useForm<{ terms: boolean }>({
    mode: 'onChange',
  });

  // ===========================================================================
  // useEffect
  // ===========================================================================
  useEffect(() => {
    updateUser();
    getProfileDetails();
  }, [getProfileDetails, updateUser]);

  useEffect(() => {
    if (myInfoData?.duplicateEmail) {
      setDuplicateEmail(myInfoData.duplicateEmail);

      setEmailError('email', {
        type: 'custom',
        message: 'This email address is already in use. Please change to a different email.',
      });
    }
  }, [myInfoData, setEmailError]);

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <StyledWrapper>
      <StyledFormWrapper>
        <StyledFormContent>
          {userDetailsError && (
            <StyledErrorContainer>
              <ErrorInfo image={image} descriptions={descriptions} title={title} />
            </StyledErrorContainer>
          )}

          {(isLoadingUserDetails || isUpdatingMyInfoData) && <SignupFormSkeleton />}

          {!isUpdatingMyInfoData && userDetails && (
            <StyledBodyContainer>
              <StyledFormInfoContainer>
                <Typography variant={isSmallerThanSmallTablet ? 'H1_MOBILE' : 'H1'} bold="SEMI">
                  {SIGN_UP_FORM_TITLE}
                </Typography>
                <Typography variant="BODY">{SIGN_UP_FORM_DESC}</Typography>
                {myInfoError ? (
                  <Alert variant="WARNING">
                    We encountered an error retrieving your profile details from Myinfo. You may still proceed by adding your contact
                    information.
                  </Alert>
                ) : (
                  <Alert variant="INFO">Your profile has been pre-filled with MyInfo, and you can update the details if necessary.</Alert>
                )}
              </StyledFormInfoContainer>

              <UserDetailsForm
                userDetails={userDetails}
                emailForm={emailForm}
                mobileForm={mobileForm}
                isEditingEmail={isEditingEmail}
                setIsEditingEmail={setIsEdittingEmail}
                isEditingMobile={isEditingMobile}
                setIsEditingMobile={setIsEditingMobile}
                duplicateEmail={duplicateEmail}
                setDuplicateEmail={setDuplicateEmail}
              />

              <TermsContainer>
                <Typography variant="BODY" bold="FULL">
                  Terms and Conditions
                </Typography>
                <Typography variant="BODY">
                  Before using FileSG, please review our{' '}
                  <TextLink type="LINK" to={WebPage.PRIVACY_STATEMENT} newTab>
                    privacy statement
                  </TextLink>{' '}
                  and{' '}
                  <TextLink type="LINK" to={WebPage.TERMS_OF_USE} newTab>
                    terms of use
                  </TextLink>
                  .
                </Typography>
                <AgreementContainer>
                  <Checkbox
                    label={'I agree to the privacy statement and terms of use.'}
                    {...registerTerms('terms', {
                      required: 'Please check the terms and conditions before proceeding.',
                      validate: {
                        notEditingContacts: () => !isEditingEmail && !isEditingMobile,
                        notDuplicateEmail: () => !duplicateEmail,
                      },
                    })}
                  />
                </AgreementContainer>
                {termsErrors.terms?.type === 'required' && (
                  <IconLabel
                    role="alert"
                    icon="sgds-icon-circle-warning"
                    iconSize="ICON_SMALL"
                    iconColor={Color.RED_DEFAULT}
                    title={
                      <Typography variant="BODY" color={Color.RED_DEFAULT}>
                        {termsErrors.terms.message}
                      </Typography>
                    }
                    gap="8px"
                  />
                )}
              </TermsContainer>
            </StyledBodyContainer>
          )}
        </StyledFormContent>
      </StyledFormWrapper>

      <StyledCtaContainer>
        <Button
          label="Proceed"
          onClick={handleFormSubmit(onSubmitForm, verifyingStateHandler)}
          isLoading={isLoadingOnboardCitizenUser}
          disabled={isLoadingUserDetails || !!userDetailsError || isUpdatingMyInfoData}
        />
        <Button decoration="GHOST" label="Cancel and log out" onClick={() => logout()} isLoading={isLoadingLogout} />
      </StyledCtaContainer>
    </StyledWrapper>
  );
}

export default SignupForm;
