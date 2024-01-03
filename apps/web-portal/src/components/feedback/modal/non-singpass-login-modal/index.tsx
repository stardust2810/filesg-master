import { Color, TextLink, Typography } from '@filesg/design-system';
import { ReactElement, useState } from 'react';

import { useAppDispatch, useAppSelector } from '../../../../hooks/common/useSlice';
import {
  resetNonSingpassSessionDueToActivityBan,
  resetNonSingpassSessionExceptFirstFaInput,
  selectFirstFaToken,
  selectIsActivityBannedFromNonSingpassVerification,
  selectIsActivityNonSingpassVerifiable,
} from '../../../../store/slices/non-singpass-session';
import { FirstFactorAuthModal } from './components/first-fa-modal';
import { MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT } from './components/first-fa-modal/helper';
import { OtpRetrievalAuthModal } from './components/otp-retrieval-modal';
import { SecondFactorAuthModal } from './components/second-fa-modal';
import { VerificationErrorModal } from './components/verification-error-modal';

interface Props {
  onClose: () => void;
  onBackButtonClick: () => void;
}

export enum VERIFICATION_STEPS {
  FIRST_FACTOR_AUTH = 'first-factor-auth',
  SECOND_FACTOR_AUTH = 'second-factor-auth',
  OTP_RETRIEVAL_AUTH = 'otp-retrieval-auth',
}

export const NonSingpassLoginModal = ({ onClose, onBackButtonClick }: Props) => {
  const dispatch = useAppDispatch();
  const firstFaToken = useAppSelector(selectFirstFaToken);
  const isActivityNonSingpassVerifiable = useAppSelector(selectIsActivityNonSingpassVerifiable);
  const isActivityBannedFromNonSingpassVerificationBeforeDoing1Fa = useAppSelector(selectIsActivityBannedFromNonSingpassVerification);

  const [currentAuthState, setCurrentAuthState] = useState<VERIFICATION_STEPS>(VERIFICATION_STEPS.FIRST_FACTOR_AUTH);

  const handle2FaReset = () => {
    setCurrentAuthState(VERIFICATION_STEPS.FIRST_FACTOR_AUTH);
    dispatch(resetNonSingpassSessionExceptFirstFaInput());
  };

  const handle2FaActivityBannedBackButtonClick = () => {
    onBackButtonClick();
    dispatch(resetNonSingpassSessionDueToActivityBan());
  };

  const handle2FaBackButtonClick = () => setCurrentAuthState(VERIFICATION_STEPS.OTP_RETRIEVAL_AUTH);

  if (!isActivityNonSingpassVerifiable) {
    return (
      <VerificationErrorModal
        title="Verify your particulars"
        message={
          <>
            <Typography variant="BODY" color={Color.GREY80}>
              No mobile number is associated with the Transaction ID you have provided.
            </Typography>
            <Typography variant="BODY" color={Color.GREY80}>
              Retrieving your documents without Singpass requires you to verify your identity by entering a 6-digit one-time password (OTP)
              sent via SMS to the mobile number you provided the issuing agency.
            </Typography>
            <Typography variant="BODY" color={Color.GREY80} bold="FULL">
              For Digital LTVP/STP/DP holders:
            </Typography>
            <Typography variant="BODY" color={Color.GREY80}>
              Please email{' '}
              <TextLink font="PARAGRAPH" to="mailto:ICA_Visit_Pass@ica.gov.sg" type="ANCHOR">
                ICA_Visit_Pass@ica.gov.sg
              </TextLink>{' '}
              to update your Singapore mobile number and provide your Application ID which can be found in the In-Principal Approval (IPA)
              letter.
            </Typography>
          </>
        }
        onBackButtonClick={onBackButtonClick}
      />
    );
  }

  if (isActivityBannedFromNonSingpassVerificationBeforeDoing1Fa) {
    return (
      <VerificationErrorModal
        title="Access denied"
        message={MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT}
        onBackButtonClick={onBackButtonClick}
      />
    );
  }

  const ModalMapper: { [key: string]: ReactElement } = {
    [VERIFICATION_STEPS.FIRST_FACTOR_AUTH]: (
      <FirstFactorAuthModal onBackButtonClick={onBackButtonClick} onClose={onClose} setCurrentAuthState={setCurrentAuthState} />
    ),
    [VERIFICATION_STEPS.OTP_RETRIEVAL_AUTH]: (
      <OtpRetrievalAuthModal onBackButtonClick={handle2FaReset} setCurrentAuthState={setCurrentAuthState} />
    ),
    [VERIFICATION_STEPS.SECOND_FACTOR_AUTH]: (
      <SecondFactorAuthModal
        onBackButtonClick={handle2FaBackButtonClick}
        onActivityBannedBackButtonClick={handle2FaActivityBannedBackButtonClick}
        onUnexpectedError={handle2FaReset}
      />
    ),
  };

  return !firstFaToken ? (
    <FirstFactorAuthModal onBackButtonClick={onBackButtonClick} onClose={onClose} setCurrentAuthState={setCurrentAuthState} />
  ) : (
    ModalMapper[currentAuthState]
  );
};
