import styled from 'styled-components';

import { HEX_COLOR_OPACITY } from '../../../utils/constants';
import { Props } from '.';

const BACKDROP_OPACITY = HEX_COLOR_OPACITY.P60;
const Z_INDEX_BACKDROP = 200;
type StyledBackdropProps = Pick<Props, 'invisible' | 'topPadding' | 'isBlur'>;

export const StyledDiv = styled.div<StyledBackdropProps>`
  background-color: ${({ theme, invisible }) => (invisible ? 'transparent' : `${theme.FSG_COLOR.GREYS.GREY80}${BACKDROP_OPACITY}`)};
  position: absolute;
  z-index: ${Z_INDEX_BACKDROP};
  top: ${({ topPadding }) => (topPadding ? topPadding : 0)};
  bottom: 0;
  left: 0;
  right: 0;
  backdrop-filter: ${({ isBlur }) => (isBlur ? `blur(8px)` : `none`)};
`;
