import { PageDescriptorSkeleton } from '../../../../../components/feedback/skeleton-loader/page-descriptor-skeleton';
import { FileTableSkeleton } from '../file-table-skeleton';
import { StyledAllFilesContainer } from './style';

const DEFAULT_NUMBER_OF_ROWS = 11;
const TEST_IDS = {
  FILES_PAGE_SKELETON: 'files-page-skeleton',
};

export const FilesSkeleton = () => {
  return (
    <StyledAllFilesContainer data-testid={TEST_IDS.FILES_PAGE_SKELETON}>
      <PageDescriptorSkeleton />
      <FileTableSkeleton numberOfRows={DEFAULT_NUMBER_OF_ROWS} />
    </StyledAllFilesContainer>
  );
};
