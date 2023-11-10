import styled from 'styled-components';

import { Menu } from '../../../../navigation/menu';

const SUB_MENU_WIDTH = 160;

export const StyledMenu = styled(Menu)`
  max-width: ${SUB_MENU_WIDTH}px;
  padding: ${({ theme }) => theme.FSG_SPACING.S8} 0;
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  border-radius: 0px;
  border: none;
  outline: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
`;
