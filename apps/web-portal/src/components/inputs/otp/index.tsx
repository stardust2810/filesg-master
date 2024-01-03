import { EXCEPTION_ERROR_CODE, OtpDetailsResponse } from '@filesg/common';
import { Bold, Color, TextButton, Typography } from '@filesg/design-system';
import { add } from 'date-fns';
import { useEffect, useRef } from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import OtpInput from 'react-otp-input';

import { OTP_RESEND_BUFFER_SECONDS } from '../../../consts';
import { FIELD_ERROR_IDS } from '../../../consts/identifiers';
import { useCountDown } from '../../../hooks/common/useCountDown';
import { isFileSGErrorType } from '../../../utils/common';
import {
  StyledDescriptionWrapper,
  StyledIconLabel,
  StyledOtpInput,
  StyledOtpWrapper,
  StyledResendOtpWrapper,
  StyledWrapper,
} from './style';

export interface OtpFormInput {
  otp: string;
}

interface Props {
  otpDetails: OtpDetailsResponse;
  isLoadingSendOtp: boolean;
  verifyOtpError: unknown;
  resetVerifyOtpMutation: () => void;
  formReturn: UseFormReturn<OtpFormInput>;
  disabled?: boolean;
  onResendOtpClick?: () => void;
  description?: React.ReactChild;
  subDescription?: React.ReactChild;
}

const isOtpInvalid = (error: unknown) => isFileSGErrorType(error, [EXCEPTION_ERROR_CODE.OTP_INVALID, EXCEPTION_ERROR_CODE.BAD_REQUEST]);
const isOtpExpired = (error: unknown) => isFileSGErrorType(error, EXCEPTION_ERROR_CODE.OTP_EXPIRED);
const isOtpMaxVerificationAttemptCountReached = (error: unknown) =>
  isFileSGErrorType(error, EXCEPTION_ERROR_CODE.OTP_MAX_VERIFICATION_ATTEMPT_COUNT_REACHED);
const isOtpDoesNotExist = (error: unknown) => isFileSGErrorType(error, EXCEPTION_ERROR_CODE.OTP_DOES_NOT_EXIST);

export const Otp = ({
  otpDetails,
  isLoadingSendOtp,
  verifyOtpError,
  resetVerifyOtpMutation,
  formReturn,
  disabled = false,
  onResendOtpClick,
  description,
  subDescription,
}: Props) => {
  const { counter, startCountDown } = useCountDown();
  const { control, resetField, setValue } = formReturn;
  const otpInputRef = useRef<OtpInput>(null);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (otpDetails?.allowResendAt) {
      startCountDown(add(new Date(otpDetails.allowResendAt), { seconds: OTP_RESEND_BUFFER_SECONDS }));
    }
  }, [otpDetails, startCountDown]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleResendOtp = () => {
    onResendOtpClick?.();
    handleResetVerify();
  };

  const handleResetVerify = () => {
    resetVerifyOtpMutation();
    resetField('otp');
  };

  const handleOtpChange = (input: string) => {
    const filteredInput = input.replaceAll(/\D/g, '');
    setValue('otp', filteredInput);

    // Move focus to last char of input
    const otpInputNode = otpInputRef.current;
    if (otpInputNode) {
      otpInputNode.focusInput(filteredInput.length);
    }
  };

  // -------------------------------------------------------------------------
  // Getters
  // -------------------------------------------------------------------------
  const getVerifyOtpErrorText = () => {
    if (isOtpInvalid(verifyOtpError)) {
      return 'Invalid OTP. Please try again.';
    }

    if (isOtpMaxVerificationAttemptCountReached(verifyOtpError)) {
      return 'Invalid OTP. Please request for a new OTP and try again.';
    }

    if (isOtpExpired(verifyOtpError) || isOtpDoesNotExist(verifyOtpError)) {
      if (otpDetails?.allowResendAt) {
        return 'The OTP has expired. Please request for a new OTP and try again.';
      }
      return 'The OTP has expired. Please try again later.';
    }
  };

  return (
    <StyledWrapper>
      <Typography variant="BODY">{description}</Typography>
      <StyledOtpWrapper>
        <Controller
          name="otp"
          control={control}
          render={({ field: { value } }) => (
            <StyledOtpInput
              ref={otpInputRef}
              value={value}
              onChange={handleOtpChange}
              numInputs={6}
              isInputNum={true}
              hasErrored={isOtpInvalid(verifyOtpError)}
              errorStyle={{
                borderColor: Color.RED_DEFAULT,
              }}
              isDisabled={disabled || isOtpMaxVerificationAttemptCountReached(verifyOtpError) || isLoadingSendOtp}
              disabledStyle={{
                backgroundColor: Color.GREY20,
                color: Color.GREY50,
                cursor: 'not-allowed',
              }}
              shouldAutoFocus
            />
          )}
        />

        {(isOtpMaxVerificationAttemptCountReached(verifyOtpError) ||
          isOtpInvalid(verifyOtpError) ||
          isOtpExpired(verifyOtpError) ||
          isOtpDoesNotExist(verifyOtpError)) && (
          <StyledIconLabel
            id={FIELD_ERROR_IDS.OTP_FIELD_ERROR}
            role="alert"
            icon="sgds-icon-circle-warning"
            iconSize="ICON_SMALL"
            iconBackgroundColor={undefined}
            iconColor={Color.RED_DEFAULT}
            title={
              <Typography variant="SMALL" color={Color.RED_DEFAULT}>
                {getVerifyOtpErrorText()}
              </Typography>
            }
            gap="0.5rem"
          />
        )}
      </StyledOtpWrapper>

      {otpDetails?.allowResendAt !== null && (
        <StyledDescriptionWrapper>
          <Typography variant="SMALL">
            You can request for a new OTP in <Bold type="FULL">{counter >= 0 ? counter : '-'} sec</Bold>
          </Typography>

          <StyledResendOtpWrapper>
            <TextButton
              label="Resend OTP"
              color={Color.PURPLE_DEFAULT}
              disabled={counter !== 0 || !otpDetails?.allowResendAt}
              onClick={handleResendOtp}
              type="button"
            />
          </StyledResendOtpWrapper>
          <Typography variant="SMALL">{subDescription}</Typography>
        </StyledDescriptionWrapper>
      )}
    </StyledWrapper>
  );
};
