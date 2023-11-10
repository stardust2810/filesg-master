import { Color } from '@filesg/design-system';
import styled from 'styled-components';

export const TabHeaderContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S24};
  background-color: ${Color.GREY10};
  border-bottom: 1px solid ${Color.GREY30};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const TabTitle = styled.div`
  padding: ${({ theme }) => {
    const { S12, S16 } = theme.FSG_SPACING;
    return `${S12} ${S16}`;
  }};
`;
