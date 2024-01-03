import { Modal, TextButton } from '@filesg/design-system';

import { TEST_IDS } from '../../../../../../consts';
import VerificationErrorMessageContainer from '../verification-error-message-container';
import { StyledFooter } from './style';

interface Props {
  title: string;
  message: string[] | JSX.Element;
  onBackButtonClick: () => void;
}

export const VerificationErrorModal = ({ title, message, onBackButtonClick }: Props) => {
  return (
    <Modal trapFocus>
      <Modal.Card>
        <Modal.Header>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <VerificationErrorMessageContainer message={message} />
        </Modal.Body>

        <StyledFooter>
          <TextButton
            label="Back"
            type="button"
            startIcon="sgds-icon-arrow-left"
            onClick={onBackButtonClick}
            data-testid={TEST_IDS.NON_SINGPASS_MODAL_BACK_BUTTON}
          />
        </StyledFooter>
      </Modal.Card>
    </Modal>
  );
};
