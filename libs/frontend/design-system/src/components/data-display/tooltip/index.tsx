import { isValidElement } from 'react';

import { Color } from '../../../styles/color';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { Icon } from '../icon';
import { Typography } from '../typography';
import { StyledButton, StyledReactTooltip, StyledTooltipWrapper } from './style';

export const DEFAULT_ICON: IconLiterals = 'sgds-icon-circle-info';
export const DEFAULT_ICON_COLOR: Color = Color.GREY40;
const DEFAULT_TOOLTIP_POSITION = 'right';

export type Props = {
  /**
   * Icon to display
   */
  icon?: IconLiterals;
  /**
   * Size of icon
   */
  iconSize?: 'ICON_NORMAL' | 'ICON_SMALL' | 'ICON_LARGE' | 'ICON_MINI';
  /**
   * Color of icon
   */
  iconColor?: Color;
  /**
   * UI Trigger Component of choice
   */
  uiTriggerComponent?: JSX.Element;
} & TooltipTextProp &
  FileSGProps;

type TooltipTextProp = {
  /**
   * Identifier of tooltip that should be unique in the page
   */
  identifier: string;
  /**
   * Content of tooltip
   */
  content: string;
  /**
   * Position where the tooltip appear
   */
  messagePosition?: 'left' | 'right' | 'top' | 'bottom';
  /**
   * Icon to display
   */
} & FileSGProps;

export const TooltipText = ({ identifier, messagePosition, content: text, ...rest }: TooltipTextProp) => {
  return (
    <StyledReactTooltip
      role="tooltip"
      effect="solid"
      isCapture={true}
      id={identifier}
      place={messagePosition}
      data-testid={rest['data-testid'] ?? TEST_IDS.TOOLTIP_TEXT}
    >
      <Typography variant="BODY">{text}</Typography>
    </StyledReactTooltip>
  );
};

/**
 * Tooltip is a molecule component that display text description appears when the targeted icon is hovered over.
 */
export const Tooltip = ({
  identifier,
  content,
  messagePosition = DEFAULT_TOOLTIP_POSITION,
  icon = DEFAULT_ICON,
  iconSize,
  iconColor = DEFAULT_ICON_COLOR,
  uiTriggerComponent,
  ...rest
}: Props) => {
  return (
    <StyledTooltipWrapper>
      <StyledButton
        data-tip
        data-for={identifier}
        aria-describedby={identifier}
        data-testid={rest['data-testid'] ?? `${TEST_IDS.TOOLTIP}-${identifier}`}
        type="button"
      >
        {isValidElement(uiTriggerComponent) ? (
          uiTriggerComponent
        ) : (
          <Icon aria-hidden={false} aria-label={rest['aria-label']} icon={icon} size={iconSize} color={iconColor} />
        )}
      </StyledButton>

      <TooltipText style={{ zIndex: 1000 }} identifier={identifier} messagePosition={messagePosition} content={content} />
    </StyledTooltipWrapper>
  );
};
