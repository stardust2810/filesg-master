import 'react-toastify/dist/ReactToastify.css';

import { isValidElement, ReactElement } from 'react';
import { Id, toast, ToastOptions, ToastPosition, UpdateOptions } from 'react-toastify';

import { Color } from '../../../styles/color';
import { FileSGProps } from '../../../utils/typings';
import { Icon } from '../../data-display/icon';
import { Typography } from '../../data-display/typography';
import { StyledIconButton, StyledLoaderIcon, StyledToastContainer } from './style';
type ToastType = 'success' | 'warning' | 'error' | 'loading' | 'progress';

export type Props = {
  position?: ToastPosition;
  autoClose?: number | false;
  newestOnTop?: boolean;
  hasExitCross?: boolean;
} & FileSGProps;

const defaultOptions: ToastOptions = {
  position: 'top-center',
  autoClose: 2000,
  closeOnClick: false,
  pauseOnHover: true,
};

type ToastMessageAdvanced = {
  title: string;
  description: string;
};

const successIcon = <Icon icon="fsg-icon-circle-check-solid" color={Color.GREEN_DEFAULT} />;
const warningIcon = <Icon icon="fsg-icon-triangle-warning-solid" color={Color.ORANGE_DEFAULT} />;
const errorIcon = <Icon icon="fsg-icon-circle-cross-solid" color={Color.RED_DEFAULT} />;
const loadingIcon = <StyledLoaderIcon icon="fsg-icon-loading-solid" color={Color.PURPLE_LIGHTER} />;

export const sendToastMessage = (message: string | ToastMessageAdvanced | ReactElement, type: ToastType, options?: ToastOptions) => {
  const applyOptions = { ...defaultOptions, hideProgressBar: true, ...options };

  const formattedMsg = typeof message === 'string' || isValidElement(message) ? message : formatAdvancedMessge(message);

  switch (type) {
    case 'success':
      return toast.success(formattedMsg, { ...applyOptions, icon: successIcon });
    case 'warning':
      return toast.warning(formattedMsg, { ...applyOptions, icon: warningIcon });
    case 'error':
      return toast.error(formattedMsg, { ...applyOptions, icon: errorIcon });
    case 'loading':
      return toast.loading(formattedMsg, {
        ...applyOptions,
        icon: loadingIcon,
      });
    case 'progress':
      return toast.loading(formattedMsg, {
        bodyStyle: { color: Color.WHITE },
        style: {
          backgroundColor: Color.GREY80,
          boxShadow: `0px -24px 0px -16px inset ${Color.GREY60}`,
          padding: '0.75rem',
          paddingBottom: '1.25rem',
        },
        ...applyOptions,
        icon: loadingIcon,
        hideProgressBar: false,
      });
  }
};

const formatAdvancedMessge = (message: ToastMessageAdvanced) => {
  return (
    <>
      <Typography variant="BODY" bold="FULL">
        {message.title}
      </Typography>
      <br />
      <Typography variant="BODY">{message.description}</Typography>
    </>
  );
};

export const updateToastMessage = (id: Id, type: ToastType, options: UpdateOptions) => {
  // Set style, bodyStyle & closeButton to undefined to overwrite toast.loading options
  switch (type) {
    case 'success': {
      return toast.update(id, {
        type,
        style: undefined,
        bodyStyle: undefined,
        closeButton: undefined,
        progress: undefined, // To reset progress, for autoClose
        ...options,
        icon: successIcon,
        isLoading: false, // When updating from toast.loading, isLoading: false is required to autoClose
      });
    }

    case 'error': {
      return toast.update(id, {
        type,
        style: undefined,
        bodyStyle: undefined,
        closeButton: undefined,
        ...options,
        icon: errorIcon,
        isLoading: false, // When updating from toast.loading, isLoading: false is required to autoClose
      });
    }

    case 'loading':
    case 'progress': {
      return toast.update(id, {
        ...options,
        icon: loadingIcon,
      });
    }
  }
};

export const sendPromiseToastMessage = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  successMessage: string,
  pendingMessage: string,
  errorMessage: string,
  options?: ToastOptions,
) => {
  const applyOptions = { ...defaultOptions, ...options };

  toast.promise(
    promise,
    {
      pending: {
        render: pendingMessage,
        icon: loadingIcon,
      },
      success: {
        render: successMessage,
        icon: successIcon,
        style: null,
        bodyStyle: null,
      },
      error: {
        render: errorMessage,
        icon: errorIcon,
        style: null,
        bodyStyle: null,
      },
    },
    applyOptions,
  );
};

export const Toast = ({ position = 'top-center', autoClose = 5000, newestOnTop = false, hasExitCross = true }: Props) => {
  return (
    <StyledToastContainer
      role="alert" // Default by library
      position={position}
      autoClose={autoClose}
      hideProgressBar={true}
      newestOnTop={newestOnTop}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      closeButton={
        hasExitCross
          ? ({ closeToast }) => (
              <StyledIconButton
                decoration="GHOST"
                color="DEFAULT"
                icon="sgds-icon-cross"
                size="SMALL"
                onClick={closeToast}
                aria-label="Close Notification"
              />
            )
          : false
      }
    />
  );
};
