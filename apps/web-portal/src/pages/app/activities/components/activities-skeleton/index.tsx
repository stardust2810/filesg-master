import { ActivitySkeleton } from '../../../../../components/data-display/activities/activity-card-skeleton';
import { ActionBar } from '../../../../../components/feedback/skeleton-loader/action-bar-skeleton';
import { PageDescriptorSkeleton } from '../../../../../components/feedback/skeleton-loader/page-descriptor-skeleton';
import { TabHeaderSkeleton } from '../../../../../components/navigation/tabs/components/tab-header-skeleton';
import { StyledAllActivitiesContainer } from './style';

const TEST_IDS = {
  ACTIVITIES_PAGE_SKELETON: 'activities-page-skeleton',
};

export const ActivitiesSkeleton = () => {
  return (
    <StyledAllActivitiesContainer data-testid={TEST_IDS.ACTIVITIES_PAGE_SKELETON}>
      <PageDescriptorSkeleton />
      <ActionBar />
      <TabHeaderSkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
      <ActivitySkeleton />
    </StyledAllActivitiesContainer>
  );
};
