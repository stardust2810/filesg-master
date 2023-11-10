import { useTheme } from 'styled-components';

import { useWindowSize } from '../../../hooks/useWindowSize';
import { FSG_DEVICES, RESPONSIVE_VARIANT } from '../../../utils/constants';

function convertBreakpointToNumber(breakpointInString: string): number {
  return parseInt(breakpointInString.replace('px', ''), 10);
}

type Props = {
  children: JSX.Element | null;
  variant: RESPONSIVE_VARIANT;
  device: FSG_DEVICES;
};

export function ResponsiveRenderer({ children, variant, device }: Props): JSX.Element | null {
  const { width } = useWindowSize();
  const themeContext = useTheme();
  const breakpointInPx = convertBreakpointToNumber(themeContext.FSG_BREAKPOINTS[device]);

  switch (variant) {
    case RESPONSIVE_VARIANT.SMALLER_THAN:
      return width < breakpointInPx ? children : null;
    case RESPONSIVE_VARIANT.SMALLER_OR_EQUAL_TO:
      return width <= breakpointInPx ? children : null;
    case RESPONSIVE_VARIANT.LARGER_THAN:
      return width > breakpointInPx ? children : null;
    case RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO:
      return width >= breakpointInPx ? children : null;
    default:
      return null;
  }
}
