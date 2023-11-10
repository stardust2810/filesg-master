import styled from 'styled-components';

export const StyledActionBarContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-top: 0;
  display: flex;
  flex-direction: column;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return S24 + ' ' + S16;
    }};
    padding-top: 0;
  }
`;
