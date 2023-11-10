import { MouseEventHandler } from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { StyledDiv } from './style';

export type Props = {
  invisible?: boolean;
  onBackdropClick?: MouseEventHandler;
  topPadding?: string;
  isBlur?: boolean;
} & FileSGProps;

export const Backdrop = ({ invisible = false, onBackdropClick, topPadding, isBlur = false, className, ...rest }: Props) => {
  return (
    <StyledDiv
      isBlur={isBlur}
      invisible={invisible}
      className={className}
      topPadding={topPadding}
      onClick={onBackdropClick}
      data-testid={rest['data-testid'] ?? TEST_IDS.BACKDROP}
    />
  );
};
