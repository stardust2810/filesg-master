import {
  CheckDuplicateEmailResponse,
  DetailUserResponse,
  findNonASCIICharactersWithPositions,
  isValidSgMobile,
  removeWhiteSpace,
} from '@filesg/common';
import { Color, Divider, IconLabel, Typography } from '@filesg/design-system';
import { isEmail } from 'class-validator';
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';

import { TEST_IDS } from '../../../consts';
import { useCheckDuplicateEmail } from '../../../hooks/queries/useCheckDuplicateEmail';
import { VerifyContactModal } from '../../feedback/modal/verify-contact-modal';
import { VerifyForm } from '../verify-form';
import { StyledDetailsContainer, StyledFieldContainer, StyledFieldsContainer, StyledForm, StyledHeaderContainer } from './style';

type ContactType = 'email' | 'mobile';

interface Props {
  userDetails: DetailUserResponse;
  emailForm: UseFormReturn<{ email: string }>;
  mobileForm: UseFormReturn<{ mobile: string }>;
  isEditingEmail: boolean;
  setIsEditingEmail: Dispatch<SetStateAction<boolean>>;
  isEditingMobile: boolean;
  setIsEditingMobile: Dispatch<SetStateAction<boolean>>;
  duplicateEmail?: string;
  setDuplicateEmail?: Dispatch<SetStateAction<string>>;
}

