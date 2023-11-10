import { Button, Modal, TextButton, TextInput } from '@filesg/design-system';
import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { WebPage } from '../../../../consts';
import { useButtonFocus } from '../../../../hooks/common/useButtonFocus';
import { StyledFooter } from './style';

const TEST_IDS = {
  BACK_BUTTON: 'mock-login-modal-back-button',
  LOGIN_BUTTON: 'mock-login-modal-login-button',
};

interface Props {
  title?: string;
  onClose: () => void;
  onBackButtonClick?: () => void;
}

interface MockLoginFormInput {
  uin: string;
}

export const MockLoginModal = forwardRef<HTMLDivElement, Props>(({ title = 'Mock login', onClose, onBackButtonClick }, ref) => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm<MockLoginFormInput>({ defaultValues: { uin: 'S3002610A' } });

  const buttonRef = useButtonFocus();

  const onLoginHandler = ({ uin }: MockLoginFormInput) => {
    if (!uin || uin.trim() === '') {
      return;
    }
    onClose();
    navigate(`${WebPage.MOCK_SINGPASS_AUTHCALLBACK}?code=${uin}&state=state`);
  };

  const proceedToNdiHandler = () => {
    onClose();
    navigate(`${WebPage.SINGPASS_AUTHCALLBACK}?isLoginAttempt=true`);
  };

  return (
    <Modal onBackdropClick={onClose} trapFocus ref={ref}>
      <Modal.Card>
        <Modal.Header onCloseButtonClick={onClose} buttonRef={buttonRef}>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit(onLoginHandler)}>
          <Modal.Body>
            <Button label="Proceed with NDI Login" type="button" onClick={proceedToNdiHandler} />

            <TextInput fieldId="uin" {...register('uin')} label={'Mock FIN/NRIC'} hintText="E.g.: S3002610A" />
          </Modal.Body>

          <StyledFooter>
            <Button label="Login" type="submit" data-testid={TEST_IDS.LOGIN_BUTTON} />
            {onBackButtonClick && (
              <TextButton label="Back" startIcon="sgds-icon-arrow-left" onClick={onBackButtonClick} data-testid={TEST_IDS.BACK_BUTTON} />
            )}
          </StyledFooter>
        </form>
      </Modal.Card>
    </Modal>
  );
});
