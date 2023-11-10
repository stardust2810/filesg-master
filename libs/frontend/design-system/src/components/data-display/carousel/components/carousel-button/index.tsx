import { forwardRef } from 'react';

import { TEST_IDS } from '../../../../../utils/constants';
import { FileSGProps } from '../../../../../utils/typings';
import { StyledIconButton } from './style';

type Props = {
  isLeft?: boolean;
} & FileSGProps;

export const CarouselButton = forwardRef<HTMLButtonElement, Props>(({ isLeft = true, className, ...rest }: Props, ref) => {
  return (
    <StyledIconButton
      left={isLeft}
      icon={`sgds-icon-chevron-${isLeft ? 'left' : 'right'}`}
      decoration="OUTLINE"
      color="DEFAULT"
      round
      className={className}
      ref={ref}
      data-testid={rest['data-testid'] ?? `${TEST_IDS.CAROUSEL_BUTTON}-${isLeft ? 'left' : 'right'}`}
    />
  );
});
