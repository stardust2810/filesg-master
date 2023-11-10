import { PropsWithChildren } from 'react';

import { WithRequired } from '../../../typings';
import { FileSGProps } from '../../../utils/typings';
import { StyledB } from './style';

export type Props = WithRequired<
  PropsWithChildren<
    {
      /**
       * Set text font weight
       */
      type: 'FULL' | 'SEMI' | 'MEDIUM';
    } & FileSGProps
  >,
  'children'
>;

/**
 * Bold is an atomic component that bolds selected portion of the text
 */
export const Bold = ({ children, type, ...rest }: Props) => {
  return (
    <StyledB type={type} {...rest}>
      {children}
    </StyledB>
  );
};
