import { TableRowProps } from 'react-virtualized';

import { TEST_IDS } from '../../../utils/constants';

/**
 * Default row renderer for Table.
 */
export default function defaultRowRenderer({
  className,
  columns,
  index,
  key,
  onRowClick,
  onRowDoubleClick,
  onRowMouseOut,
  onRowMouseOver,
  onRowRightClick,
  rowData,
  style,
}: TableRowProps) {
  const a11yProps: any = { 'aria-rowindex': index + 1 };

  if (onRowClick || onRowDoubleClick || onRowMouseOut || onRowMouseOver || onRowRightClick) {
    a11yProps['aria-label'] = 'row';
    a11yProps.tabIndex = 0;

    if (onRowClick) {
      a11yProps.onClick = (event: React.MouseEvent) => onRowClick({ event, index, rowData });
    }
    if (onRowDoubleClick) {
      a11yProps.onDoubleClick = (event: React.MouseEvent) => onRowDoubleClick({ event, index, rowData });
    }
    if (onRowMouseOut) {
      a11yProps.onMouseOut = (event: React.MouseEvent) => onRowMouseOut({ event, index, rowData });
    }
    if (onRowMouseOver) {
      a11yProps.onMouseOver = (event: React.MouseEvent) => onRowMouseOver({ event, index, rowData });
    }
    if (onRowRightClick) {
      a11yProps.onContextMenu = (event: React.MouseEvent) => onRowRightClick({ event, index, rowData });
    }
  }

  return (
    <div {...a11yProps} className={className} key={key} role="row" style={style} data-testid={`${TEST_IDS.FILE_TABLE_ROW}-${index + 1}`}>
      {columns}
    </div>
  );
}
