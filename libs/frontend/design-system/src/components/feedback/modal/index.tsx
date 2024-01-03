import { FocusTargetValueOrFalse } from 'focus-trap';
import FocusTrap from 'focus-trap-react';
import { forwardRef, KeyboardEventHandler, MouseEventHandler, Ref, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useTheme } from 'styled-components';

import { useKeyPress } from '../../../hooks/useKeyPress';
import { useLocationChange } from '../../../hooks/useLocationChange';
import { useShouldRender } from '../../../hooks/useShouldRender';
import { useWindowSize } from '../../../hooks/useWindowSize';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileSGProps, ModalSize, Position } from '../../../utils/typings';
import { IconButton } from '../../inputs/icon-button';
import { Backdrop } from '../backdrop';
import {
  StyledModalBody,
  StyledModalCard,
  StyledModalContainer,
  StyledModalContentContainer,
  StyledModalFooter,
  StyledModalHeader,
  StyledModalHeaderTitle,
} from './style';

interface PositionOrigin {
  vertical: 'top' | 'center' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

interface AnchorPadding {
  vertical?: number;
  horizontal?: number;
}

export type ModalPositionProps = {
  position?: Position;
  anchorEl?: HTMLElement;
  anchorOrigin?: PositionOrigin;
  anchorPadding?: AnchorPadding;
  autoAnchorPosition?: boolean;
  autoAnchorInitial?: 'left' | 'right';
  transformOrigin?: PositionOrigin;
};

// TODO: additional props to allow auto positioning based on container instead of window size
export type ModalProps = {
  size?: ModalSize;
  invisibleBackdrop?: boolean;
  onBackdropClick?: MouseEventHandler;
  onRouteChange?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  trapFocus?: boolean;
  initialFocus?: FocusTargetValueOrFalse;
  pauseFocus?: boolean;
  children: React.ReactNode | React.ReactNode[];
  useAnchorWidth?: boolean;
} & ModalPositionProps &
  FileSGProps;

const handleTransformOriginPositioning = (contentEl: HTMLDivElement, transformOrigin: PositionOrigin) => {
  const { width: contentWidth, height: contentHeight } = contentEl.getBoundingClientRect();
  const { vertical, horizontal } = transformOrigin;
  let originX, originY, translateX, translateY;

  switch (vertical) {
    case 'top':
      originY = 0;
      translateY = 0;
      break;
    case 'center':
      originY = contentHeight / 2;
      translateY = -originY;
      break;
    default:
      originY = contentHeight;
      translateY = -originY;
      break;
  }

  switch (horizontal) {
    case 'left':
      originX = 0;
      translateX = 0;
      break;
    case 'center':
      originX = contentWidth / 2;
      translateX = -originX;
      break;
    default:
      originX = contentWidth;
      translateX = -originX;
      break;
  }

  contentEl.style.transform = `translate(${translateX}px, ${translateY}px)`;
  contentEl.style.transformOrigin = `${originX}px ${originY}px`;
};

const handleAnchorOriginPositioning = (anchorRect: DOMRect, contentEl: HTMLDivElement, anchorOrigin: PositionOrigin) => {
  const { vertical, horizontal } = anchorOrigin;

  switch (vertical) {
    case 'top':
      contentEl.style.top = `${anchorRect.top}px`;
      break;
    case 'center':
      contentEl.style.top = `${anchorRect.top + anchorRect.height / 2}px`;
      break;
    default:
      contentEl.style.top = `${anchorRect.bottom}px`;
      break;
  }

  switch (horizontal) {
    case 'left':
      contentEl.style.left = `${anchorRect.left}px`;
      break;
    case 'center':
      contentEl.style.left = `${anchorRect.left + anchorRect.width / 2}px`;
      break;
    default:
      contentEl.style.left = `${anchorRect.right}px`;
      break;
  }
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      size = 'SMALL',
      invisibleBackdrop = false,
      onBackdropClick,
      onRouteChange,
      onKeyDown,
      style,
      className,
      trapFocus = true,
      pauseFocus = false,
      initialFocus = undefined,
      children = '',
      position,
      anchorEl,
      anchorOrigin,
      anchorPadding = {
        vertical: 0,
        horizontal: 0,
      },
      autoAnchorPosition = false,
      autoAnchorInitial = 'right',
      useAnchorWidth = false,
      transformOrigin,

      ...rest
    }: ModalProps,
    ref,
  ) => {
    const [modalRoot, setModalRoot] = useState<HTMLElement>();

    const contentRef = useRef<HTMLDivElement>(null);
    const windowSize = useWindowSize();
    useLocationChange(onRouteChange);

    if (!anchorPadding.vertical) {
      anchorPadding.vertical = 0;
    }

    if (!anchorPadding.horizontal) {
      anchorPadding.horizontal = 0;
    }

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------
    useEffect(() => {
      const root = document.getElementById('root');

      if (root) {
        setModalRoot(root);
      }
    }, []);

    const onEscKeyPress = (event) => {
      onBackdropClick?.(event);
    };

    useKeyPress('Escape', onEscKeyPress);
    // useLayoutEffect runs after react calculate the DOM but before the browser renders
    useLayoutEffect(() => {
      const handleAutoPositioning = (anchorRect: DOMRect, contentEl: HTMLDivElement) => {
        const { width: contentWidth, height: contentHeight } = contentEl.getBoundingClientRect();
        const { width: windowWidth, height: windowHeight } = windowSize;
        const { vertical: verticalAnchorPadding, horizontal: horizontalAnchorPadding } = anchorPadding;

        if (autoAnchorInitial === 'right' || anchorRect.left + horizontalAnchorPadding! + contentWidth > windowWidth) {
          contentEl.style.left = 'initial';
          contentEl.style.right = `${windowWidth - anchorRect.right}px`;
        } else {
          contentEl.style.right = 'initial';
          contentEl.style.left = `${anchorRect.left}px`;
        }

        if (useAnchorWidth) {
          contentEl.style.width = `${anchorRect.width}px`;
        }

        if (anchorRect.top + anchorRect.height + verticalAnchorPadding! + contentHeight > windowHeight) {
          contentEl.style.top = `initial`;
          contentEl.style.bottom = `${windowHeight - anchorRect.top}px`;
          contentEl.style.maxHeight = `${anchorRect.bottom - (anchorRect.height + 2 * verticalAnchorPadding!)}px`;
        } else {
          contentEl.style.top = `${anchorRect.top + anchorRect.height}px`;
          contentEl.style.bottom = `initial`;
          contentEl.style.maxHeight = `${windowHeight - (anchorRect.top + anchorRect.height + 2 * verticalAnchorPadding!)}px`;
        }
      };

      if (contentRef.current && !position && anchorEl) {
        const contentEl = contentRef.current;
        const anchorRect = anchorEl.getBoundingClientRect();

        const { vertical, horizontal } = anchorPadding;
        contentEl.style.margin = `${vertical}px ${horizontal}px`;

        if (autoAnchorPosition) {
          handleAutoPositioning(anchorRect, contentEl);
        } else {
          if (anchorOrigin) {
            handleAnchorOriginPositioning(anchorRect, contentEl, anchorOrigin);
          }

          if (transformOrigin) {
            handleTransformOriginPositioning(contentEl, transformOrigin);
          }
        }
      }
    }, [
      modalRoot,
      anchorEl,
      anchorOrigin,
      transformOrigin,
      autoAnchorPosition,
      position,
      windowSize,
      anchorPadding,
      autoAnchorInitial,
      useAnchorWidth,
    ]);

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    return modalRoot
      ? ReactDOM.createPortal(
          <StyledModalContainer
            style={style}
            data-testid={rest['data-testid'] ?? TEST_IDS.MODAL}
            className={`fsg-modal is-active ${className}`}
            onKeyDown={onKeyDown}
            role="dialog"
            aria-labelledby={TEST_IDS.MODAL_HEADER_TITLE}
            ref={ref}
          >
            <Backdrop invisible={invisibleBackdrop} onBackdropClick={onBackdropClick} data-testid={TEST_IDS.MODAL_BACKDROP} />
            <StyledModalContentContainer size={size} position={position} ref={contentRef}>
              <FocusTrap paused={pauseFocus} active={trapFocus} focusTrapOptions={{ allowOutsideClick: true, initialFocus }}>
                {children}
              </FocusTrap>
            </StyledModalContentContainer>
          </StyledModalContainer>,
          modalRoot,
        )
      : null;
  },
);

