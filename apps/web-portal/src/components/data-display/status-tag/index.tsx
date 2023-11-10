import { FILE_STATUS } from '@filesg/common';
import { FileSGProps, Tag } from '@filesg/design-system';

import { TEST_IDS } from '../../../consts';

interface Props extends FileSGProps {
  status: FILE_STATUS;
  isExpired: boolean;
  size: 'DEFAULT' | 'SMALL' | 'MEDIUM' | 'LARGE';
}

enum TAG_LABEL {
  CANCELLED = 'Cancelled',
  EXPIRED = 'Expired',
}

export function StatusTag({ status, isExpired, size, ...rest }: Props) {
  let tagLabel = '';

  switch (true) {
    case status === FILE_STATUS.REVOKED:
      tagLabel = TAG_LABEL.CANCELLED;
      break;

    case status === FILE_STATUS.EXPIRED:
    case isExpired:
      tagLabel = TAG_LABEL.EXPIRED;
      break;
  }

  return tagLabel ? (
    <Tag variant="FILLED" size={size} color="DANGER" data-testid={rest['data-testid'] ?? TEST_IDS.STATUS_TAG} isEllipsis ellipsisLine={1}>
      {tagLabel}
    </Tag>
  ) : null;
}
