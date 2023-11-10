import { FILE_TYPE } from '@filesg/common';
import {
  Color,
  FileIcon,
  getFileExtensionAndLastChars,
  getFileNameWithoutExtensionAndLastChars,
  IconButton,
  Typography,
} from '@filesg/design-system';
import { FileSGProps } from '@filesg/design-system';
import { formatDistance } from 'date-fns';

import { StyledContainer, StyledFileDetailsTextContainer, StyledFileName } from './style';

const TEST_IDS = {
  RECENT_FILE: 'recent-file',
};

type Props = {
  type: FILE_TYPE;
  name: string;
  lastViewedAt: Date;
  linkTo: string;
  linkState?: any;
  hideIconButton?: boolean;
  onButtonClick?: React.HTMLAttributes<HTMLButtonElement>['onClick'];
} & FileSGProps;

export const RecentFile = ({
  type,
  name,
  lastViewedAt,
  linkTo,
  linkState,
  onButtonClick,
  hideIconButton = true,
  className,
  ...rest
}: Props) => {
  const currentDate = new Date();
  const getLastViewedAt = `${formatDistance(lastViewedAt, currentDate, { addSuffix: true })}`;
  const ariaLabel = `${type} file format icon`;
  return (
    <StyledContainer to={linkTo} state={linkState} className={className} data-testid={rest['data-testid'] ?? TEST_IDS.RECENT_FILE}>
      <FileIcon type={type} variant="solid" size="ICON_LARGE" aria-label={ariaLabel} />

      <StyledFileDetailsTextContainer>
        <StyledFileName>
          <Typography variant="BODY" ellipsisLine={1} isEllipsis>
            {getFileNameWithoutExtensionAndLastChars(name, 8)}
          </Typography>
          <Typography variant="BODY" noWrap>
            {getFileExtensionAndLastChars(name, 8)}
          </Typography>
        </StyledFileName>

        <Typography variant="SMALL" color={Color.GREY60}>
          Viewed {getLastViewedAt}
        </Typography>
      </StyledFileDetailsTextContainer>

      {!hideIconButton && <IconButton icon="sgds-icon-ellipsis" size="SMALL" iconColor={Color.GREY30} onClick={onButtonClick} />}
    </StyledContainer>
  );
};
