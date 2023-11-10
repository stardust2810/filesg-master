import { NavLink } from 'react-router-dom';
import styled, { css } from 'styled-components';

import { HEADER_MIN_HEIGHT } from '../../../utils/constants';

export const StyledHeaderWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S48};

  min-height: ${HEADER_MIN_HEIGHT}px;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S24};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

// =============================================================================
//  LOGO
// =============================================================================

const logoContainerStyles = css`
  margin: ${({ theme }) => theme.FSG_SPACING.S20} 0;
  height: ${({ theme }) => theme.FSG_SPACING.S48};
  display: flex;
  align-items: center;
  flex-shrink: 0;

  @media only screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    height: ${({ theme }) => theme.FSG_SPACING.S24};
    margin: 0;
  } ;
`;

export const StyledLogoNavLink = styled(NavLink)`
  ${logoContainerStyles}
`;

export const StyledLogoButton = styled.button`
  ${logoContainerStyles}
  background-color: inherit;
  border: none;
  padding: 0;
  cursor: pointer;
`;

// =============================================================================
//  NAV/ACTION ITEMS
// =============================================================================

export const StyledNavActionMenu = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledNavMenu = styled.ul`
  margin-left: ${({ theme }) => theme.FSG_SPACING.S32};

  flex: 1;
  display: flex;
  height: 100%;

  li:not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
