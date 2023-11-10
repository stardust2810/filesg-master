import { forwardRef, MouseEventHandler } from 'react';
import { useTheme } from 'styled-components';

import { useButtonRipple } from '../../../hooks/useButtonRipple';
// import { createRipple } from '../../../styles/button/utils';
import { IconLiterals } from '../../../typings/icon-literals';
import { TEST_IDS } from '../../../utils/constants';
import { BoldVariant, ButtonColorsTheme, ButtonDecoration, FileSGProps } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { Typography } from '../../data-display/typography';
import { StyledButton, StyledLabelContainer, StyledLoaderIcon } from './style';

export type ColorTheme = {
  DEFAULT: string;
  DARKER: string;
  LIGHTEST: string;
};

export type Props = {
  label: string;
  bold?: BoldVariant;
  decoration?: ButtonDecoration;
  color?: ButtonColorsTheme | ColorTheme;
  size?: 'NORMAL' | 'SMALL';
  fullWidth?: boolean;
  spaceBetween?: boolean;
  disabled?: boolean;
  startIcon?: IconLiterals;
  endIcon?: IconLiterals;
  onClick?: MouseEventHandler<HTMLElement>;
  isLoading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  hasRippleAnimation?: boolean;
  disableHoverEffect?: boolean;
} & FileSGProps;

export const Button = forwardRef<HTMLButtonElement, Props>(
  (
    {
      label,
      bold,
      decoration = 'SOLID',
      color = 'PRIMARY',
      size = 'NORMAL',
      fullWidth = false,
      spaceBetween = false,
      disabled = false,
      startIcon,
      endIcon,
      onClick,
      isLoading,
      className,
      style,
      type,
      hasRippleAnimation = true,
      disableHoverEffect = false,
      ...rest
    }: Props,
    ref,
  ): JSX.Element => {
    const theme = useTheme();
    const { createRipple, ripplesArray } = useButtonRipple(colorThemeObject(color), decoration);

    function colorThemeObject(colorTheme: ButtonColorsTheme | ColorTheme): ColorTheme {
      if (typeof colorTheme === 'string') {
        const { DEFAULT, DARKER, LIGHTEST } = theme.FSG_COLOR[colorTheme];
        return { DEFAULT, DARKER, LIGHTEST };
      }
      return colorTheme;
    }

    function onClickHandler(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
      hasRippleAnimation && createRipple(event);
      onClick && onClick(event);
    }

    return (
      <StyledButton
        decoration={decoration}
        colorTheme={colorThemeObject(color)}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
        onClick={onClickHandler}
        className={className}
        style={style}
        data-testid={rest['data-testid'] ?? TEST_IDS.BUTTON}
        type={type}
        ref={ref}
        disableHoverEffect={disableHoverEffect}
        aria-label={rest['aria-label'] ?? label}
      >
        {isLoading ? (
          <StyledLoaderIcon icon="fsg-icon-loading-solid" size={`ICON_${size}`} />
        ) : (
          <StyledLabelContainer size={size} spaceBetween={spaceBetween}>
            {startIcon && <Icon icon={startIcon} size={`ICON_${size}`} />}
            {label && (
              <Typography variant={`BUTTON_${size}`} bold={bold}>
                {label}
              </Typography>
            )}
            {endIcon && <Icon icon={endIcon} size={`ICON_${size}`} />}
          </StyledLabelContainer>
        )}

        {hasRippleAnimation && ripplesArray}
      </StyledButton>
    );
  },
);
