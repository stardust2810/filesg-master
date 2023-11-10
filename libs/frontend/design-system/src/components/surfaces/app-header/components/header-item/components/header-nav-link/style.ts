import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { Color } from '../../../../../../../styles/color';

export const StyledNavLink = styled(NavLink)`
  :not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S24};
  }
  display: flex;
  align-items: center;
  height: 88px;

  &.active {
    /* box-shadow: inset 0 -2px 0 0 ${Color.PURPLE_DEFAULT}; */
    border-bottom: inset 2px ${Color.PURPLE_DEFAULT};
  }

  &:hover {
    & > span {
      color: ${Color.PURPLE_DEFAULT};
    }
  }
`;
