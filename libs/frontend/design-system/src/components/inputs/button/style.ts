/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable sonarjs/no-identical-functions */
import styled from 'styled-components';

import { ButtonDecoration } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { ColorTheme } from '.';

type StyledButtonProps = {
  colorTheme: ColorTheme;
  disabled: boolean;
  size: 'NORMAL' | 'SMALL';
  fullWidth: boolean;
  decoration: ButtonDecoration;
  disableHoverEffect: boolean;
};

export const StyledButton = styled.button<StyledButtonProps>`
  display: flex;
  height: fit-content;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: left;
  position: relative;

  overflow: hidden; // Hide overflow from ripple animation

  /* Overflow hidden will somehow shrink the height of the button
   Min height is to prevent this */
  min-height: ${({ size, theme }) => {
    const { S32, S48 } = theme.FSG_SPACING;
    if (size === 'SMALL') {
      return S32;
    }
    return S48;
  }};

  min-width: ${({ size }) => {
    if (size === 'SMALL') {
      return 'fit-content';
    }
    return '120px';
  }};

  /* Height of button will be determined by line height + padding */
  padding: ${({ size, theme }) => {
    const { S6, S12, S16 } = theme.FSG_SPACING;
    if (size === 'SMALL') {
      return S6 + ' ' + S16;
    }
    return S12 + ' ' + S16;
  }};

  cursor: ${({ disabled }) => {
    if (disabled) {
      return 'default';
    }
    return 'pointer';
  }};

  width: ${({ fullWidth }) => {
    if (fullWidth) {
      return '100%';
    }
    return 'fit-content';
  }};

  background-color: ${({ decoration, colorTheme }) => {
    if (decoration === 'SOLID') {
      return colorTheme.DEFAULT;
    }
    return 'inherit';
  }};

  color: ${({ decoration, colorTheme, theme }) => {
    if (decoration === 'SOLID') {
      return theme.FSG_COLOR.SYSTEM.WHITE;
    }
    return colorTheme.DEFAULT;
  }};

  border: ${({ decoration, colorTheme }) => {
    if (decoration === 'OUTLINE') {
      return '1px solid ' + colorTheme.DEFAULT;
    }
    return 'none';
  }};

  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  opacity: ${({ disabled }) => {
    if (disabled) {
      return '0.4';
    }
    return '1';
  }};

  &:hover {
    background-color: ${({ disabled, colorTheme, decoration, disableHoverEffect }) => {
      if (disabled || disableHoverEffect) {
        return '';
      }

      if (decoration === 'SOLID') {
        return colorTheme.DARKER;
      }
      return colorTheme.LIGHTEST;
    }};

    border-color: ${({ disabled, colorTheme, decoration, disableHoverEffect }) => {
      if (disableHoverEffect) {
        return '';
      }

      if (!disabled && decoration === 'OUTLINE') {
        return colorTheme.DARKER;
      }
      return '';
    }};

    color: ${({ disabled, colorTheme, decoration, disableHoverEffect }) => {
      if (disableHoverEffect) {
        return '';
      }

      if (!disabled && decoration !== 'SOLID') {
        return colorTheme.DARKER;
      }
      return '';
    }};
  }

  &:focus {
    outline: solid 2px
      ${({ colorTheme }) => {
        return colorTheme.DEFAULT + '40';
      }};
  }
`;

export const StyledLabelContainer = styled.div<{ size: 'NORMAL' | 'SMALL'; spaceBetween: boolean }>`
  display: flex;
  align-items: center;

  ${({ spaceBetween }) => {
    if (spaceBetween) {
      return `
      width: 100%;
      justify-content: space-between;
      `;
    }

    return '';
  }};

  gap: ${({ size, theme }) => {
    const { S4, S8 } = theme.FSG_SPACING;
    if (size === 'NORMAL') {
      return S8;
    }

    return S4;
  }};
`;

export const StyledLoaderIcon = styled(Icon)`
  animation: rotation 2s infinite linear;

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;
