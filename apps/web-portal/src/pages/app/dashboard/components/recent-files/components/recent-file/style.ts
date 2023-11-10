import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const StyledContainer = styled(Link)`
  color: inherit;
  display: flex;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  padding: ${({ theme }) => {
    const { S12, S24 } = theme.FSG_SPACING;
    return `${S12} ${S24}`;
  }};
  gap: ${({ theme }) => theme.FSG_SPACING.S16};

  &:hover {
    background-color: ${({ theme }) => {
      return theme.FSG_COLOR.GREYS.GREY10;
    }};
    color: inherit;
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S12, S16 } = theme.FSG_SPACING;
      return `${S12} ${S16}`;
    }};
  }
`;

export const StyledFileDetailsTextContainer = styled.span`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.FSG_SPACING.S4};
`;

export const StyledFileName = styled.span`
  display: flex;
`;
