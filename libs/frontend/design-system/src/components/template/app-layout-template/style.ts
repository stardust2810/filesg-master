import styled from 'styled-components';

import { Color } from '../../../styles/color';

export const LayoutContainer = styled.main`
  display: flex;
  flex: 1;
  flex-direction: column;
  position: relative;

  width: 100%;
`;

export const HeaderAndBodyContainer = styled.div`
  width: 100%;
  display: flex;
  flex: 1;
  flex-direction: column;

  // Add min-height to prevent awkward jump of footer from top of screen to bottom
  min-height: 80vh;
`;

export const NavBarContainer = styled.div`
  width: 100%;
  z-index: 2;
`;

export const BodyRow = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;

  width: 100%;
  z-index: 1;
  border-top: solid 1px ${Color.GREY30};
`;

export const StyledBannerWrapper = styled.div`
  display: flex;
  flex: 0;
`;

export const BodyContainer = styled.div`
  display: flex;
  flex: 1;

  position: relative;

  width: 100%;
  /* Add min-width: 0  to fix width size to whatever space available */
  min-width: 0;
`;

export const StyledSideNavContainer = styled.div`
  display: flex;
  flex-direction: column;
  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
  padding: ${({ theme }) => theme.FSG_SPACING.S24} 0;
`;

export const StyledSideNavHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  height: ${({ theme }) => theme.FSG_SPACING.S40};
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S24};

  span {
    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};
  }
`;
