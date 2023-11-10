import { FSG_DEVICES, RESPONSIVE_VARIANT, Skeleton, useShouldRender } from '@filesg/design-system';

import { TEST_IDS } from '../../../../consts';
import { StyledPageDescriptorContainer } from './style';

export const PageDescriptorSkeleton = () => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  return (
    <StyledPageDescriptorContainer data-testid={TEST_IDS.PAGE_DESCRIPTORS_SKELETON}>
      <Skeleton variant="TEXT" textVariant="H3" width={isSmallerThanSmallTablet ? 120 : 160} />
      <Skeleton variant="TEXT" textVariant="BODY" width={isSmallerThanSmallTablet ? 200 : 320} />
    </StyledPageDescriptorContainer>
  );
};
