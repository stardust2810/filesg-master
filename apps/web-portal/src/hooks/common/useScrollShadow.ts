import { RefObject, useCallback, useEffect } from 'react';

export const useScrollShadow = (contentRef: RefObject<HTMLElement>) => {
  const updateShadowOpacity = useCallback(() => {
    const shadowLeft = document.querySelector('.fsg-shadow-left');
    const shadowRight = document.querySelector('.fsg-shadow-right');
    if (contentRef.current) {
      const contentScrollWidth = contentRef.current.scrollWidth - contentRef.current.offsetWidth;
      const currentScrollProgress = contentScrollWidth ? contentRef.current.scrollLeft / contentScrollWidth : 0;

      (shadowLeft as HTMLElement).style.opacity = currentScrollProgress.toString();
      (shadowRight as HTMLElement).style.opacity = contentScrollWidth ? (1 - currentScrollProgress).toString() : '0';
    }
  }, [contentRef]);

  useEffect(() => {
    const contentNode = contentRef.current;

    if (contentNode) {
      updateShadowOpacity();
      contentNode.addEventListener('scroll', updateShadowOpacity);
      window.addEventListener('resize', updateShadowOpacity);

      return () => {
        contentNode.removeEventListener('scroll', updateShadowOpacity);
        window.removeEventListener('resize', updateShadowOpacity);
      };
    }
  }, [updateShadowOpacity, contentRef]);
};
