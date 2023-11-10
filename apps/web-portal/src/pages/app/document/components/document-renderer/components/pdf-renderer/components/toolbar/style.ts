import styled from "styled-components";

export const StyledToolbarWrapper = styled.div`
  position: absolute;
  left: 50%;
  bottom: 3rem;
  transform: translate(-50%, 0);
  z-index: 1;

  @media screen and (max-width: 1023px) {
    bottom: 1.5rem;
  }
`;

export const StyledToolsContainer = styled.div<{ isShowToolbar: boolean }>`
  display: none;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80 + 'CC'};

  padding: ${({ theme }) => theme.FSG_SPACING.S4};
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};

  ${({ isShowToolbar }) => {
    if (isShowToolbar) {
      return 'display: flex';
    }
  }}
`;


export const StyledPageNavigationContainer = styled.div`
  display: flex;
  align-items: center;

  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;


