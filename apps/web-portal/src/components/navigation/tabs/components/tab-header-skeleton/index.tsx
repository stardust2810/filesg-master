import { Skeleton } from '@filesg/design-system';

import { TEST_IDS } from '../../../../../consts';
import { TabHeaderContainer, TabTitle } from './style';

export const TabHeaderSkeleton = () => {
  return (
    <TabHeaderContainer data-testid={TEST_IDS.TAB_HEADER_SKELETON}>
      <TabTitle>
        <Skeleton variant="TEXT" textVariant="BODY" />
      </TabTitle>
    </TabHeaderContainer>
  );
};
