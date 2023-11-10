import React, { MouseEventHandler } from 'react';

import { useKeyPress } from '../../../hooks/useKeyPress';
import { FileSGProps } from '../../../utils/typings';
import { Modal, ModalPositionProps } from '../../feedback/modal';
import { StyledMenuContainer } from './style';

type Props = {
  children: React.ReactNode | React.ReactNode[];
  onClose: MouseEventHandler;
} & ModalPositionProps &
  FileSGProps;
export function Menu({
  children,
  className,
  onClose,
  position,
  anchorEl,
  anchorOrigin,
  anchorPadding,
  autoAnchorPosition,
  autoAnchorInitial,
  transformOrigin,
}: Props) {
  useKeyPress('Escape', onClose);

  return (
    <Modal
      invisibleBackdrop
      onBackdropClick={onClose}
      position={position}
      anchorEl={anchorEl}
      anchorOrigin={anchorOrigin}
      anchorPadding={anchorPadding}
      autoAnchorPosition={autoAnchorPosition}
      autoAnchorInitial={autoAnchorInitial}
      transformOrigin={transformOrigin}
    >
      <StyledMenuContainer className={className}>{children}</StyledMenuContainer>
    </Modal>
  );
}
