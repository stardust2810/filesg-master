import { forwardRef } from 'react';

import { StyleProps } from '../../../utils/typings';
import { StyledCol } from './style';

export type Props = {
  children: React.ReactNode | React.ReactNode[];
  column?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  offset?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
} & StyleProps;

export const Col = forwardRef<HTMLDivElement, Props>(({ children, column, offset, className, ...props }: Props, ref) => {
  return (
    <StyledCol ref={ref} column={column} offset={offset} className={className} {...props}>
      {children}
    </StyledCol>
  );
});
