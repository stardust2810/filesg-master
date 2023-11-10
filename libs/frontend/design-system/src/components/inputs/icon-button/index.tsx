import { ButtonHTMLAttributes, forwardRef } from 'react';

import { Color } from '../../../styles/color';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { ButtonColorsTheme, ButtonDecoration, FileSGProps } from '../../../utils/typings';
import { StyledButton } from './style';

export type Props = {
  decoration?: ButtonDecoration;
  color?: ButtonColorsTheme;
  iconColor?: Color;
  size?: 'NORMAL' | 'SMALL';
  block?: boolean;
  icon: IconLiterals;
  round?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  isLoading?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  hasRippleAnimation?: boolean;
  disableHoverEffect?: boolean;
  ariaLabel?: string;
} & FileSGProps;

export const IconButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      decoration = 'SOLID',
      color = 'PRIMARY',
      iconColor,
      size = 'NORMAL',
      block = false,
      icon,
      round = false,
      onClick,
      isLoading,
      disabled = false,
      className,
      type,
      hasRippleAnimation = true,
      disableHoverEffect = false,
      ariaLabel,
      ...rest
    }: Props,
    ref,
  ): JSX.Element => {
    return (
      <StyledButton
        decoration={decoration}
        color={color}
        iconColor={iconColor}
        size={size}
        fullWidth={block}
        round={round}
        onClick={onClick}
        className={className}
        startIcon={isLoading ? 'fsg-icon-loading' : icon}
        disabled={disabled}
        label=""
        hasRippleAnimation={hasRippleAnimation}
        disableHoverEffect={disableHoverEffect}
        data-testid={rest['data-testid'] ?? TEST_IDS.ICON_BUTTON}
        aria-label={ariaLabel ? ariaLabel : rest['aria-label']}
        type={type}
        ref={ref}
      />
    );
  },
);
