import { Button, Modal, Typography } from '@filesg/design-system';

import { StyledBody, StyledFooter } from './style';

type SessionTimeoutType = 'SESSION_TIMEOUT' | 'SESSION_MISSING';
interface Props {
  onModalCloseClicked: () => void;
  type: SessionTimeoutType;
}

export const SessionLogoutModal = ({ onModalCloseClicked, type }: Props) => {
  const getHeader = (type: SessionTimeoutType) => {
    return type === 'SESSION_TIMEOUT' ? 'Session timeout' : 'Session terminated';
  };

  const getBody = (type: SessionTimeoutType) => {
    if (type === 'SESSION_TIMEOUT') {
      return (
        <>
          <Typography variant="BODY">For your security, you have been logged out and redirected to FileSG homepage.</Typography>
          <Typography variant="BODY">To protect your personal data, please clear your browser's cache after each session.</Typography>
        </>
      );
    } else {
      return (
        <>
          <Typography variant="BODY">It looks like you have already logged in to FileSG in another session.</Typography>
          <Typography variant="BODY">
            For your security, this session has been terminated and you will be redirected to the FileSG public homepage.
          </Typography>
        </>
      );
    }
  };

  return (
    <Modal onBackdropClick={onModalCloseClicked}>
      <Modal.Card>
        <Modal.Header onCloseButtonClick={onModalCloseClicked}>
          <Modal.Title data-testid="session-logout-header">{getHeader(type)}</Modal.Title>
        </Modal.Header>
        <StyledBody data-testid="session-logout-body">{getBody(type)}</StyledBody>
        <StyledFooter>
          <Button data-testid="session-logout-got-it-bttn" label={'OK, got it'} onClick={onModalCloseClicked} color="PRIMARY" />
        </StyledFooter>
      </Modal.Card>
    </Modal>
  );
};
