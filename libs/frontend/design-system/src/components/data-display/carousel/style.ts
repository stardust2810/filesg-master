import styled from 'styled-components';

export const StyledContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledItemContainer = styled.div<{ overlap: boolean }>`
  display: flex;
  width: 100%;
  height: 100%;
  padding: ${({ overlap }) => (overlap ? 0 : 0 + ' 50px')};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding: 0;
  }
`;

export const StyledContentContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;
