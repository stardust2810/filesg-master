import { useEffect } from 'react';

export function useKeyPress(targetKey: string, action: (...args: any) => void, disabled = false) {
  useEffect(() => {
    function keyDownHandler(event: KeyboardEvent) {
      if (event.key === targetKey && !disabled) {
        action(event);
      }
    }

    window.addEventListener('keydown', keyDownHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', keyDownHandler);
    };
  }, [action, disabled, targetKey]);
}
