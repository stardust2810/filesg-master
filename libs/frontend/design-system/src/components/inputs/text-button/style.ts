import styled from 'styled-components';

import { HEX_COLOR_OPACITY } from '../../../utils/constants';
import { Props } from '.';

type StyledProps = Pick<Props, 'disabled'>;

export const StyledButton = styled.button<StyledProps>`
  display: flex;
  position: relative;
  width: fit-content;
  height: fit-content;

  align-items: center;
  text-align: inherit;

  border: none;
  background-color: transparent;
  border-bottom: ${({ disabled, theme }) => {
    if (!disabled) {
      return '1px solid ' + theme.FSG_COLOR.SYSTEM.WHITE + HEX_COLOR_OPACITY.P00;
    }
    return '';
  }};
  cursor: ${({ disabled }) => {
    if (disabled) {
      return 'default';
    }
    return 'pointer';
  }};

  gap: ${({ theme }) => {
    return theme.FSG_SPACING.S8;
  }};

  color: ${({ color }) => {
    return color;
  }};

  padding: 0;

  opacity: ${({ disabled }) => {
    if (disabled) {
      return '0.4';
    }
    return '1';
  }};

  &:hover,
  &:active {
    border-bottom: ${({ disabled, theme }) => {
      if (!disabled) {
        return '1px solid ' + theme.FSG_COLOR.GREYS.GREY30;
      }
      return '';
    }};
  }

  &:focus {
    box-shadow: ${({ color }) => {
      if (color) {
        return '0px 0px 0px 2px' + color + '40';
      }
      return '';
    }};
  }

  &:focus-visible {
    outline: none;
  }
`;
