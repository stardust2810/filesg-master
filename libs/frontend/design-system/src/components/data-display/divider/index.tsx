import { PropsWithChildren } from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { StyledHr, StyledTextDivider } from './style';

export type ComponentProps = {
  horizontalOffset?: number;
  verticalOffset?: number;
  thick?: boolean;
  isVertical?: boolean;
};

export type Props = PropsWithChildren<ComponentProps & FileSGProps>;

export const Divider = ({ horizontalOffset = 0, verticalOffset = 0, thick = false, isVertical = false, className, children }: Props) => {
  if (children) {
    return <StyledTextDivider>{children}</StyledTextDivider>;
  }
  return (
    <StyledHr
      isVertical={isVertical}
      data-testid={TEST_IDS.DIVIDER}
      horizontalOffset={horizontalOffset}
      verticalOffset={verticalOffset}
      thick={thick}
      className={`fsg-divider ${className ? className : ''}`}
    />
  );
};
