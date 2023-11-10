import styled from 'styled-components';

export const StyledContainer = styled.div`
  flex-grow: 1;
  margin: 0 auto;
  position: relative;
  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE}) {
    max-width: 976px;
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP}) {
    max-width: 1184px;
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP}) {
    max-width: 1344px;
  }
`;
