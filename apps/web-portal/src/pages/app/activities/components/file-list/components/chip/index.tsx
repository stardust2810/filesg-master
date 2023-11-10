import { FILE_TYPE } from '@filesg/common';
import {
  Color,
  FileIcon,
  FileSGProps,
  getFileExtensionAndLastChars,
  getFileNameWithoutExtensionAndLastChars,
  Typography,
} from '@filesg/design-system';
import { forwardRef } from 'react';

import { BaseDocumentLocationState } from '../../../../../document/components/document-renderer';
import { StyledLink, StyleFileLabel } from './style';
const TEST_IDS = {
  FILE_CHIP: 'file-chip',
};
export type Props = {
  label: string;
  to: string;
  state?: BaseDocumentLocationState;
  disabled?: boolean;
  type: FILE_TYPE;
} & FileSGProps;

const Chip = forwardRef<HTMLAnchorElement, Props>(({ label, to, state, disabled = false, type, style, ...rest }: Props, ref) => {
  return (
    <StyledLink
      onClick={(e) => e.stopPropagation()}
      style={style}
      ref={ref}
      to={to}
      state={state}
      disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      data-testid={rest['data-testid'] ?? TEST_IDS.FILE_CHIP}
      aria-label={rest['aria-label']}
    >
      <FileIcon type={type} variant={'mini'} size="ICON_MINI" />
      <StyleFileLabel>
        <Typography variant="SMALLER" color={Color.GREY80} isEllipsis ellipsisLine={1}>
          {getFileNameWithoutExtensionAndLastChars(label, 4)}
        </Typography>
        <Typography variant="SMALLER" color={Color.GREY80} noWrap>
          {getFileExtensionAndLastChars(label, 4)}
        </Typography>
      </StyleFileLabel>
    </StyledLink>
  );
});

export default Chip;
