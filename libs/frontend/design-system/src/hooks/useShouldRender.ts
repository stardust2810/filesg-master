import { useTheme } from 'styled-components';

import { FSG_DEVICES, RESPONSIVE_VARIANT } from '../utils/constants';
import { convertBreakpointToNumber } from '../utils/helper';
import { useWindowSize } from './useWindowSize';

export const useShouldRender = (variant: RESPONSIVE_VARIANT, device: FSG_DEVICES) => {
  const { width } = useWindowSize();
  const themeContext = useTheme();
  const breakpointInPx = convertBreakpointToNumber(themeContext.FSG_BREAKPOINTS[device]);

  switch (variant) {
    case RESPONSIVE_VARIANT.SMALLER_THAN:
      return width < breakpointInPx;
    case RESPONSIVE_VARIANT.SMALLER_OR_EQUAL_TO:
      return width <= breakpointInPx;
    case RESPONSIVE_VARIANT.LARGER_THAN:
      return width > breakpointInPx;
    case RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO:
      return width >= breakpointInPx;
    default:
      return false;
  }
};
