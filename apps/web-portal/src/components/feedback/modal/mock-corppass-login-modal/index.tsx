import { Button, Modal, TextButton, TextInput } from '@filesg/design-system';
import { forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { WebPage } from '../../../../consts';
import { useButtonFocus } from '../../../../hooks/common/useButtonFocus';
import { StyledFooter } from './style';

const TEST_IDS = {
  BACK_BUTTON: 'mock-corppass-login-modal-back-button',
  LOGIN_BUTTON: 'mock-corppass-login-modal-login-button',
};

interface Props {
  title?: string;
  onClose: () => void;
  onBackButtonClick?: () => void;
}

interface MockCorppassLoginFormInput {
  uin: string;
  uen: string;
  role: string;
}

export const MockCorppassLoginModal = forwardRef<HTMLDivElement, Props>(
  ({ title = 'Mock Corppass login', onClose, onBackButtonClick }, ref) => {
    const navigate = useNavigate();
    const { register, handleSubmit } = useForm<MockCorppassLoginFormInput>({
      defaultValues: { uin: 'S3002610A', uen: '200000177W', role: 'ALL' },
    });

    const buttonRef = useButtonFocus();

    const onLoginHandler = ({ uin, uen, role }: MockCorppassLoginFormInput) => {
      if (!uin || uin.trim() === '' || !uen || uen.trim() === '' || !role || role.trim() === '') {
        return;
      }
      onClose();
      navigate(`${WebPage.MOCK_CORPPASS_AUTHCALLBACK}?uin=${uin}&uen=${uen}&role=${role}&state=state`);
    };

    const proceedToNdiHandler = () => {
      onClose();
      navigate(`${WebPage.CORPPASS_AUTHCALLBACK}?isLoginAttempt=true`);
    };

    return (
      <Modal onBackdropClick={onClose} trapFocus ref={ref}>
        <Modal.Card>
          <Modal.Header onCloseButtonClick={onClose} buttonRef={buttonRef}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <form onSubmit={handleSubmit(onLoginHandler)}>
            <Modal.Body>
              <Button label="Proceed with Corppass Login" type="button" onClick={proceedToNdiHandler} />

              <TextInput fieldId="uin" {...register('uin')} label={'Mock FIN/NRIC'} hintText="E.g.: S3002610A" />
              <TextInput fieldId="uen" {...register('uen')} label={'Mock UEN'} hintText="E.g.: 200000177W" />
              <TextInput fieldId="role" {...register('role')} label={'Mock Role'} hintText="E.g.: ALL" />
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
  },
);
