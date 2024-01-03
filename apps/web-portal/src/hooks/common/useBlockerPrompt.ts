import { History } from 'history';
import { useCallback, useContext, useRef } from 'react';
import { Navigator } from 'react-router';
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

type ExtendNavigator = Navigator & Pick<History, 'block' | 'location'>;

/**
 * After the release of React-Router v6.0.0-beta.7, usePrompt and useBlocker has been removed.
 * Hence, adding it into our own project until they revisit these hooks/similar in the future.
 * Source: https://stackoverflow.com/questions/71572678/react-router-v-6-useprompt-typescript/71587163#71587163
 *
 * Additional notes:
 * 1. For warning modal pop up when clicking <a> anchor instead of <Link />, the message could not be customised.
 *    https://stackoverflow.com/questions/40570164/how-to-customize-the-message-changes-you-made-may-not-be-saved-for-window-onb
 */
export function useBlockerPrompt(message: string, onOkButtonClick?: () => void, onCancelButtonClick?: () => void) {
  const { navigator } = useContext(NavigationContext);
  const unblockRef = useRef<() => void>();

  const block = useCallback(() => {
    const unblock = (navigator as ExtendNavigator).block((tx) => {
      if (window.confirm(message)) {
        unblock();
        tx.retry();
        onOkButtonClick?.();
      } else {
        onCancelButtonClick?.();
      }
    });

    unblockRef.current = unblock;
  }, [message, navigator, onCancelButtonClick, onOkButtonClick]);

  const unblock = useCallback(() => {
    unblockRef.current?.();
  }, [unblockRef]);

  return { block, unblock };
}
