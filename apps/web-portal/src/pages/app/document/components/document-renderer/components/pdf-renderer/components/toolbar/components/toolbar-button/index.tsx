import { Color, Icon, IconLiterals } from '@filesg/design-system';
import React, { ButtonHTMLAttributes } from 'react';

import { StyledButton } from './style';

export enum TEST_ID {
  BUTTON = 'toolbar-button',
  ICON = 'toolbar-button-icon',
}

export enum BUTTON_TYPE {
  PAGE_UP = 'pageUp',
  PAGE_DOWN = 'pageDown',
  ZOOM_IN = 'zoomIn',
  ZOOM_OUT = 'zoomOut',
  FULL_SCREEN = 'fullScreen',
}

export interface Props {
  type: BUTTON_TYPE;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>['onClick'];
  disabled?: ButtonHTMLAttributes<HTMLButtonElement>['disabled'];
}

type ToolbarIconLiterals = Extract<
  IconLiterals,
  'sgds-icon-chevron-up' | 'sgds-icon-chevron-down' | 'sgds-icon-zoom-in' | 'sgds-icon-zoom-out' | 'sgds-icon-expand-alt'
>;

export function ToolbarButton({ type, onClick, disabled = false }: Props) {
  let ariaLabel = '';
  function buttonTypeMapper(type: BUTTON_TYPE): ToolbarIconLiterals | undefined {
    switch (type) {
      case BUTTON_TYPE.PAGE_UP:
        ariaLabel = 'Page up';
        return 'sgds-icon-chevron-up';
      case BUTTON_TYPE.PAGE_DOWN:
        ariaLabel = 'Page down';
        return 'sgds-icon-chevron-down';
      case BUTTON_TYPE.ZOOM_IN:
        ariaLabel = 'Zoom in';
        return 'sgds-icon-zoom-in';
      case BUTTON_TYPE.ZOOM_OUT:
        ariaLabel = 'Zoom out';
        return 'sgds-icon-zoom-out';
      case BUTTON_TYPE.FULL_SCREEN:
        ariaLabel = 'Full screen';
        return 'sgds-icon-expand-alt';
      default:
        return;
    }
  }

  const iconString = buttonTypeMapper(type);

  return iconString ? (
    <StyledButton data-testid={`${TEST_ID.BUTTON}-${type}`} onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      <Icon icon={iconString} color={disabled ? Color.GREY50 : Color.WHITE} size="ICON_NORMAL" data-testid={`${TEST_ID.ICON}-${type}`} />
    </StyledButton>
  ) : null;
}
