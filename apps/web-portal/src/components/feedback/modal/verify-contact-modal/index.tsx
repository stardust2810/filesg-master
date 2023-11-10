import { EXCEPTION_ERROR_CODE, OTP_CHANNEL } from '@filesg/common';
import { Alert, Bold, Button, Modal, sendToastMessage, TextLink, Typography } from '@filesg/design-system';
import { forwardRef, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { ExternalLink } from '../../../../consts';
import {
  EXPECTED_EXCEPTION_ERROR_CODES as EXPECTED_SEND_OTP_ERROR_CODES,
  useUserContactUpdateOtpSend,
} from '../../../../hooks/queries/useUserContactUpdateOtpSend';
import {
  EXPECTED_EXCEPTION_ERROR_CODES as EXPECTED_VERIFY_OTP_ERROR_CODES,
  useUserContactUpdateOtpVerify,
} from '../../../../hooks/queries/useUserContactUpdateOtpVerify';
import { isFileSGError, isFileSGErrorType, maskPhoneNumber } from '../../../../utils/common';
import { Otp, OtpFormInput } from '../../../inputs/otp';
import { StyledFooter, StyledForm } from './style';

interface Props {
  contactType: 'email' | 'mobile';
  contactValue: string;
  onModalClose: () => void;
  setVerified: () => void;
  onUnexpectedError?: () => void;
}

const isUserBannedFromContactUpdate = (error: unknown) => isFileSGErrorType(error, EXCEPTION_ERROR_CODE.CONTACT_UPDATE_BAN);
const isOtpMaxRetriesReached = (error: unknown) => isFileSGErrorType(error, EXCEPTION_ERROR_CODE.OTP_MAX_RETRIES_REACHED);

const BanErrorText = () => {
  return (
    <div>
      <Typography variant="BODY">
        For data security, we have locked access to edit the contact information of this account as you have reached the maximum number of
        verification attempts.
      </Typography>
      <br />
      <br />
      <Typography variant="BODY">
        To unlock, please{' '}
        <TextLink endIcon="sgds-icon-external" font="PARAGRAPH" type="ANCHOR" to={ExternalLink.CONTACT_US} newTab>
          contact us
        </TextLink>
        .
      </Typography>
    </div>
  );
};

export const VerifyContactModal = forwardRef<HTMLDivElement, Props>(
  ({ contactType, contactValue, onModalClose, setVerified, onUnexpectedError }: Props, ref) => {
    const isEmailType = contactType === 'email';

    // -------------------------------------------------------------------------
    // React hook form
    // -------------------------------------------------------------------------
    const formReturn = useForm<OtpFormInput>();
    const { control, handleSubmit } = formReturn;
    const otp = useWatch({
      control,
      name: 'otp',
      defaultValue: '',
    });

    // -------------------------------------------------------------------------
    // Queries
    // -------------------------------------------------------------------------
    const {
      isLoading: isLoadingSendOtp,
      mutate: sendOtp,
      error: sendOtpError,
      data: otpDetails,
    } = useUserContactUpdateOtpSend(contactType);

    const {
      isLoading: isLoadingOtpVerify,
      mutate: verifyOtp,
      error: verifyOtpError,
      reset: resetVerifyOtpMutation,
    } = useUserContactUpdateOtpVerify({
      onSuccess: () => {
        setVerified();
        onModalClose();
        sendToastMessage(`Your ${contactType} has been successfully updated`, 'success');
      },
    });

    // -----------------------------------------------------------------------------
    // Handlers
    // -----------------------------------------------------------------------------
    const handleVerifyOtp = ({ otp }: OtpFormInput) => {
      verifyOtp({ inputOtp: otp, channel: isEmailType ? OTP_CHANNEL.EMAIL : OTP_CHANNEL.SMS });
    };

    // -----------------------------------------------------------------------------
    // Effects
    // -----------------------------------------------------------------------------
    useEffect(() => {
      sendOtp(contactValue);
    }, [contactType, sendOtp, contactValue]);

    useEffect(() => {
      if (
        onUnexpectedError &&
        ((sendOtpError && (!isFileSGError(sendOtpError) || !isFileSGErrorType(sendOtpError, EXPECTED_SEND_OTP_ERROR_CODES))) ||
          (verifyOtpError && (!isFileSGError(verifyOtpError) || !isFileSGErrorType(verifyOtpError, EXPECTED_VERIFY_OTP_ERROR_CODES))))
      ) {
        onUnexpectedError();
      }
    }, [onUnexpectedError, sendOtpError, verifyOtpError]);

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------
    const getOtpDescription = () => (
      <>
        To verify your {isEmailType ? 'email address' : 'mobile number'}, please enter the 6-digit one-time password (OTP) sent to{' '}
        <Bold type="FULL">{isEmailType ? contactValue : maskPhoneNumber(contactValue)}</Bold>
      </>
    );

    return (
      <Modal onBackdropClick={onModalClose} trapFocus ref={ref}>
        <Modal.Card>
          <StyledForm onSubmit={handleSubmit(handleVerifyOtp)}>
            <Modal.Header onCloseButtonClick={onModalClose}>
              <Modal.Title>Enter OTP</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              {isUserBannedFromContactUpdate(sendOtpError) && <BanErrorText />}
              {isUserBannedFromContactUpdate(verifyOtpError) && (
                <Alert variant="DANGER">
                  <BanErrorText />
                </Alert>
              )}

              {!isLoadingSendOtp && otpDetails && !isUserBannedFromContactUpdate(sendOtpError) && (
                <Otp
                  otpDetails={otpDetails}
                  isLoadingSendOtp={isLoadingSendOtp}
                  verifyOtpError={verifyOtpError}
                  resetVerifyOtpMutation={resetVerifyOtpMutation}
                  formReturn={formReturn}
                  disabled={isUserBannedFromContactUpdate(verifyOtpError)}
                  onResendOtpClick={() => sendOtp(contactValue)}
                  description={getOtpDescription()}
                />
              )}
            </Modal.Body>

            {!isUserBannedFromContactUpdate(sendOtpError) && (
              <StyledFooter>
                <Button
                  label="Submit"
                  disabled={otp.length !== 6 || isOtpMaxRetriesReached(verifyOtpError)}
                  isLoading={isLoadingOtpVerify}
                  type="submit"
                />
              </StyledFooter>
            )}
          </StyledForm>
        </Modal.Card>
      </Modal>
    );
  },
);
