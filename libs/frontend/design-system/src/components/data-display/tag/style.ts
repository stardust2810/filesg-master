import styled from 'styled-components';

import { IconButton } from '../../inputs/icon-button';
import { Props } from '.';

type StyledProps = Pick<Props, 'variant' | 'color' | 'size' | 'ellipsisLine' | 'tagTheme' | 'isEllipsis'>;

export const StyledWrapper = styled.div<StyledProps>`
  display: flex;
  flex-shrink: ${({ ellipsisLine }) => (ellipsisLine ? 1 : 0)};

  flex-direction: row;
  justify-content: center;
  align-items: center;

  height: fit-content;
  width: fit-content;

  font-weight: ${({ tagTheme }) => {
    if (tagTheme === 'DARK') {
      return 600;
    }
    return 400;
  }};

  color: ${({ theme, color, tagTheme, variant }) => {
    if (!color) {
      return;
    }
    if (variant === 'FILLED' && tagTheme === 'DARK') {
      return theme.FSG_COLOR.SYSTEM.WHITE;
    }
    if (color === 'GREY') {
      return theme.FSG_COLOR.GREYS.GREY80;
    }
    return theme.FSG_COLOR[color].DARKER;
  }};

  background-color: ${({ theme, variant, color, tagTheme }) => {
    if (!color) {
      return;
    }
    if (variant === 'OUTLINED') {
      return theme.FSG_COLOR.SYSTEM.WHITE;
    }
    if (color === 'GREY') {
      return theme.FSG_COLOR.GREYS.GREY20;
    }
    if (tagTheme === 'DARK') {
      return theme.FSG_COLOR[color].DEFAULT;
    }
    return theme.FSG_COLOR[color].LIGHTEST;
  }};

  border-radius: ${({ theme, size }) => {
    const { S12, S16 } = theme.FSG_SPACING;

    switch (size) {
      case 'LARGE':
        return '1.875rem';

      case 'MEDIUM':
        return S16;

      case 'SMALL':
        return S12;

      default:
        return S12;
    }
  }};

  padding: ${({ theme, size }) => {
    const { S2, S6, S8, S12, S16 } = theme.FSG_SPACING;

    switch (size) {
      case 'LARGE':
        return S8 + ' ' + S16;

      case 'MEDIUM':
        return S6 + ' ' + S12;

      case 'SMALL':
        return 0 + ' ' + S8;

      default:
        return S2 + ' ' + S8;
    }
  }};

  gap: ${({ theme }) => theme.FSG_SPACING.S4};

  ${({ isEllipsis }) =>
    isEllipsis &&
    `
    min-width: 0;
    max-width:100%;
  `}
`;
export const StyledIconButton = styled(IconButton)`
  padding: 0;
  min-height: 0;
`;
