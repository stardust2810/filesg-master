import { animated } from '@react-spring/web';
import styled from 'styled-components';

import { Color } from '../../../styles/color';
import { HEX_COLOR_OPACITY } from '../../../utils/constants';

const Z_INDEX_DRAWER = 300;
const DRAWER_WIDTH = '240px';

type DrawerStylingProps = {
  $isOpened: boolean;
  $topPadding?: string;
};
export const StyledDrawer = styled(animated.div)<DrawerStylingProps>`
  z-index: ${Z_INDEX_DRAWER};
  position: fixed;
  width: ${DRAWER_WIDTH};

  right: 0;
  top: ${({ $topPadding }) => ($topPadding ? $topPadding : 0)};
  bottom: 0;

  background-color: ${Color.GREY10};

  box-shadow: ${Color.GREY20}${HEX_COLOR_OPACITY.P50} 0px 1px 3px;
`;
