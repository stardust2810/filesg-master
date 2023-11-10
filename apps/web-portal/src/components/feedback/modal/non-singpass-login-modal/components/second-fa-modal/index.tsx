import { EXCEPTION_ERROR_CODE } from '@filesg/common';
import { Alert, Button, Modal, TextButton, Typography } from '@filesg/design-system';
import { forwardRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { WebPage } from '../../../../../../consts';
import { FORM_IDS } from '../../../../../../consts/identifiers';
import { useAppSelector } from '../../../../../../hooks/common/useSlice';
import {
  EXPECTED_EXCEPTION_ERROR_CODES as EXPECTED_SEND_OTP_ERROR_CODES,
  useNonSingpass2FaOtpSend,
} from '../../../../../../hooks/queries/useNonSingpass2FaOtpSend';
import {
  EXPECTED_EXCEPTION_ERROR_CODES as EXPECTED_VERIFY_OTP_ERROR_CODES,
  useNonSingpass2FaOtpVerify,
} from '../../../../../../hooks/queries/useNonSingpass2FaOtpVerify';
import {
  selectContentRetrievalToken,
  selectFirstFaInput,
  selectFirstFaToken,
  selectMaskedMobile,
  selectOtpDetails,
} from '../../../../../../store/slices/non-singpass-session';
import { isActivityBannedFromVerification, isFileSGError, isFileSGErrorType, resetRedirectionPath } from '../../../../../../utils/common';
import { Otp, OtpFormInput } from '../../../../../inputs/otp';
import MaxVerificationAttemptsFailedMsg from '../max-verification-attempts-failed-msg';
import { StyledBody, StyledFooter, StyledForm } from './style';

interface Props {
  onBackButtonClick?: () => void;
  onActivityBannedBackButtonClick?: () => void;
  onUnexpectedError?: () => void;
}

const isOtpMaxRetriesReached = (error: unknown) => isFileSGErrorType(error, EXCEPTION_ERROR_CODE.OTP_MAX_RETRIES_REACHED);

export const SecondFactorAuthModal = forwardRef<HTMLDivElement, Props>(
  ({ onBackButtonClick, onActivityBannedBackButtonClick, onUnexpectedError }: Props, ref) => {
    const navigate = useNavigate();
    const firstFaInput = useAppSelector(selectFirstFaInput);
    const firstFaToken = useAppSelector(selectFirstFaToken);
    const maskedMobile = useAppSelector(selectMaskedMobile);
    const otpDetails = useAppSelector(selectOtpDetails);
    const contentRetrievalToken = useAppSelector(selectContentRetrievalToken);

    // ---------------------------------------------------------------------------
    // React hook form
    // ---------------------------------------------------------------------------
    const formReturn = useForm<OtpFormInput>();
    const { control, handleSubmit } = formReturn;
    const otp = useWatch({
      control,
      name: 'otp',
      defaultValue: '',
    });

    // ---------------------------------------------------------------------------
    // Queries
    // ---------------------------------------------------------------------------
    const { isLoading: isLoadingSendOtp, mutate: sendOtp, error: sendOtpError } = useNonSingpass2FaOtpSend();

    const {
      isLoading: isLoadingOtpVerify,
      mutate: verifyOtp,
      error: verifyOtpError,
      reset: resetVerifyOtpMutation,
    } = useNonSingpass2FaOtpVerify();

    // ---------------------------------------------------------------------------
    // Handlers
    // ---------------------------------------------------------------------------
    const handleVerifyOtp = ({ otp }: OtpFormInput) => {
      verifyOtp({ token: firstFaToken, otp });
    };

    const backButtonHandler = () => {
      if (isActivityBannedFromVerification(sendOtpError) || isActivityBannedFromVerification(verifyOtpError)) {
        onActivityBannedBackButtonClick?.();
      } else {
        onBackButtonClick?.();
      }
    };

    // ---------------------------------------------------------------------------
    // Effects
    // ---------------------------------------------------------------------------
    useEffect(() => {
      if (firstFaToken) {
        sendOtp(firstFaToken);
      }
    }, [firstFaToken, sendOtp]);

    useEffect(() => {
      if (contentRetrievalToken && firstFaInput?.activityUuid) {
        resetRedirectionPath();
        navigate(`${WebPage.ACTIVITIES}/${firstFaInput.activityUuid}`);
      }
    }, [contentRetrievalToken, firstFaInput, navigate]);

    useEffect(() => {
      if (
        onUnexpectedError &&
        ((sendOtpError && (!isFileSGError(sendOtpError) || !isFileSGErrorType(sendOtpError, EXPECTED_SEND_OTP_ERROR_CODES))) ||
          (verifyOtpError && (!isFileSGError(verifyOtpError) || !isFileSGErrorType(verifyOtpError, EXPECTED_VERIFY_OTP_ERROR_CODES))))
      ) {
        onUnexpectedError();
      }
    }, [onUnexpectedError, sendOtpError, verifyOtpError]);

    // ---------------------------------------------------------------------------
    // Getters
    // ---------------------------------------------------------------------------
    const getOtpDescription = () => (
      <>
        Please enter the 6-digit one-time password (OTP) sent to your mobile{' '}
        <Typography variant="BODY" bold="FULL">
          {maskedMobile}
        </Typography>
      </>
    );

    return (
      <Modal trapFocus ref={ref}>
        <Modal.Card>
          <StyledForm onSubmit={handleSubmit(handleVerifyOtp)} id={FORM_IDS.NON_SINGPASS_SECOND_FA_FORM}>
            <Modal.Header>
              <Modal.Title>Enter OTP</Modal.Title>
            </Modal.Header>

            <StyledBody>
              {(isActivityBannedFromVerification(sendOtpError) || isActivityBannedFromVerification(verifyOtpError)) && (
                <Alert variant="DANGER">
                  <MaxVerificationAttemptsFailedMsg />
                </Alert>
              )}

              {!isLoadingSendOtp && otpDetails && (
                <Otp
                  otpDetails={otpDetails}
                  isLoadingSendOtp={isLoadingSendOtp}
                  verifyOtpError={verifyOtpError}
                  resetVerifyOtpMutation={resetVerifyOtpMutation}
                  formReturn={formReturn}
                  disabled={isActivityBannedFromVerification(sendOtpError) || isActivityBannedFromVerification(verifyOtpError)}
                  onResendOtpClick={() => sendOtp(firstFaToken)}
                  description={getOtpDescription()}
                  subDescription="If you changed your mobile number, please reach out to the issuing agency to update it first."
                />
              )}
            </StyledBody>
            <StyledFooter>
              <TextButton label="Back" startIcon="sgds-icon-arrow-left" onClick={backButtonHandler} type="button" />
              <Button
                label="Submit"
                disabled={
                  otp.length !== 6 ||
                  isOtpMaxRetriesReached(verifyOtpError) ||
                  isActivityBannedFromVerification(sendOtpError) ||
                  isActivityBannedFromVerification(verifyOtpError)
                }
                isLoading={isLoadingOtpVerify}
                type="submit"
              />
            </StyledFooter>
          </StyledForm>
        </Modal.Card>
      </Modal>
    );
  },
);
