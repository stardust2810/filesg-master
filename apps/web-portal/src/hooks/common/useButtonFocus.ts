import { useEffect, useRef } from 'react';

export const useButtonFocus = () => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
  }, []);

  return buttonRef;
};
