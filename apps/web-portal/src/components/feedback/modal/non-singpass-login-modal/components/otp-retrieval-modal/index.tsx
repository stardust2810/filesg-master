import { OTP_CHANNEL } from '@filesg/common';
import { Button, Modal, RadioButtonGroup, RadioButtonProps, TextButton, Typography } from '@filesg/design-system';
import { Dispatch, forwardRef, SetStateAction } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useTheme } from 'styled-components';

import { FORM_IDS } from '../../../../../../consts/identifiers';
import { useAppDispatch, useAppSelector } from '../../../../../../hooks/common/useSlice';
import { selectMaskedEmail, selectMaskedMobile, setOtpChannel } from '../../../../../../store/slices/non-singpass-session';
import { VERIFICATION_STEPS } from '../..';
import { StyledBody, StyledFooter, StyledForm } from './style';

interface Props {
  onBackButtonClick: () => void;
  setCurrentAuthState: Dispatch<SetStateAction<VERIFICATION_STEPS>>;
}

interface OtpRetrievalMethodForm {
  method: OTP_CHANNEL;
}

export const OtpRetrievalAuthModal = forwardRef<HTMLDivElement, Props>(({ onBackButtonClick, setCurrentAuthState }: Props, ref) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const maskedMobile = useAppSelector(selectMaskedMobile);
  const maskedEmail = useAppSelector(selectMaskedEmail);
  const isRetrievalMethodsEmpty = !maskedMobile && !maskedEmail;

  // ---------------------------------------------------------------------------
  // React hook form
  // ---------------------------------------------------------------------------
  const formReturn = useForm<OtpRetrievalMethodForm>();
  const { handleSubmit, setValue, control } = formReturn;

  const method = useWatch({
    control,
    name: 'method',
  });

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleOtpRetrievalMethod = ({ method }: OtpRetrievalMethodForm) => {
    dispatch(setOtpChannel(method));
    setCurrentAuthState(VERIFICATION_STEPS.SECOND_FACTOR_AUTH);
  };

  const backButtonHandler = () => onBackButtonClick();

  const onMethodSelected = ({ method }: OtpRetrievalMethodForm) => setValue('method', method);

  const buildOtpMethods = () => {
    const methods: Pick<RadioButtonProps, 'value' | 'label' | 'description'>[] = [];
    // TODO: ENABLE EMAIL OTP ONCE READY
    maskedEmail &&
      methods.push({
        value: OTP_CHANNEL.EMAIL,
        description: maskedEmail,
        label: 'Email',
      });
    maskedMobile &&
      methods.push({
        value: OTP_CHANNEL.SMS,
        description: maskedMobile,
        label: 'Mobile SMS',
      });

    return methods;
  };

  return (
    <Modal trapFocus ref={ref}>
      <Modal.Card>
        <StyledForm onSubmit={handleSubmit(handleOtpRetrievalMethod)} id={FORM_IDS.NON_SINGPASS_OTP_RETRIEVAL}>
          <Modal.Header>
            <Modal.Title>Verify your identity</Modal.Title>
          </Modal.Header>

          <StyledBody>
            <Typography variant="BODY">
              To access your documents, we need to verify your identity by sending you a 6-digit one-time password (OTP) via one of the
              contacts you provided to the issuing agency.
            </Typography>

            <Typography variant="BODY">Select the contact you want to receive the OTP by:</Typography>

            <RadioButtonGroup
              identifier={FORM_IDS.NON_SINGPASS_OTP_RETRIEVAL}
              variant={'WITH_FRAME'}
              onSelectionHandler={(e) => onMethodSelected({ method: e.target.value as OTP_CHANNEL })}
              radioButtons={buildOtpMethods()}
            />

            <Typography variant="SMALL" color={theme.FSG_COLOR.GREYS.GREY60}>
              If you no longer have access to the contacts above, please reach out to the issuing agency directly to update them before
              proceeding.
            </Typography>
          </StyledBody>
          <StyledFooter>
            <TextButton label="Back" startIcon="sgds-icon-arrow-left" onClick={backButtonHandler} type="button" />
            <Button label="Next" disabled={isRetrievalMethodsEmpty || !method} type="submit" />
          </StyledFooter>
        </StyledForm>
      </Modal.Card>
    </Modal>
  );
});
