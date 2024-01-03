import { Verify1FaNonSingpassRequest } from '@filesg/common';
import {
  Alert,
  Button,
  DatePicker,
  DatePickerStatus,
  DateValue,
  Modal,
  TextButton,
  TextInput,
  TextInputLabel,
  Typography,
} from '@filesg/design-system';
import { Dispatch, forwardRef, SetStateAction, useCallback, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { TEST_IDS } from '../../../../../../consts';
import { FIELD_ERROR_IDS, FORM_IDS } from '../../../../../../consts/identifiers';
import { useAppDispatch, useAppSelector } from '../../../../../../hooks/common/useSlice';
import { useNonSingpass1FaVerification } from '../../../../../../hooks/queries/useNonSingpass1FaVerification';
import {
  selectFirstFaInput,
  setFirstFaInput,
  setFirstFaToken,
  setIsActivityBannedFromNonSingpassVerification,
  setMaskedEmail,
  setMaskedMobile,
} from '../../../../../../store/slices/non-singpass-session';
import { isActivityBannedFromVerification } from '../../../../../../utils/common';
import { VERIFICATION_STEPS } from '../..';
import VerificationErrorMessageContainer from '../verification-error-message-container';
import {
  DATE_OF_BIRTH_IDENTIFIER,
  DATE_TOOLTIP_TEXT,
  FIN_NRIC_INPUT_IDENTIFIER,
  FIN_NRIC_TOOLTIP_TEXT,
  finNricValidation,
  formatDateString,
  initialFinNricValidation,
  initialValidateDateObject,
  INVALID_DOB_MESSAGE,
  INVALID_FIN_NRIC_MESSAGE,
  MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT,
  validateDateObject,
  VERIFICATION_ATTEMPT_FAILED_TEXT,
  VERIFY_BUTTON_IDENTIFIER,
} from './helper';
import { StyledDateInput, StyledFooter, StyledForm } from './style';

// =============================================================================
// FirstFactorAuthModal
// =============================================================================
interface FormInputs {
  finNric: string;
  dateOfBirth: DateValue;
}

interface Props {
  onClose: () => void;
  onBackButtonClick: () => void;
  setCurrentAuthState: Dispatch<SetStateAction<VERIFICATION_STEPS>>;
}

// NOTE: The date picker comprises 3 input fields. Typically onBlur (and inline validation) is triggered when focus shifts from one field to another.
// To avoid this, added in conditional date validation function at controller of datepicker component.
export const FirstFactorAuthModal = forwardRef<HTMLDivElement, Props>(({ onClose, onBackButtonClick, setCurrentAuthState }, ref) => {
  const dispatch = useAppDispatch();
  const firstFaInput = useAppSelector(selectFirstFaInput);

  const uinInputRef = useRef<HTMLInputElement | null>(null);
  const dayRef = useRef<HTMLInputElement>(null);
  const monthRef = useRef<HTMLInputElement>(null);
  const yearRef = useRef<HTMLInputElement>(null);
  const datePickerRefs = useRef({ dayRef, monthRef, yearRef });

  const [hasSubmittedOnce, setHasSubmittedOnce] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    trigger,
    setValue,
    formState: { errors },
  } = useForm<FormInputs>({ mode: 'onBlur', shouldFocusError: false });

  const {
    isLoading,
    isError,
    mutate: verify,
    error,
  } = useNonSingpass1FaVerification({
    onSuccess: (data) => {
      const { accessToken, maskedMobile, maskedEmail } = data;
      dispatch(setFirstFaToken(accessToken));
      dispatch(setMaskedMobile(maskedMobile!));
      dispatch(setMaskedEmail(maskedEmail!));
      setCurrentAuthState(VERIFICATION_STEPS.OTP_RETRIEVAL_AUTH);
    },
  });

  const onChangeHandler = (e) => {
    const parsedValue = ((e.target.value as string) ?? '').trim().toUpperCase();
    setValue(FIN_NRIC_INPUT_IDENTIFIER, parsedValue);
  };

  const { ref: setUinRef, ...rest } = register(FIN_NRIC_INPUT_IDENTIFIER, {
    onChange: onChangeHandler,
    validate: hasSubmittedOnce ? finNricValidation : initialFinNricValidation,
  });

  const onSubmit = useCallback(
    async ({ finNric, dateOfBirth }) => {
      const activityUuid = firstFaInput?.activityUuid;

      const formDetails: Verify1FaNonSingpassRequest = {
        activityUuid: activityUuid ?? '',
        uin: finNric,
        dob: formatDateString(dateOfBirth),
      };

      setHasSubmittedOnce(true);
      const allFieldsFilled = await trigger();

      if (allFieldsFilled && activityUuid) {
        verify(formDetails);
        dispatch(setFirstFaInput({ activityUuid: activityUuid, uin: finNric, dob: dateOfBirth }));
      }
    },
    [firstFaInput, trigger, verify, dispatch],
  );

  const backButtonHandler = () => {
    onBackButtonClick();

    if (isActivityBannedFromVerification(error)) {
      dispatch(setIsActivityBannedFromNonSingpassVerification(true));
    }
  };

  return (
    <Modal onBackdropClick={onClose} trapFocus initialFocus="input[name='finNric']" ref={ref}>
      <StyledForm onSubmit={handleSubmit(onSubmit)} id={FORM_IDS.NON_SINGPASS_FIRST_FA_FORM}>
        <Modal.Card>
          <Modal.Header onCloseButtonClick={onClose}>
            <Modal.Title>Verify your particulars</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <>
              {isError && (
                <Alert
                  variant="DANGER"
                  children={
                    <VerificationErrorMessageContainer
                      message={
                        isActivityBannedFromVerification(error)
                          ? MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_TEXT
                          : VERIFICATION_ATTEMPT_FAILED_TEXT
                      }
                    />
                  }
                  data-testid={
                    isActivityBannedFromVerification(error)
                      ? TEST_IDS.NON_SINGPASS_MODAL_MAXIMUM_VERIFICATION_ATTEMPTS_FAILED_NOTIFICATION
                      : TEST_IDS.NON_SINGPASS_MODAL_VERIFICATION_ATTEMPT_FAILED_NOTIFICATION
                  }
                />
              )}

              <Typography variant="BODY">Please provide your particulars to access your documents.</Typography>

              <TextInput
                fieldId={FIN_NRIC_INPUT_IDENTIFIER}
                label="NRIC/FIN"
                hintText={FIN_NRIC_TOOLTIP_TEXT}
                placeholder="e.g. S9876543N"
                defaultValue={firstFaInput ? firstFaInput.uin : ''}
                disabled={isActivityBannedFromVerification(error)}
                data-testid={TEST_IDS.NON_SINGPASS_MODAL_FIN_NRIC_INPUT}
                errorMessage={errors.finNric ? INVALID_FIN_NRIC_MESSAGE : undefined}
                errorElementId={FIELD_ERROR_IDS.UIN_FIELD_ERROR}
                {...rest}
                ref={(e) => {
                  setUinRef(e);
                  uinInputRef.current = e;
                }}
              />

              <StyledDateInput>
                <TextInputLabel label="Date of birth" fieldId={DATE_OF_BIRTH_IDENTIFIER} hintText={DATE_TOOLTIP_TEXT} />
                <Controller
                  name={DATE_OF_BIRTH_IDENTIFIER}
                  control={control}
                  rules={{
                    validate: hasSubmittedOnce ? validateDateObject : initialValidateDateObject,
                  }}
                  defaultValue={firstFaInput ? firstFaInput.dob : { day: '', month: '', year: '' }}
                  render={({ field: { onChange, onBlur, value } }) => {
                    return (
                      <DatePicker
                        ref={datePickerRefs}
                        date={value}
                        onDateChange={onChange}
                        onBlur={onBlur}
                        disabled={isActivityBannedFromVerification(error)}
                        status={errors.dateOfBirth ? DatePickerStatus.INVALID : DatePickerStatus.DEFAULT}
                        errorMessage={errors.dateOfBirth ? INVALID_DOB_MESSAGE : undefined}
                        errorElementId={FIELD_ERROR_IDS.DOB_FIELD_ERROR}
                      />
                    );
                  }}
                />
              </StyledDateInput>
            </>
          </Modal.Body>

          <StyledFooter>
            <TextButton
              label="Back"
              type="button"
              startIcon="sgds-icon-arrow-left"
              onClick={backButtonHandler}
              data-testid={TEST_IDS.NON_SINGPASS_MODAL_BACK_BUTTON}
            />
            <Button
              className={VERIFY_BUTTON_IDENTIFIER}
              onClick={() => setHasSubmittedOnce(true)}
              label="Verify"
              isLoading={isLoading}
              type="submit"
              disabled={isActivityBannedFromVerification(error)}
              data-testid={TEST_IDS.NON_SINGPASS_MODAL_VERIFY_BUTTON}
            />
          </StyledFooter>
        </Modal.Card>
      </StyledForm>
    </Modal>
  );
});
