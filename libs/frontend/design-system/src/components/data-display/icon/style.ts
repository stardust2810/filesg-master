import styled from 'styled-components';

import { Props } from '.';

type StyledProps = Required<Pick<Props, 'size'>> & Pick<Props, 'color'>;

export const StyledSpan = styled.span<StyledProps>`
  &::before {
    color: ${({ color }) => {
      if (color) {
        return color;
      }
      return '';
    }};
  }

  height: ${({ size, theme }) => {
    return theme.FSG_FONT[size].SIZE;
  }};

  width: ${({ size, theme }) => {
    return theme.FSG_FONT[size].SIZE;
  }};

  font-size: ${({ size, theme }) => {
    return theme.FSG_FONT[size].SIZE;
  }} !important;
`;
