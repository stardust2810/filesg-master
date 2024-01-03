import { MouseEventHandler, useEffect } from 'react';

import { SCROLL_LOCK_DATA_ATTRIBUTE } from '../../../constants';
import { TEST_IDS } from '../../../utils/constants';
import { updateScrollLock } from '../../../utils/helper';
import { FileSGProps } from '../../../utils/typings';
import { StyledDiv } from './style';

export type Props = {
  invisible?: boolean;
  onBackdropClick?: MouseEventHandler;
  topPadding?: string;
  isBlur?: boolean;
  isScrollLockActive?: boolean;
} & FileSGProps;

export const Backdrop = ({
  invisible = false,
  onBackdropClick,
  topPadding,
  isBlur = false,
  className,
  isScrollLockActive = true,
  ...rest
}: Props) => {
  useEffect(() => {
    updateScrollLock();

    return () => {
      updateScrollLock();
    };
  }, [isScrollLockActive]);

  return (
    <StyledDiv
      isBlur={isBlur}
      invisible={invisible}
      className={className}
      topPadding={topPadding}
      onClick={onBackdropClick}
      data-testid={rest['data-testid'] ?? TEST_IDS.BACKDROP}
      {...{ [SCROLL_LOCK_DATA_ATTRIBUTE]: isScrollLockActive }}
    />
  );
};
