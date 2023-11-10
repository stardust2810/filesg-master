import styled from 'styled-components';

export const LayoutContainer = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;

  min-height: 100vh;
  width: 100%;
`;

export const HeaderAndBodyContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;
`;

export const NavBarContainer = styled.div`
  width: 100%;
`;

export const BodyRow = styled.div`
  display: flex;
  flex: 1;

  width: 100%;
`;

export const BodyAndRightSidebarContainer = styled.div`
  display: flex;
  flex: 1;

  width: 100%;
  /* Add min-width: 0  to fix width size to whatever space available */
  min-width: 0;
`;
