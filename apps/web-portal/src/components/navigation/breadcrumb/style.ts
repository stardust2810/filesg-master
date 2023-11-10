import { NavLink } from 'react-router-dom';
import styled from 'styled-components';


export const StyledNavLink = styled(NavLink)<{ $enableNav: boolean }>`
  ${({ $enableNav }) =>
    $enableNav
      ? `&:hover:not(.active) {
      color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
      text-decoration: underline;
  }`
      : 'pointer-events: none;'}
`;
