import { Skeleton } from '@filesg/design-system';

import { TEST_IDS } from '../../../../consts';
import { StyledDetailContainer, StyledDetailsContent, StyledDetailsHeader, StyledFieldContent } from './style';

const FieldContent = () => {
  return (
    <StyledFieldContent>
      <Skeleton variant="TEXT" textVariant="SMALL" width={144} />
      <Skeleton variant="TEXT" textVariant="BODY" width={240} />
    </StyledFieldContent>
  );
};

type Props = {
  numberOfField?: number;
};
export const ItemDetailsSkeleton = ({ numberOfField = 4 }: Props) => {
  return (
    <StyledDetailContainer data-testid={TEST_IDS.ITEM_DETAILS_SKELETON}>
      <StyledDetailsHeader>
        <Skeleton variant="RECTANGLE" width={32} height={32} />
        <Skeleton variant="TEXT" textVariant="BODY" width={160} />
      </StyledDetailsHeader>
      <StyledDetailsContent>
        {Array.from(Array(numberOfField), (e, i) => {
          return <FieldContent key={i} />;
        })}
      </StyledDetailsContent>
    </StyledDetailContainer>
  );
};
