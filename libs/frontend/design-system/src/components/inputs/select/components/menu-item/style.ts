import styled from 'styled-components';

import { Props } from '.';

type StyledProps = Pick<Props, 'size'> & { selected: boolean };

export const StyledOption = styled.li<StyledProps>`
  display: flex;
  text-align: left;
  justify-content: space-between;
  width: 100%;

  gap: ${({ theme }) => theme.FSG_SPACING.S12};

  padding: ${({ theme, size }) => {
    const { S6, S12, S16 } = theme.FSG_SPACING;
    if (size === 'SMALL') {
      return S6 + ' ' + S16;
    }
    return S12 + ' ' + S16;
  }};

  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  color: ${({ theme, selected, color }) => {
    if (selected && color) {
      return theme.FSG_COLOR[color].DEFAULT;
    }
    return theme.FSG_COLOR.GREYS.GREY80;
  }};
  border: none;
  cursor: pointer;

  &:first-child {
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
  }

  &:last-child {
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
  }

  &:focus {
    outline-offset: -2px;
  }
`;
