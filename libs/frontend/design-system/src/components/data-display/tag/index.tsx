import { isValidElement, ReactNode } from 'react';

import { Color } from '../../../styles/color';
import { FSGFont } from '../../../typings/fsg-theme';
import { TEST_IDS } from '../../../utils/constants';
import { BoldVariant, FileSGProps } from '../../../utils/typings';
import { Typography } from '../typography';
import { StyledIconButton, StyledWrapper } from './style';

export type Props = {
  /**
   * Style variant of tag
   */
  variant?: 'FILLED' | 'OUTLINED';
  /**
   * Color of tag
   */
  color?: 'GREY' | 'PRIMARY' | 'SECONDARY' | 'DANGER' | 'SUCCESS' | 'WARNING' | 'INFO';
  /**
   * Theme of light
   */
  tagTheme?: 'LIGHT' | 'DARK';
  /**
   * Size of tag
   */
  size?: 'DEFAULT' | 'SMALL' | 'MEDIUM' | 'LARGE';
  /**
   * Content of tag
   */
  children: ReactNode;
  isEllipsis?: boolean;
  ellipsisLine?: number;
  bold?: BoldVariant;
  onRemoveTag?: () => void;
  removeButtonAriaLabel?: string;
  maxWidthInPx?: number;
} & FileSGProps;
/**
 * Tag is an atomic component that display minimum information of the resource's status.
 */
export const Tag = ({
  variant = 'FILLED',
  color = 'GREY',
  size = 'DEFAULT',
  bold = undefined,
  children,
  isEllipsis = false,
  ellipsisLine,
  className,
  tagTheme,
  removeButtonAriaLabel,
  onRemoveTag,
  ...rest
}: Props) => {
  function getFontVariant(size: Props['size']): keyof FSGFont {
    switch (size) {
      case 'LARGE':
        return 'BODY';

      case 'SMALL':
        return 'SMALLER';

      case 'MEDIUM':
      default:
        return 'SMALL';
    }
  }

  return (
    <StyledWrapper
      isEllipsis={isEllipsis}
      tagTheme={tagTheme}
      variant={variant}
      color={color}
      size={size}
      className={className}
      ellipsisLine={ellipsisLine}
      data-testid={rest['data-testid'] ?? TEST_IDS.TAG}
      {...rest}
    >
      {isValidElement(children) ? (
        children
      ) : (
        <Typography
          bold={bold}
          variant={getFontVariant(size)}
          isEllipsis={isEllipsis}
          ellipsisLine={ellipsisLine}
          data-testid={rest['data-testid'] ? `${rest['data-testid']}-text` : TEST_IDS.TAG_TEXT}
        >
          {children}
        </Typography>
      )}

      {onRemoveTag && (
        <StyledIconButton
          size="SMALL"
          iconColor={Color.GREY60}
          onClick={onRemoveTag}
          decoration="GHOST"
          icon={'sgds-icon-cross'}
          ariaLabel={removeButtonAriaLabel}
        ></StyledIconButton>
      )}
    </StyledWrapper>
  );
};
