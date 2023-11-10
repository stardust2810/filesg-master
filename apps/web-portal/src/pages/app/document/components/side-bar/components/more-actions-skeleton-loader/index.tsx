import { Skeleton } from '@filesg/design-system';

import { TEST_IDS } from '../../../../../../../consts';
import { StyledDetailContainer, StyledDetailsHeader } from './style';

export const MoreActionsSkeleton = () => {
  return (
    <StyledDetailContainer data-testid={TEST_IDS.ITEM_DETAILS_SKELETON}>
      <StyledDetailsHeader>
        <Skeleton variant="RECTANGLE" width={24} height={24} />
        <Skeleton variant="TEXT" textVariant="PARAGRAPH" width={160} />
      </StyledDetailsHeader>
      <Skeleton variant="RECTANGLE" width={271} height={48} />
      <Skeleton variant="RECTANGLE" width={271} height={48} />
    </StyledDetailContainer>
  );
};
