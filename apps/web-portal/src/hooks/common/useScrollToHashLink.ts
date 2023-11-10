import { useCallback, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface HashElementId {
  hash: string;
  elementId: string;
}

/**
 *
 * @param hashMap - a mapping between hash and id of element to scroll into
 * @returns currentHash
 */
export const useScrollToHashLink = (hashMap?: HashElementId[], delay = 0) => {
  const { pathname, hash, key } = useLocation();

  const getElementId = useCallback(
    (hash: string) => {
      if (!hashMap) {
        // assume id is the hash if no hashmap is provided
        return hash.replace('#', '');
      }
      const hashElementId = hashMap.find((item) => item.hash === hash);

      // return empty string if hash not found in hashmap provided
      return hashElementId?.elementId ?? '';
    },
    [hashMap],
  );

  useEffect(() => {
    let timer;
    if (!hash || (hash && hash === '')) {
      window.scrollTo(0, 0);
    } else {
      timer = setTimeout(() => {
        const elementId = getElementId(hash);
        const element = document.getElementById(elementId);
        if (element) {
          // If need different behaviour or block, add scrollOpts into params
          // Note smooth scroll is only support in safari starting from 15.4
          // https://caniuse.com/?search=scroll-behavior
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, delay);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, hash, key, getElementId, delay]);

  // return current hash to allow component to check which hash is active (if applicable)
  return hash;
};
