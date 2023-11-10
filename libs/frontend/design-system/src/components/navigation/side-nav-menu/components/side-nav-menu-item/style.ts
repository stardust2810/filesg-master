import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { Color } from '../../../../../styles/color';

export const StyledNavLink = styled(NavLink)`
  padding: ${({ theme }) => 0 + ' ' + theme.FSG_SPACING.S24};

  &.active {
    box-shadow: inset 4px 0 0 0 ${Color.PURPLE_DEFAULT};
  }

  &:hover {
    & > span {
      color: ${Color.PURPLE_DEFAULT};
    }
    box-shadow: inset 4px 0 0 0 ${Color.PURPLE_DEFAULT};
  }
`;
