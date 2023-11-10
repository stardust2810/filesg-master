import { TableHeaderRowProps } from 'react-virtualized';

import { TEST_IDS } from '../../../utils/constants';

export default function defaultHeaderRowRenderer({ className, columns, style }: TableHeaderRowProps) {
  return (
    <div className={className} role="row" style={style} data-testid={TEST_IDS.FILE_TABLE_HEADER_ROW}>
      {columns}
    </div>
  );
}
