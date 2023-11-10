import { FSG_DEVICES, RESPONSIVE_VARIANT, Skeleton, useShouldRender } from '@filesg/design-system';

import { StyledContainer, StyledFileDetailsTextContainer } from './style';

const TEST_IDS = {
  RECENT_FILE_SKELETON: 'recent-file-skeleton',
};

export const RecentFileSkeleton = () => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  return (
    <StyledContainer data-testid={TEST_IDS.RECENT_FILE_SKELETON}>
      <Skeleton variant={'RECTANGLE'} height={32} width={32} />

      <StyledFileDetailsTextContainer>
        <Skeleton variant={'TEXT'} textVariant="BODY" width={isSmallerThanSmallTablet ? 180 : 240} />

        <Skeleton variant={'TEXT'} textVariant="SMALL" width={isSmallerThanSmallTablet ? 120 : 160} />
      </StyledFileDetailsTextContainer>
    </StyledContainer>
  );
};
