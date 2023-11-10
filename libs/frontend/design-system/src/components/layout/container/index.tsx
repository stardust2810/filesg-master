import { ReactNode } from 'react';

import { StyleProps } from '../../../utils/typings';
import { StyledContainer } from './style';

type Props = { children: ReactNode } & StyleProps;

export const Container = ({ children, className, style }: Props) => {
  return (
    <StyledContainer className={className} style={style}>
      {children}
    </StyledContainer>
  );
};
