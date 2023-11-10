import { useCallback, useEffect, useState } from 'react';

interface Props {
  initialActive?: boolean;
  selector?: string;
}

export const useDisableContextMenu = ({ initialActive = true, selector }: Props = {}) => {
  const [active, setActive] = useState(initialActive);

  const handler = useCallback(
    (e: MouseEvent) => {
      if (!selector) {
        e.preventDefault();
        return;
      }

      const el = (e.target as HTMLElement).closest(selector);

      if (el) {
        e.preventDefault();
      }
    },
    [selector],
  );

  useEffect(() => {
    if (active) {
      document.addEventListener('contextmenu', handler);
    } else {
      document.removeEventListener('contextmenu', handler);
    }

    return () => document.removeEventListener('contextmenu', handler);
  }, [active, handler, selector]);

  return setActive;
};
