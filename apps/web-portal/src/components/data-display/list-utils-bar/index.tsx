import { forwardRef, PropsWithChildren } from 'react';

import { StyledListUtilsBarContainer } from './styles';

type Props = {
  isSticky: boolean;
};

export const ListUtilsBar = forwardRef<HTMLDivElement, PropsWithChildren<Props>>(({ isSticky = true, children }, ref) => {
  return (
    <StyledListUtilsBarContainer ref={ref} isSticky={isSticky}>
      {children}
    </StyledListUtilsBarContainer>
  );
});
