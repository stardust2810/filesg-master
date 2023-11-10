import styled from 'styled-components';

import { Props } from '.';

type StyledProps = Pick<Props, 'block' | 'variant'>

export const StyledDiv = styled.div<StyledProps>`
  display: flex;
  width: ${({ block }) => {
    if (block) {
      return '100%';
    }
    return '';
  }};

  background-color: ${({ theme, variant }) => {
    return theme.FSG_COLOR[variant].LIGHTEST;
  }};

  padding: ${({ theme }) => {
    return theme.FSG_SPACING.S16;
  }};

  border: 1px solid
    ${({ theme, variant }) => {
      return theme.FSG_COLOR[variant].DEFAULT;
    }};

  border-radius: 8px;
`;
