import { FileSGProps, Modal } from '@filesg/design-system';

import { TEST_IDS } from '../../../../consts';
import { StyledModalBody, StyledModalHeader } from './style';

interface Props extends FileSGProps {
  title: string;
  information: React.ReactNode;
  onClose: () => void;
  onRouteChange?: () => void;
}

export const InformationModal = ({ title, information, onClose, onRouteChange, ...rest }: Props) => {
  return (
    <Modal onBackdropClick={onClose} onRouteChange={onRouteChange} data-testid={rest['data-testid'] ?? TEST_IDS.INFORMATION_MODAL}>
      <Modal.Card>
        <StyledModalHeader onCloseButtonClick={onClose}>
          <Modal.Title>{title}</Modal.Title>
        </StyledModalHeader>
        <StyledModalBody>{information}</StyledModalBody>
      </Modal.Card>
    </Modal>
  );
};
