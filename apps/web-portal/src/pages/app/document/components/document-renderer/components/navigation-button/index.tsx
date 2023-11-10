import { useKeyPress } from '@filesg/design-system';
import { forwardRef } from 'react';

import { NAVIGATION_DIRECTION } from '../..';
import { StyledIconButton } from './style';

type Props = {
  direction: NAVIGATION_DIRECTION;
  onClick: React.HTMLAttributes<HTMLButtonElement>['onClick'];
  // onClick?: () => void;
  disabled?: boolean;
};

export const NavigationButton = forwardRef<HTMLButtonElement, Props>(({ direction, onClick, disabled = false }: Props, ref) => {
  useKeyPress(direction === NAVIGATION_DIRECTION.NEXT ? 'ArrowRight' : 'ArrowLeft', (event) => onClick && onClick(event), disabled);

  return (
    <StyledIconButton
      direction={direction}
      icon={`sgds-icon-chevron-${direction === NAVIGATION_DIRECTION.PREVIOUS ? 'left' : 'right'}`}
      decoration="SOLID"
      color="DEFAULT"
      round
      ref={ref}
      onClick={onClick}
      disabled={disabled}
    />
  );
});
