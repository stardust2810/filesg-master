import { useTransition } from '@react-spring/web';
import FocusTrap from 'focus-trap-react';

import { useKeyPress } from '../../../hooks/useKeyPress';
import { TEST_IDS } from '../../../utils/constants';
import { Backdrop } from '../../feedback/backdrop';
import { StyledDrawer } from './style';

export interface Props {
  isOpened: boolean;
  children: JSX.Element;
  topPadding?: string;
  onClose: () => void;
}

export const Drawer = ({ isOpened, children, topPadding = '0', onClose }: Props) => {
  const transition = useTransition(isOpened, {
    from: { x: '100%' },
    enter: { x: '0' },
    leave: { x: '100%' },
  });

  useKeyPress('Escape', onClose);

  return (
    <>
      <Backdrop
        onBackdropClick={onClose}
        isBlur={true}
        topPadding={topPadding}
        className={isOpened ? '' : 'is-hidden'}
        isScrollLockActive={isOpened}
      />
      {transition(
        (style, item) =>
          item && (
            <StyledDrawer $isOpened={isOpened} $topPadding={topPadding} data-testid={TEST_IDS.DRAWER} style={style}>
              <FocusTrap active={true} focusTrapOptions={{ allowOutsideClick: true }}>
                {children}
              </FocusTrap>
            </StyledDrawer>
          ),
      )}
    </>
  );
};