export function UserDetailsForm({
  userDetails,
  emailForm,
  mobileForm,
  isEditingEmail,
  setIsEditingEmail,
  isEditingMobile,
  setIsEditingMobile,
  duplicateEmail,
  setDuplicateEmail,
}: Props) {
  const [verifyingType, setVerifyingType] = useState<'email' | 'mobile'>();
  const [showOtpModal, setShowOtpModal] = useState(false);

  // ===========================================================================
  // Queries
  // ===========================================================================
  const { mutate: checkIsDuplicateEmail, isLoading: isLoadingCheckDuplicateEmail } = useCheckDuplicateEmail({
    onSuccess: onCheckDuplicateEmailSuccessHandler,
  });

  // ===========================================================================
  // React Hook Form
  // ===========================================================================
  const {
    control: emailControl,
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    getValues: getEmail,
    setValue: setEmail,
    setFocus: setEmailFocus,
    reset: resetEmail,
    setError: setEmailError,
    trigger: triggerEmail,
    formState: { errors: emailErrors },
  } = emailForm;
  const email = useWatch({ name: 'email', control: emailControl });

  const {
    control: mobileControl,
    register: registerMobile,
    handleSubmit: handleMobileSubmit,
    getValues: getMobile,
    setFocus: setMobileFocus,
    setValue: setMobile,
    reset: resetMobile,
    formState: { errors: mobileErrors },
  } = mobileForm;
  const mobile = useWatch({ name: 'mobile', control: mobileControl });

  // ===========================================================================
  // Handlers
  // ===========================================================================
  function onCheckDuplicateEmailSuccessHandler({ isDuplicate }: CheckDuplicateEmailResponse) {
    if (isDuplicate) {
      setEmailError('email', { type: 'custom', message: 'This email address is already in use. Please change to a different email.' });
    } else {
      setShowOtpModal(true);
    }
  }

  function onCancelEdit(type: ContactType) {
    if (type === 'email') {
      if (duplicateEmail) {
        setEmail('email', duplicateEmail);
        triggerEmail();
      } else {
        resetEmail({ email: userDetails.email ?? '' });
      }
      setIsEditingEmail(false);
    }

    if (type === 'mobile') {
      resetMobile({ mobile: userDetails.phoneNumber ?? '' });
      setIsEditingMobile(false);
    }
  }

  function onSubmit(data: { email?: string; mobile?: string }, type: ContactType) {
    setVerifyingType(type);

    if (type === 'email') {
      checkIsDuplicateEmail(data.email!);
    }

    if (type === 'mobile') {
      setShowOtpModal(true);
    }
  }

  function handleSetVerified() {
    if (verifyingType === 'email') {
      setIsEditingEmail(false);

      setDuplicateEmail?.('');
    } else {
      setIsEditingMobile(false);
    }
  }

  function handlePrefixMobileAndWhiteSpace(mobile: string) {
    const whiteSpaceTrimmed = removeWhiteSpace(mobile);
    return !whiteSpaceTrimmed.startsWith('+65') ? '+65' + whiteSpaceTrimmed : whiteSpaceTrimmed;
  }

  function handleCloseOtpModal() {
    setShowOtpModal(false);
  }

  function handleMobileOnChange(event: ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    const mobileRegExp = new RegExp(/[^0-9+()\- ]/g);
    const filteredValue = value.replaceAll(mobileRegExp, '');

    setMobile('mobile', filteredValue);
  }

  // ===========================================================================
  // useEffects
  // ===========================================================================
  useEffect(() => {
    if (userDetails) {
      if (userDetails.email) {
        setEmail('email', userDetails.email, { shouldValidate: true });
      }

      if (duplicateEmail) {
        setEmail('email', duplicateEmail, { shouldValidate: true });
      }

      if (userDetails.phoneNumber) {
        setMobile('mobile', userDetails.phoneNumber, { shouldValidate: true });
      }
    }
  }, [duplicateEmail, setEmail, setEmailError, setMobile, userDetails]);

  // ===========================================================================
  // Render
  // ===========================================================================
  return (
    <div>
      <StyledDetailsContainer>
        <IconLabel
          icon="fsg-icon-personal-particulars"
          iconColor={Color.GREY60}
          iconSize="ICON_NORMAL"
          alignment="CENTER"
          gap="0.5rem"
          title={
            <Typography variant="PARAGRAPH" bold="FULL">
              Personal Particulars
            </Typography>
          }
        />

        <StyledFieldsContainer>
          {userDetails.name !== null && (
            <StyledFieldContainer>
              <Typography variant="BODY" bold="FULL">
                Name
              </Typography>
              <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_NAME_FIELD}>
                {userDetails.name || '-'}
              </Typography>
            </StyledFieldContainer>
          )}

          <StyledFieldContainer>
            <Typography variant="BODY" bold="FULL">
              NRIC/FIN
            </Typography>
            <Typography variant="BODY" data-testid={TEST_IDS.PROFILE_UIN_FIELD}>
              {userDetails.maskedUin}
            </Typography>
          </StyledFieldContainer>
        </StyledFieldsContainer>
      </StyledDetailsContainer>

      <Divider verticalOffset={24} />

      <StyledDetailsContainer>
        <StyledHeaderContainer>
          <IconLabel
            icon="sgds-icon-mail"
            iconColor={Color.GREY60}
            iconSize="ICON_NORMAL"
            alignment="CENTER"
            gap="0.5rem"
            title={
              <Typography variant="PARAGRAPH" bold="FULL">
                Contact Info
              </Typography>
            }
          />

          <Typography variant="BODY">Your contact details will be used for updates from FileSG.</Typography>
        </StyledHeaderContainer>
        <StyledFieldsContainer>
          <StyledForm aria-label="Edit Email" noValidate onSubmit={handleEmailSubmit((data) => onSubmit(data, 'email'))}>
            <VerifyForm
              data-testid={TEST_IDS.PROFILE_EMAIL_FIELD}
              label="Email"
              formName="email"
              type="email"
              value={getEmail('email')}
              register={registerEmail}
              validate={{
                isEmailValid: (email) => isEmail(email) || 'Please enter a valid email address.',
                isEmailContainsNonASCIICharacter: (email) =>
                  !findNonASCIICharactersWithPositions(email, true) ||
                  'Only letters (a-z), numbers (0-9) and simple punctuation are allowed.',
                notDuplicateMyInfoEmail: (email) =>
                  !duplicateEmail ||
                  duplicateEmail.toLowerCase() !== email.toLowerCase() ||
                  'This email address is already in use. Please change to a different email.',
              }}
              setFocus={setEmailFocus}
              errorMessage={emailErrors.email?.message}
              isEditing={isEditingEmail}
              setIsEditing={setIsEditingEmail}
              onCancelHandler={() => onCancelEdit('email')}
              isLoadingVerify={isLoadingCheckDuplicateEmail}
              disableVerifyButton={
                !email || email.toLowerCase() === userDetails.email?.toLowerCase() || email.toLowerCase() === duplicateEmail?.toLowerCase()
              }
            />
          </StyledForm>

          <StyledForm aria-label="Edit Mobile Number" onSubmit={handleMobileSubmit((data) => onSubmit(data, 'mobile'))}>
            <VerifyForm
              data-testid={TEST_IDS.PROFILE_MOBILE_FIELD}
              label="Mobile Number"
              formName="mobile"
              type="tel"
              value={getMobile('mobile')}
              register={registerMobile}
              validate={(mobile) => isValidSgMobile(handlePrefixMobileAndWhiteSpace(mobile)) || 'Please enter a valid mobile number.'}
              setFocus={setMobileFocus}
              onChangeHandler={handleMobileOnChange}
              errorMessage={mobileErrors.mobile?.message}
              isEditing={isEditingMobile}
              setIsEditing={setIsEditingMobile}
              onCancelHandler={() => onCancelEdit('mobile')}
              disableVerifyButton={!mobile || handlePrefixMobileAndWhiteSpace(mobile) === userDetails.phoneNumber}
            />
          </StyledForm>
        </StyledFieldsContainer>
      </StyledDetailsContainer>
      {showOtpModal && (
        <VerifyContactModal
          contactType={verifyingType!}
          contactValue={verifyingType === 'email' ? getEmail('email') : handlePrefixMobileAndWhiteSpace(getMobile('mobile'))}
          onModalClose={handleCloseOtpModal}
          setVerified={handleSetVerified}
          onUnexpectedError={handleCloseOtpModal}
        />
      )}
    </div>
  );
}
