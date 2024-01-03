import { FILE_ASSET_SORT_BY } from '@filesg/common';
import {
  Color,
  FileIcon,
  FSG_DEVICES,
  Icon,
  RESPONSIVE_VARIANT,
  TableColumns,
  TableRowId,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { UseInfiniteQueryResult } from 'react-query';
import { InfiniteLoader } from 'react-virtualized';

import EllipsisFileName from '../../../../../components/data-display/ellipsis-file-name';
import { StatusTag } from '../../../../../components/data-display/status-tag';
import { FileTableData } from '../..';
import { AcknowledgementTag } from '../acknowledgement-tag';
import { StyledFileNameSpan, StyledIconTextContainer, StyledListButtonMenu, StyledTable, StyledTextButton } from './style';

// FETCH_OFFSET: count of items (buffer) before next page of items should be fetched
const FETCH_OFFSET = 6;

// File name ellipsis constants
const MINIMUM_CHAR_COUNT_TO_ELLIPSIS = 8;
const NUMBER_OF_REAR_CHAR = 4;

export type TableStylingProps = {
  // File label container is only focusable when there is no error and click handler for file label is passed in
  topInPx?: number;
};

interface Props {
  rows: FileTableData[];
  onItemsSelect: (ids: TableRowId[]) => void;
  onDownloadClick: (id: string, name: string, size: number) => void;
  onViewClick: (id: string) => void;
  loadMoreRows?: () => void;
  onSortClick?: (sortType: FILE_ASSET_SORT_BY) => void;
  asc?: boolean;
  infiniteQueryResult: UseInfiniteQueryResult;
  topInPx?: number;
}

export function FileTable({
  rows,
  onItemsSelect,
  onDownloadClick,
  onViewClick,
  onSortClick,
  asc,
  infiniteQueryResult,
  topInPx = 0,
}: Props) {
  // ===========================================================================
  // Const
  // ===========================================================================
  const { isFetchingNextPage, fetchNextPage, hasNextPage } = infiniteQueryResult;

  const isLargerThanMobile = useShouldRender(RESPONSIVE_VARIANT.LARGER_THAN, FSG_DEVICES.MOBILE);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  // ===========================================================================
  // Layout Const
  // ===========================================================================

  const listMenuItems = (rowId: string, rowName: string, rowSize: number, showDownload?: boolean) => {
    const menuItems = [
      {
        label: 'View',
        onClick: () => onViewClick(rowId),
      },
    ];

    if (showDownload) {
      menuItems.unshift({
        label: 'Download',
        onClick: () => onDownloadClick(rowId, rowName, rowSize),
      });
    }

    return menuItems;
  };

  const columns: TableColumns = [
    {
      field: 'name',
      headerName: 'Name',
      width: 3840,
      renderCell: ({ cellData, rowData }) => (
        <StyledIconTextContainer>
          {isLargerThanMobile && <FileIcon type={rowData.documentType} variant="solid" size="ICON_LARGE" />}
          <StyledTextButton
            aria-label={cellData}
            label={
              <StyledFileNameSpan>
                <EllipsisFileName
                  fontVariant={isSmallerThanSmallTablet ? 'SMALL' : 'BODY'}
                  minimumCharCountToEllipsis={MINIMUM_CHAR_COUNT_TO_ELLIPSIS}
                  numberOfRearChar={NUMBER_OF_REAR_CHAR}
                >
                  {cellData}
                </EllipsisFileName>
              </StyledFileNameSpan>
            }
            onClick={() => onViewClick(rowData.id)}
            isEllipsis={false}
          />
          <StatusTag status={rowData.status} isExpired={rowData.isExpired} size={isSmallerThanSmallTablet ? 'SMALL' : 'DEFAULT'} />
          {rowData.showToAcknowledge && <AcknowledgementTag fileUuid={rowData.id} size={isSmallerThanSmallTablet ? 'SMALL' : 'DEFAULT'} />}
        </StyledIconTextContainer>
      ),
    },
    {
      field: 'agencyCode',
      headerName: 'Issued by',
      width: 160,
      minWidth: 128,
      hiddenOn: 'TABLET',
      renderCell: ({ cellData }) => <Typography variant="SMALL">{cellData}</Typography>,
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      onHeaderClick: () => onSortClick!(FILE_ASSET_SORT_BY.CREATED_AT),
      width: 224,
      minWidth: 176,
      hiddenOn: 'MOBILE',
      headerIcon: <Icon icon={asc ? 'sgds-icon-arrow-up' : 'sgds-icon-arrow-down'} size="ICON_MINI" color={Color.GREY80} />,
      renderCell: ({ cellData }) => <Typography variant="SMALL">{cellData}</Typography>,
    },
    {
      field: 'listButton',
      width: 36,
      minWidth: 36,
      renderCell: ({ rowData }: { rowData: FileTableData }) => {
        const showDownload = !rowData.showToAcknowledge;
        return (
          <StyledListButtonMenu
            aria-label="More actions"
            items={listMenuItems(rowData.id, rowData.name, rowData.size, showDownload)}
            menuInitialAnchorPosition="right"
          />
        );
      },
    },
  ];

  // =============================================================================
  // Infinite Loader functions
  // =============================================================================

  const loadMoreRows = () => {
    // Triggered when isRowLoaded returns false
    if (isFetchingNextPage) {
      return Promise.resolve();
    }
    return fetchNextPage();
  };

  const isRowLoaded = ({ index }) => {
    // Return false to indicate the items are not loaded and will trigger loadMoreRows to fetchNextPage
    const fetchOffset = FETCH_OFFSET;
    return !(rows.length - index === fetchOffset) || !hasNextPage;
  };

  // ===========================================================================
  // Render
  // ===========================================================================

  return (
    <InfiniteLoader isRowLoaded={isRowLoaded} loadMoreRows={loadMoreRows} rowCount={9999999} threshold={0}>
      {({ onRowsRendered, registerChild }) => (
        <StyledTable
          topInPx={topInPx}
          columns={columns}
          rows={rows}
          checkboxSelection
          onSelectionModelChange={(ids) => onItemsSelect(ids)}
          onRowsRendered={onRowsRendered}
          registerChild={registerChild}
        />
      )}
    </InfiniteLoader>
  );
}
