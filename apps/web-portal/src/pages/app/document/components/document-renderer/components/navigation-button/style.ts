import { HEX_COLOR_OPACITY, IconButton } from '@filesg/design-system';
import styled from 'styled-components';

import { NAVIGATION_DIRECTION } from '../..';

export const StyledIconButton = styled(IconButton)<{ direction: NAVIGATION_DIRECTION }>`
  position: absolute;
  top: 50%;
  ${({ direction }) => {
    if (direction === NAVIGATION_DIRECTION.NEXT) {
      return `right: 0;`;
    }
  }}

  @media screen and (min-width: 1024px) {
    ${({ direction, theme }) => {
      if (direction === NAVIGATION_DIRECTION.PREVIOUS) {
        return `left: ${theme.FSG_SPACING.S24};`;
      }
      return `right: ${theme.FSG_SPACING.S24};`;
    }}
  }

  background-color: ${({ theme, disabled }) => theme.FSG_COLOR.GREYS.GREY80 + (disabled ? HEX_COLOR_OPACITY.P60 : HEX_COLOR_OPACITY.P80)};

  z-index: 2;

  &::focus {
    outline: none;
  }
`;
