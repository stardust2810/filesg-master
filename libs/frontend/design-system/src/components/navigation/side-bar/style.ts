import styled from 'styled-components';
const NAV_SIDEBAR_WIDTH = 240;

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: ${NAV_SIDEBAR_WIDTH / 16}rem;

  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  border-right: ${({ theme }) => `1px solid ${theme.FSG_COLOR.GREYS.GREY30}`};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    display: none;
  }
`;

export const StickyContentWrapper = styled.div`
  position: sticky;
  top: 0;
  max-height: calc(100vh - 28px - 88px);
  overflow-y: auto;
  padding: ${({ theme }) => theme.FSG_SPACING.S24 + ' ' + 0};
`;
