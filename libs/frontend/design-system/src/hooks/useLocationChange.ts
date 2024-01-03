import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { usePrevious } from './usePrevious';

export const useLocationChange = (action?: () => void) => {
  const location = useLocation();
  const prevLocation = usePrevious(location.pathname);

  useEffect(() => {
    if (prevLocation && prevLocation !== location.pathname && action) {
      action();
    }
  }, [location.pathname, prevLocation, action]);
};