type ModalCardProps = {
  children: React.ReactNode;
} & FileSGProps;

const Card = forwardRef<HTMLDivElement, ModalCardProps>(({ className, children }: ModalCardProps, ref) => {
  return (
    <StyledModalCard className={`${className} fsg-modal-card`} ref={ref}>
      {children}
    </StyledModalCard>
  );
});

type ModalHeaderProps = {
  onCloseButtonClick?: MouseEventHandler;
  children: React.ReactNode;
  buttonRef?: Ref<HTMLButtonElement>;
} & FileSGProps;

const Header = ({ onCloseButtonClick, className = '', children, buttonRef }: ModalHeaderProps) => {
  const themeContext = useTheme();
  return (
    <StyledModalHeader className={className} data-testid={TEST_IDS.MODAL_HEADER}>
      {children}
      {onCloseButtonClick && (
        <IconButton
          data-testid={TEST_IDS.MODAL_CLOSE_BUTTON}
          icon="sgds-icon-cross"
          onClick={onCloseButtonClick}
          decoration="GHOST"
          size="SMALL"
          iconColor={themeContext.FSG_COLOR.GREYS.GREY80}
          ref={buttonRef}
          type="button"
          hasRippleAnimation={false}
          aria-label="Close modal"
        />
      )}
    </StyledModalHeader>
  );
};

type ModalTitleProps = { children: string } & FileSGProps;

const Title = ({ className = '', children, ...rest }: ModalTitleProps) => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  return (
    <StyledModalHeaderTitle
      className={className}
      variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'}
      bold="FULL"
      data-testid={TEST_IDS.MODAL_HEADER_TITLE}
      id={TEST_IDS.MODAL_HEADER_TITLE}
      aria-live="polite"
      {...rest}
    >
      {children}
    </StyledModalHeaderTitle>
  );
};

type ModalBodyProps = { children: React.ReactNode } & FileSGProps;

const Body = ({ className = '', style, children }: ModalBodyProps) => {
  return (
    <StyledModalBody className={className} style={style} data-testid={TEST_IDS.MODAL_BODY}>
      {children}
    </StyledModalBody>
  );
};

type ModalFooterProps = { children: React.ReactNode } & FileSGProps;

const Footer = ({ className = '', style, children }: ModalFooterProps) => {
  return (
    <StyledModalFooter className={className} style={style} data-testid={TEST_IDS.MODAL_FOOTER}>
      {children}
    </StyledModalFooter>
  );
};

const ModalNamespace = Object.assign(Modal, { Card, Header, Title, Body, Footer });
export { ModalNamespace as Modal };
