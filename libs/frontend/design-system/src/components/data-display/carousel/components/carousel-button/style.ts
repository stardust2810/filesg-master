import styled from 'styled-components';

import { IconButton } from '../../../../inputs/icon-button';

export const StyledIconButton = styled(IconButton)<{ left: boolean }>`
  ${({ left }) => (left ? 'margin-left: 2px;' : 'margin-right: 2px;')}

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    display: none;
  }
`;
