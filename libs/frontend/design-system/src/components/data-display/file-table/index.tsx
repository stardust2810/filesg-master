import 'react-virtualized/styles.css';
import '../../../styles/table/index.css';

import React, { useEffect, useState } from 'react';
import {
  AutoSizer,
  Column,
  InfiniteLoaderChildProps,
  Table,
  TableCellProps as VirtualizedTableCellProps,
  TableHeaderProps as VirtualizedTableHeaderProps,
  WindowScroller,
} from 'react-virtualized';

import { useRemToPx } from '../../../hooks/useRemToPx';
import { useShouldRender } from '../../../hooks/useShouldRender';
import { Color } from '../../../styles/color';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Checkbox } from '../../inputs/checkbox';
import { Typography } from '../typography';
import defaultHeaderRowRenderer from './header-row-renderer';
import defaultRowRenderer from './row-renderer';
import { rowStyle, StyledContainer, StyledHeaderTextButtonContainer, StyledHeaderTextContainer } from './style';

const CHECKBOX_COLUMN = 'checkbox';

export type TableRowId = string | number;

export interface TableColumn {
  field: string;
  headerName?: string;
  onHeaderClick?: () => void;
  width: number;
  minWidth?: number;
  hiddenOn?: 'MOBILE' | 'TABLET';
  ellipsis?: boolean;
  ellipsisLine?: number;
  headerIcon?: JSX.Element;
  renderCell?: (cellProps: VirtualizedTableCellProps) => React.ReactNode;
}

interface TableHeaderProps extends VirtualizedTableHeaderProps {
  columnData?: TableColumn;
}

interface TableCellProps extends VirtualizedTableCellProps {
  columnData?: TableColumn;
}

export type TableRowData = { id: TableRowId; [key: string]: any };
export type TableColumns = TableColumn[];
export type TableRows = TableRowData[];

export type Props = {
  columns: TableColumns;
  rows: TableRowData[];
  checkboxSelection?: boolean;
  onSelectionModelChange?: (ids: TableRowId[]) => void;
  rowColor?: Color;
  checkboxColor?: Color;
  onRowsRendered?: InfiniteLoaderChildProps['onRowsRendered'];
  registerChild?: InfiniteLoaderChildProps['registerChild'];
} & FileSGProps;

export function FileTable({
  columns,
  rows,
  checkboxSelection = false,
  onSelectionModelChange,
  rowColor = Color.PURPLE_LIGHTEST,
  checkboxColor = Color.PURPLE_DEFAULT,
  onRowsRendered,
  registerChild,
  className,
  ...rest
}: Props): JSX.Element {
  const [selected, setSelected] = useState<TableRowId[]>([]);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);
  // ---------------------------------------------------------------------------
  // Effect hooks
  // ---------------------------------------------------------------------------
  useEffect(() => {
    onSelectionModelChange?.(selected);
  }, [onSelectionModelChange, selected]);

  // ---------------------------------------------------------------------------
  // Rows and column handlers
  // ---------------------------------------------------------------------------
  function headerRenderer({ label, dataKey, columnData }: TableHeaderProps) {
    if (checkboxSelection && dataKey === CHECKBOX_COLUMN) {
      return (
        <Checkbox
          selected={selected.length > 0}
          onChange={handleAllCheckboxsChange}
          icon={selected.length !== rows.length ? 'sgds-icon-minus' : undefined}
          color={checkboxColor}
        />
      );
    }

    if (!columnData) {
      return null;
    }

    const content = (
      <>
        <Typography variant={isSmallerThanSmallTablet ? 'SMALL' : 'BODY'} bold="FULL">
          {label}
        </Typography>
        {columnData.headerIcon}
      </>
    );

    const clickable = !columnData.onHeaderClick;

    if (clickable) {
      return <StyledHeaderTextContainer onClick={columnData.onHeaderClick}>{content}</StyledHeaderTextContainer>;
    }

    return <StyledHeaderTextButtonContainer onClick={columnData.onHeaderClick}>{content}</StyledHeaderTextButtonContainer>;
  }

  function cellRenderer(tableCellProps: TableCellProps) {
    const { rowData, cellData, dataKey, columnData } = tableCellProps;

    if (checkboxSelection && dataKey === CHECKBOX_COLUMN) {
      return <Checkbox selected={selected.includes(rowData.id)} onChange={() => handleCheckboxChange(rowData.id)} color={checkboxColor} />;
    }

    if (!columnData) {
      return null;
    }

    if (columnData.renderCell) {
      return columnData.renderCell(tableCellProps);
    }

    return (
      <Typography variant="SMALL" isEllipsis={columnData.ellipsis} ellipsisLine={columnData.ellipsisLine}>
        {cellData}
      </Typography>
    );
  }

  function hiddenOnClassHandler(hiddenOn?: 'MOBILE' | 'TABLET') {
    if (hiddenOn === 'MOBILE') {
      return 'Table-is-hidden-mobile';
    }
    if (hiddenOn === 'TABLET') {
      return 'Table-is-hidden-tablet';
    }
    return '';
  }

  // ---------------------------------------------------------------------------
  // Click handlers
  // ---------------------------------------------------------------------------
  function handleCheckboxChange(id) {
    if (!selected.includes(id)) {
      setSelected((prevState) => [...prevState, id]);
    } else {
      setSelected((selected) => selected.filter((item) => item !== id));
    }
  }

  function handleAllCheckboxsChange() {
    if (selected.length === 0) {
      setSelected(rows.map((row) => row.id));
    } else {
      setSelected([]);
    }
  }

  const headerHeight = useRemToPx(3.5); // 56px
  const rowHeight = useRemToPx(4); // 64px

  return (
    <StyledContainer className={className} data-testid={rest['data-testid'] ?? TEST_IDS.FILE_TABLE}>
      <WindowScroller>
        {({ height, scrollTop }) => (
          <AutoSizer disableHeight>
            {({ width: autoWidth }) => (
              <Table
                autoHeight
                height={height}
                width={autoWidth}
                headerHeight={headerHeight}
                rowHeight={rowHeight}
                rowCount={rows.length}
                rowStyle={({ index }) => rowStyle(rows, index, selected, rowColor)}
                rowGetter={({ index }) => rows[index]}
                rowRenderer={defaultRowRenderer}
                headerRowRenderer={defaultHeaderRowRenderer}
                onRowsRendered={onRowsRendered}
                ref={registerChild}
                scrollTop={scrollTop}
                tabIndex={null}
              >
                {checkboxSelection && (
                  <Column
                    width={32}
                    minWidth={32}
                    dataKey={CHECKBOX_COLUMN}
                    headerRenderer={headerRenderer}
                    cellRenderer={cellRenderer}
                    key={`table-column-0`}
                  />
                )}
                {columns.map((column, index) => {
                  return (
                    <Column
                      label={column.headerName}
                      width={column.width}
                      minWidth={column.minWidth}
                      dataKey={column.field}
                      headerRenderer={headerRenderer}
                      cellRenderer={cellRenderer}
                      className={hiddenOnClassHandler(column.hiddenOn)}
                      headerClassName={hiddenOnClassHandler(column.hiddenOn)}
                      columnData={{
                        ellipsis: column.ellipsis,
                        ellipsisLine: column.ellipsisLine,
                        headerIcon: column.headerIcon,
                        renderCell: column.renderCell,
                        onHeaderClick: column.onHeaderClick,
                      }}
                      key={`table-column-${checkboxSelection ? index + 1 : index}`}
                    />
                  );
                })}
              </Table>
            )}
          </AutoSizer>
        )}
      </WindowScroller>
    </StyledContainer>
  );
}
