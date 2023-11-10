import { createFocusTrap, FocusTrap } from 'focus-trap';
import { RefObject, useEffect, useRef } from 'react';

interface Props {
  refs: RefObject<HTMLDivElement>[];
}

export const useFocusTrap = ({ refs }: Props) => {
  const currentContainerRef = useRef<HTMLDivElement | null>(null);
  const prevContainerRef = useRef<HTMLDivElement | null>(null);
  const focusTrapRef = useRef<FocusTrap | null>(null);

  // every render
  useEffect(() => {
    const modalElements: (HTMLDivElement | null)[] = refs.map((ref) => ref.current);

    for (const element of modalElements) {
      if (element) {
        currentContainerRef.current = element;
        break;
      }
    }

    if (currentContainerRef.current) {
      if (!focusTrapRef.current) {
        prevContainerRef.current = currentContainerRef.current;

        focusTrapRef.current = createFocusTrap([currentContainerRef.current], {
          allowOutsideClick: true,
          fallbackFocus: currentContainerRef.current,
        });
        focusTrapRef.current.activate();
      } else if (prevContainerRef.current !== currentContainerRef.current) {
        prevContainerRef.current = currentContainerRef.current;

        focusTrapRef.current?.updateContainerElements([currentContainerRef.current]);
      }
    }

    return () => {
      focusTrapRef.current?.deactivate();
    };
  });
};
