import React, { MouseEventHandler } from 'react';

import { IconLiterals } from '../typings/icon-literals';

export type StyleProps = {
  style?: React.CSSProperties;
  className?: string;
};

type BaseProps = {
  /**
   * Component's identifier
   */
  id?: string;
};

type TestProps = {
  /**
   * Component's test identifier
   */
  ['data-testid']?: string;
};

type AccessibilityProps = {
  /**
   * Component's aria label
   */
  ['aria-label']?: string;
  /**
   * Component's role
   */
  role?: string;
  /**
   * Component's aria hidden
   */
  ['aria-hidden']?: boolean;
};

export type FileSGProps = StyleProps & TestProps & AccessibilityProps & BaseProps;

type CtaLabelProps =
  | {
      label: string;
      icon?: IconLiterals;
      iconPosition?: 'START' | 'END';
      testLocatorName?: string;
      ariaLabel?: string;
    }
  | {
      label?: undefined;
      icon?: IconLiterals;
      iconPosition?: 'START' | 'END';
      testLocatorName: string;
      ariaLabel?: string;
    };

export type NavProps = {
  to: string;
  external?: boolean;
} & CtaLabelProps;

export type ActionProps = {
  onClick: MouseEventHandler;
} & CtaLabelProps;

export interface LinkProps {
  label: string;
  to: string;
  isExternal?: boolean;
}

export enum FSGThemeType {
  THEME_1 = 'basic',
  THEME_2 = 'light',
  THEME_3 = 'dark',
}

export type ButtonColorsTheme = 'PRIMARY' | 'SECONDARY' | 'DEFAULT';

export type ButtonDecoration = 'SOLID' | 'OUTLINE' | 'GHOST';

export type FILE_TYPE = 'oa' | 'pdf' | 'jpeg' | 'jpg' | 'png' | 'zip' | 'unknown';

export type FILE_ICON_VARIANT = 'solid' | 'outline' | 'mini';

export type Position = Partial<Pick<DOMRect, 'top' | 'bottom' | 'left' | 'right'>>;

export type ModalSize = 'SMALL' | 'MEDIUM';

export type SkeletonVariant = 'RECTANGLE' | 'TEXT' | 'CIRCLE';

export type BoldVariant = 'FULL' | 'SEMI' | 'MEDIUM';
