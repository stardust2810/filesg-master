import { useSpring, UseSpringsProps } from '@react-spring/web';
import { useCallback, useEffect, useState } from 'react';
import useMeasure from 'react-use-measure';

import { usePrevious } from './usePrevious';

interface AccordionAnimationProps {
  isInitiallyOpen?: boolean;
  toggleOpen?: boolean;
}

const ACCORDION_ANIMATION_DURATION_MS = 300;

export function useAccordionAnimation({ isInitiallyOpen = false, toggleOpen }: AccordionAnimationProps) {
  const [isExpanded, setIsExpanded] = useState(isInitiallyOpen);
  const isExpandedPrevious = usePrevious(isExpanded);

  const [ref, { height }] = useMeasure();

  const useSpringProps: UseSpringsProps = {
    config: { duration: ACCORDION_ANIMATION_DURATION_MS },
    from: {
      height: 0,
    },
    to: {
      height: isExpanded ? height : 0,
    },
  };

  const accordionDetailsSpring = useSpring(useSpringProps);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    if (toggleOpen !== undefined) {
      setIsExpanded(toggleOpen);
    }
  }, [toggleOpen]);

  return {
    accordionDetailsSpring,
    ref,
    toggleExpand,
    isExpanded,
    isExpandedAndRerendered: isExpanded && isExpandedPrevious === isExpanded,
  };
}
