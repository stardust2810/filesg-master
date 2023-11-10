import { useEffect, useState } from 'react';
import { UseInfiniteQueryResult } from 'react-query';
import { ScrollEventData, Size } from 'react-virtualized';

import { ItemViewType } from '../../typings';

interface Props<T> {
  infiniteQueryResult: UseInfiniteQueryResult<T>;
  itemHeightInPx?: number;
}

const ROW_HEIGHTS = {
  [ItemViewType.GRID]: 192,
  [ItemViewType.LIST]: 60,
};

// FIXME: Not used, delete?
/**
 * Custom hook that manage the locking and syncing of parent div and react-virtualized scrollbars
 */
export const useVirtualizedListParentScrollSync = <T>({
  infiniteQueryResult,
  itemHeightInPx = ROW_HEIGHTS[ItemViewType.LIST],
}: Props<T>) => {
  const [lockScroll, setLockScroll] = useState(true);
  const [totalItemLength, setTotalItemLength] = useState(0);
  const [loaderHeight, setLoaderHeight] = useState(0);
  const [sync, setSync] = useState(false);
  const [highestInnerScrollTop, setHighestInnerScrollTop] = useState(0);

  const { isLoading: isFilesLoading, data: infiniteData, isFetchingNextPage, hasNextPage } = infiniteQueryResult;

  const htmlNode = document.documentElement;

  // ---------------------------------------------------------------------------
  // Effect Hooks
  // ---------------------------------------------------------------------------
  // Based on lockScroll state, determine whether to lock parent div's scrollbar
  useEffect(() => {
    if (!lockScroll) {
      htmlNode.classList.remove('noscroll');
    } else {
      htmlNode.classList.add('noscroll');
    }

    return () => {
      htmlNode.classList.remove('noscroll');
    };
  }, [htmlNode, lockScroll]);

  // Loop through the queried pages, determine its current length and determine whether end of query reached
  useEffect(() => {
    if (infiniteData?.pages) {
      let total = 0;
      infiniteData.pages.forEach((page) => {
        total += (page as any).items.length;
      });
      setTotalItemLength(total);
    }
  }, [infiniteData, isFetchingNextPage, isFilesLoading]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const onScroll = ({ clientHeight, scrollHeight, scrollTop }: ScrollEventData) => {
    const scrolledToEnd = scrollHeight - clientHeight === scrollTop;

    // If reaches internal scroll end and already queried last page,
    // unlock the parent scroll and allow sync between internal and parent div scroll
    // else just lock the parent div scroll
    if (!isFilesLoading && !isFetchingNextPage) {
      if (scrolledToEnd && !hasNextPage) {
        if (lockScroll && !sync) {
          setLockScroll(false);
          setSync(true);
          setHighestInnerScrollTop(scrollTop);
        }
      } else {
        if (!lockScroll) {
          setLockScroll(true);
        }
      }
    }

    // Calculation for scroll sync
    if (sync) {
      const parentDiv = htmlNode;
      const difference = ((highestInnerScrollTop - scrollTop) / scrollHeight) * parentDiv.scrollHeight * 0.5;

      parentDiv.scrollTop = parentDiv.scrollTop - difference;

      // Set sync back to false when parentDiv reaches top of scroll (means footer is out of view)
      if (parentDiv.scrollTop === 0) {
        setSync(false);
      }
    }
  };

  // To cater for queried items length less than loader's height (results in no internal scroll bar)
  const onResize = (size: Size) => {
    const totalItemsLengthInPixel = totalItemLength * itemHeightInPx;

    if (!isFilesLoading && !isFetchingNextPage && !hasNextPage) {
      if (totalItemsLengthInPixel <= loaderHeight) {
        setLockScroll(false);
      } else {
        setLockScroll(true);
      }
    }
    setLoaderHeight(size.height);
  };

  return { onScroll, onResize };
};
