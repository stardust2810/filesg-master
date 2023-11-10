import { useMemo } from 'react';

export function useRemToPx(itemSizeInRem: number): number {
  const itemSizeInPx = useMemo(() => {
    const rootFontSize = getComputedStyle(document.documentElement).fontSize;

    if (rootFontSize) {
      return parseInt(rootFontSize) * itemSizeInRem;
    }

    return 16 * itemSizeInRem
  }, [itemSizeInRem]);

  return itemSizeInPx;
}
