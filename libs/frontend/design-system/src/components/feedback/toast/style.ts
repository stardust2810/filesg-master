import { ToastContainer } from 'react-toastify';
import styled from 'styled-components';

import { HEX_COLOR_OPACITY, Z_INDEX } from '../../../utils/constants';
import { Icon } from '../../data-display/icon';
import { IconButton } from '../../inputs/icon-button';

export const StyledIconButton = styled(IconButton)`
  background-color: transparent;

  &:hover {
    background-color: ${'#FFFFFF' + HEX_COLOR_OPACITY.P40};
  }
`;

export const StyledToastContainer = styled(ToastContainer)`
  &.Toastify__toast-container {
    z-index: ${Z_INDEX.TOAST};
    max-width: 480px;
    width: 100%;
    padding: 0;

    gap: ${({ theme }) => theme.FSG_SPACING.S16};

    @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET}) {
      margin-top: ${({ theme }) => theme.FSG_SPACING.S24};
    }
  }

  &.Toastify__toast-container--top-center {
    top: 0;
  }

  .Toastify__toast {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S8};
    padding: ${({ theme }) => theme.FSG_SPACING.S12};

    @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
      margin: ${({ theme }) => theme.FSG_SPACING.S8};
    }
  }

  .Toastify__toast-body {
    display: flex;
    gap: ${({ theme }) => theme.FSG_SPACING.S16};

    font-family: ${({ theme }) => theme.FSG_FONT.H5.FONT_FAMILY};
    font-size: ${({ theme }) => theme.FSG_FONT.H5.SIZE};
    line-height: ${({ theme }) => theme.FSG_FONT.H5.LINE_HEIGHT};
    font-weight: 400;

    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
    padding: ${({ theme }) => theme.FSG_SPACING.S4};
    padding-right: 0;
    align-items: flex-start;
  }

  .Toastify__toast-theme--light {
    display: flex;
    gap: ${({ theme }) => theme.FSG_SPACING.S16};
    border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  }

  .Toastify__toast--success {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.SUCCESS.DEFAULT;
    }};
    background-color: ${({ theme }) => {
      return theme.FSG_COLOR.SUCCESS.LIGHTEST;
    }};
  }

  .Toastify__toast--error {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.DANGER.DEFAULT;
    }};
    background-color: ${({ theme }) => {
      return theme.FSG_COLOR.DANGER.LIGHTEST;
    }};
  }

  .Toastify__toast--warning {
    border: ${({ theme }) => {
      return '1px solid ' + theme.FSG_COLOR.WARNING.DEFAULT;
    }};
    background-color: ${({ theme }) => {
      return theme.FSG_COLOR.WARNING.LIGHTEST;
    }};
  }

  .Toastify__toast-icon {
    width: ${({ theme }) => theme.FSG_SPACING.S24};
    margin: 0;
  }
`;

export const StyledLoaderIcon = styled(Icon)`
  animation: rotation 2s infinite linear;

  @keyframes rotation {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(359deg);
    }
  }
`;
