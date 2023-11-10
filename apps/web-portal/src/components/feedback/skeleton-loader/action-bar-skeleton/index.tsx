import { Skeleton } from '@filesg/design-system';

import { TEST_IDS } from '../../../../consts';
import { StyledActionBarContainer } from './style';

export const ActionBar = () => {
  return (
    <StyledActionBarContainer data-testid={TEST_IDS.ACTION_BAR_SKELETON}>
      <Skeleton variant="RECTANGLE" width={86} height={32} borderRadiusInPx={8} />
    </StyledActionBarContainer>
  );
};
