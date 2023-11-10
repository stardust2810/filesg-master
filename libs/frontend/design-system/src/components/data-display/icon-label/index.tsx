import { isValidElement } from 'react';

import { Color } from '../../../styles/color';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { StyledColumn, StyledIconBorder, StyledWrapper } from './style';

export type Props = {
  /**
   * Icon to display
   */
  icon: IconLiterals;
  /**
   * Background color of icon
   */
  iconBackgroundColor?: Color;
  /**
   * Color of icon
   */
  iconColor?: Color;
  /**
   * Size of icon
   */
  iconSize?: 'ICON_NORMAL' | 'ICON_SMALL' | 'ICON_LARGE' | 'ICON_MINI';
  /**
   * Gap between text and icon
   */
  gap?: string;
  /**
   * Title of label
   */
  title?: React.ReactNode | React.ReactNode[];
  /**
   * Description of label
   */
  description?: React.ReactNode | React.ReactNode[];
  /**
   * Alignment of icon and text component
   */
  alignment?: 'DEFAULT' | 'CENTER' | 'BASELINE';
  /**
   * Padding above the icon component
   */
  iconPaddingTop?: string;
} & FileSGProps;

/**
 * Icon label is a molecule component used to display text along with an icon.
 */
export const IconLabel = ({
  icon,
  iconSize = 'ICON_LARGE',
  iconBackgroundColor,
  iconColor,
  gap = '1rem',
  title,
  description,
  alignment = 'DEFAULT',
  iconPaddingTop,
  className,
  ...rest
}: Props): JSX.Element => {
  return (
    <StyledWrapper
      data-testid={rest['data-testid'] ?? TEST_IDS.ICON_LABEL}
      id={rest.id}
      className={className}
      alignment={alignment}
      {...rest}
    >
      <StyledIconBorder iconBackgroundColor={iconBackgroundColor} gap={gap} iconPaddingTop={iconPaddingTop}>
        <Icon size={iconSize} icon={icon} color={iconColor} />
      </StyledIconBorder>
      <StyledColumn>
        {title &&
          (isValidElement(title) ? (
            title
          ) : (
            <Typography variant="BODY" bold="FULL">
              {title}
            </Typography>
          ))}
        {isValidElement(description) ? description : <Typography variant="BODY">{description}</Typography>}
      </StyledColumn>
    </StyledWrapper>
  );
};
