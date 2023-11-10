import { RefObject, useCallback, useEffect, useState } from 'react';

const DEFAULT_SCROLL_BUFFER = 100;
const CALCULATION_DELAY_MILLISECONDS = 500;

/**
 * This hook calculates if the component has been scrolled to.
 * Should the user scroll up above the component, this hook will return false
 *
 * @param {RefObject<HTMLElement>}ref - The ref of the component
 *
 * @param {number} scrollBuffer - Optional buffer (in px) before the component is considered visible (default: 150px)
 *
 * @returns {boolean} isScrolledPast The stack trace of the error.
 */

export const useIsComponentScrolledTo = (ref: RefObject<HTMLElement>, scrollBuffer?: number, startCalculation?: boolean) => {
  const [isScrolledTo, setIsScrolledTo] = useState(false);
  const componentScrollBuffer = scrollBuffer ? scrollBuffer : DEFAULT_SCROLL_BUFFER;

  const updateIsScrolledTo = useCallback(() => {
    if (ref.current) {
      const windowHeight = window.innerHeight;
      const componentTop = ref.current.getBoundingClientRect().top;

      const isVisible = componentTop < windowHeight - componentScrollBuffer;
      if (isVisible !== isScrolledTo) {
        setIsScrolledTo(isVisible);
      }
    }
  }, [ref, isScrolledTo, componentScrollBuffer]);

  useEffect(() => {
    window.addEventListener('scroll', updateIsScrolledTo);
    window.addEventListener('resize', updateIsScrolledTo);

    return () => {
      window.removeEventListener('scroll', updateIsScrolledTo);
      window.removeEventListener('resize', updateIsScrolledTo);
    };
  }, [updateIsScrolledTo]);

  useEffect(() => {
    /**
     * Trigger updateIsScrolledTo to get the initial value
     *
     * Update isScrolledTo value once startCalculation is true (indicating that hero img is
     * loaded), else delay by 500ms before updating isScrolledTo (in case hero img taking too
     * long to load)
     *  */

    if (startCalculation) {
      updateIsScrolledTo();
    } else {
      setTimeout(() => {
        updateIsScrolledTo();
      }, CALCULATION_DELAY_MILLISECONDS);
    }
  }, [updateIsScrolledTo, startCalculation]);
  return isScrolledTo;
};
