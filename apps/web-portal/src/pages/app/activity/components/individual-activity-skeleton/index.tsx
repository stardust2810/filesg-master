import { Skeleton } from '@filesg/design-system';

import { FileLabelDetailsContainer, FileLabelSkeletonContainer, StyledActivityInfo, StyledAdditionalInfoListItem } from './style';

const TEST_IDS = {
  RECEIVE_TRANSFER_ACTIVITY_SKELETON: 'receive-transfer-activity-skeleton',
  FILE_LABEL_SKELETON: 'file-label-skeleton',
};

interface Props {
  numberOfFiles?: number;
}

const FileLabelSkeleton = () => {
  return (
    <FileLabelSkeletonContainer data-testid={TEST_IDS.FILE_LABEL_SKELETON}>
      <Skeleton variant="RECTANGLE" height={32} width={32} />
      <FileLabelDetailsContainer>
        <Skeleton variant="TEXT" textVariant="BODY" width={240} />
        <Skeleton variant="TEXT" textVariant="BODY" width={80} />
      </FileLabelDetailsContainer>
    </FileLabelSkeletonContainer>
  );
};

export const IndividualActivitySkeleton = ({ numberOfFiles = 3 }: Props) => {
  return (
    <StyledActivityInfo data-testid={TEST_IDS.RECEIVE_TRANSFER_ACTIVITY_SKELETON}>
      <Skeleton variant="TEXT" textVariant="H1" width={400} />

      <StyledAdditionalInfoListItem>
        <Skeleton variant="TEXT" textVariant="BODY" width={640} />
        <Skeleton variant="TEXT" textVariant="BODY" width={560} />
      </StyledAdditionalInfoListItem>

      {Array.from(Array(numberOfFiles), (e, i) => {
        return <FileLabelSkeleton key={i} />;
      })}
    </StyledActivityInfo>
  );
};
