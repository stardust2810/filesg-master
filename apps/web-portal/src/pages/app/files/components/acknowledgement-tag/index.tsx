import { FileSGProps, Tooltip } from '@filesg/design-system';

import { TEST_IDS } from '../../../../../consts';
import { StyledTag } from './style';

type Props = {
  size: 'DEFAULT' | 'SMALL' | 'MEDIUM' | 'LARGE';
  fileUuid: string;
} & FileSGProps;

const TOOLTIP_CONTENT = 'You are required to acknowledge the Terms and Conditions before you can view or download this file.';

export function AcknowledgementTag({ size, fileUuid, ...rest }: Props) {
  const identifier = `acknowledgement-tag-${fileUuid}`;
  const TagComponent = (
    <StyledTag
      variant="FILLED"
      size={size}
      color="PRIMARY"
      data-testid={rest['data-testid'] ?? TEST_IDS.ACKNOWLEDGEMENT_TAG}
      isEllipsis
      ellipsisLine={1}
    >
      Acknowledge
    </StyledTag>
  );
  return <Tooltip uiTriggerComponent={TagComponent} messagePosition="bottom" identifier={identifier} content={TOOLTIP_CONTENT} />;
}
