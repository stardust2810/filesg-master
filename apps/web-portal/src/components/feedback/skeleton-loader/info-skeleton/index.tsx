import { Skeleton } from '@filesg/design-system';

import { TEST_IDS } from '../../../../consts';
import { StyledInfoItemSkeletonsWrapper,StyledInfoItemSkeletonWrapper, StyledInfoSkeletonWrapper } from './style';

interface SkeletonDimensionProps {
  width: number;
  height: number;
}

interface InfoItemSkeletonProps {
  label: SkeletonDimensionProps;
  value: SkeletonDimensionProps;
}

interface InfoSkeletonProps {
  title: SkeletonDimensionProps;
  subTitle: SkeletonDimensionProps;
  items: {
    length: number;
  } & InfoItemSkeletonProps;
}

const InfoItemSkeleton = ({ label, value }: InfoItemSkeletonProps) => {
  return (
    <StyledInfoItemSkeletonWrapper>
      <Skeleton variant="RECTANGLE" width={label.width} height={label.height} />
      <Skeleton variant="RECTANGLE" width={value.width} height={value.height} />
    </StyledInfoItemSkeletonWrapper>
  );
};

export const InfoSkeleton = ({ title, subTitle, items }: InfoSkeletonProps) => {
  return (
    <StyledInfoSkeletonWrapper data-testid={TEST_IDS.INFO_SKELETON}>
      <Skeleton variant="RECTANGLE" width={title.width} height={title.height} />
      <Skeleton variant="RECTANGLE" width={subTitle.width} height={subTitle.height} />
      <StyledInfoItemSkeletonsWrapper>
        {new Array(items.length).fill(0).map((_, index) => (
          <InfoItemSkeleton
            label={{ width: items.label.width, height: items.label.height }}
            value={{ width: items.value.width, height: items.value.height }}
            key={`person-detail-item-${index}`}
          />
        ))}
      </StyledInfoItemSkeletonsWrapper>
    </StyledInfoSkeletonWrapper>
  );
};
