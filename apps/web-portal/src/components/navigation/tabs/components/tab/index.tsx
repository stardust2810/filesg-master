import { PropsWithChildren } from 'react';

import { StyleProps } from '../../../../../typings';
import { StyledTabContainer } from './style';

type Props = {
  title: string | React.ReactElement;
  testName: string;
  ariaLabel?: string;
} & StyleProps;

export const Tab = ({ children, style, className, ariaLabel }: PropsWithChildren<Props>) => {
  return (
    <StyledTabContainer style={{ ...style }} className={className} aria-label={ariaLabel}>
      {children}
    </StyledTabContainer>
  );
};
