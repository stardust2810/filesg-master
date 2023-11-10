import { Button, FileSGProps, Modal, Typography } from '@filesg/design-system';

import corppassFirstLoginImage from '../../../../assets/images/corppass-first-login.svg';
import { TEST_IDS } from '../../../../consts';
import { StyledBody, StyledFooter, StyledInfoContainer } from './style';

interface Props extends FileSGProps {
  onClose: () => void;
  onGetStartedButtonClick: () => void;
}

const MODAL_TITLE = 'FileSG for Businesses';
const MODAL_INFO_TITLE = 'Welcome!';
const MODAL_INFO = `You are logged in to your company’s FileSG account and can view and download documents issued by government agencies to your company.`;
const MODAL_GET_STARTED_BUTTON_LABEL = 'Get started';

export const CorppassFirstLoginInformationModal = ({ onClose, onGetStartedButtonClick, ...rest }: Props) => {
  return (
    <Modal onBackdropClick={onClose} data-testid={rest['data-testid'] ?? TEST_IDS.CORPPASS_FIRST_LOGIN_INFORMATION_MODAL}>
      <Modal.Card>
        <Modal.Header onCloseButtonClick={onClose}>
          <Modal.Title>{MODAL_TITLE}</Modal.Title>
        </Modal.Header>

        <StyledBody>
          <img src={corppassFirstLoginImage} alt="Corppass First Login Modal" />
          <StyledInfoContainer>
            <Typography variant="H4" bold="FULL" aria-label={`Welcome`}>
              {MODAL_INFO_TITLE}
            </Typography>
            <Typography variant="BODY" aria-label={`Welcoming text`}>
              {MODAL_INFO}
            </Typography>
          </StyledInfoContainer>
        </StyledBody>
        <StyledFooter>
          <Button
            label={MODAL_GET_STARTED_BUTTON_LABEL}
            onClick={onGetStartedButtonClick}
            data-testid={TEST_IDS.CORPPASS_FIRST_LOGIN_INFORMATION_MODAL_GET_STARTED_BUTTON}
          />
        </StyledFooter>
      </Modal.Card>
    </Modal>
  );
};
