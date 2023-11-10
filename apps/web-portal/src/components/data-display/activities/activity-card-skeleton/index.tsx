import { FSG_DEVICES, RESPONSIVE_VARIANT, Skeleton, useShouldRender } from '@filesg/design-system';

import { TEST_IDS } from '../../../../consts';
import { StyledActivityDetails, StyledContainer } from './style';

export const ActivitySkeleton = () => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  return (
    <StyledContainer data-testid={TEST_IDS.ACTIVITY_SKELETON}>
      <Skeleton variant={'CIRCLE'} diameter={isSmallerThanSmallTablet ? 48 : 64} />
      <StyledActivityDetails>
        <Skeleton variant={'TEXT'} textVariant="SMALL" width={isSmallerThanSmallTablet ? 120 : 192} />
        <Skeleton variant={'TEXT'} textVariant="BODY" width={isSmallerThanSmallTablet ? 200 : 320} />
        <Skeleton variant={'RECTANGLE'} height={32} width={120} borderRadiusInPx={16} />
      </StyledActivityDetails>
    </StyledContainer>
  );
};
