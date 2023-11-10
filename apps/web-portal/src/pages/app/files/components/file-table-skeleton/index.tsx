import { FSG_DEVICES, RESPONSIVE_VARIANT, Skeleton, useShouldRender } from '@filesg/design-system';

import { StyledCol, StyledContentRow, StyledHeader, StyledTable } from './style';

const TEST_IDS = {
  FILE_TABLE_SKELETON: 'file-table-skeleton',
};

type TableColProps = {
  width: number | 'FILL';
  numberOfRows?: number;
  rowContent?: JSX.Element;
  hideHeader?: boolean;
};
const TableCol = ({ width = 'FILL', numberOfRows = 1, rowContent, hideHeader = false }: TableColProps) => {
  return (
    <StyledCol width={width}>
      {!hideHeader && (
        <StyledHeader>
          <Skeleton variant="TEXT" textVariant="BODY" width={80} />
        </StyledHeader>
      )}
      {Array.from(Array(numberOfRows), (e, i) => {
        return (
          <StyledContentRow key={i}>{rowContent ? rowContent : <Skeleton variant="TEXT" textVariant="BODY" width={80} />}</StyledContentRow>
        );
      })}
    </StyledCol>
  );
};

type SpacingColProps = {
  width?: number;
  hideHeader?: boolean;
  numberOfRows?: number;
};
const SpacingCol = ({ width = 64, hideHeader = false, numberOfRows = 1 }: SpacingColProps) => {
  return (
    <StyledCol width={width}>
      {!hideHeader && <StyledHeader />}
      {Array.from(Array(numberOfRows), (e, i) => {
        return <StyledContentRow key={i} />;
      })}
    </StyledCol>
  );
};

const NameRowContent = () => {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Skeleton variant="RECTANGLE" width={32} height={32} />
      <Skeleton variant="TEXT" textVariant="BODY" width={160} />
    </div>
  );
};
type Props = {
  numberOfRows?: number;
  hideHeader?: boolean;
};
export const FileTableSkeleton = ({ numberOfRows = 1, hideHeader = false }: Props) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  return (
    <StyledTable data-testid={TEST_IDS.FILE_TABLE_SKELETON}>
      <SpacingCol hideHeader={hideHeader} numberOfRows={numberOfRows} width={isSmallerThanSmallTablet ? 52 : undefined} />
      <TableCol hideHeader={hideHeader} width={'FILL'} numberOfRows={numberOfRows} rowContent={NameRowContent()} />
      {!isSmallerThanSmallTablet && <TableCol hideHeader={hideHeader} width={160} numberOfRows={numberOfRows} />}
      <SpacingCol hideHeader={hideHeader} numberOfRows={numberOfRows} />
    </StyledTable>
  );
};
