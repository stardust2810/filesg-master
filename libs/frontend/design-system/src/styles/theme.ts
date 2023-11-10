import { DefaultTheme } from 'styled-components';

import { FSG_DEVICES } from '../utils/constants';
import { FSGThemeType } from '../utils/typings';
import { Color } from './color';

const NOTO_SANS_WITH_FALLBACK = 'Noto Sans, Helvetica Neue, Helvetica, Arial, sans-serif';

export const FileSGThemes: DefaultTheme[] = [
  {
    name: FSGThemeType.THEME_1,
    FSG_COLOR: {
      DEFAULT: {
        DARKER: Color.GREY90,
        DEFAULT: Color.GREY80,
        LIGHT: Color.GREY60,
        LIGHTER: Color.GREY30,
        LIGHTEST: Color.GREY20,
      },
      PRIMARY: {
        DARKER: Color.PURPLE_DARKER,
        DEFAULT: Color.PURPLE_DEFAULT,
        LIGHT: Color.PURPLE_LIGHT,
        LIGHTER: Color.PURPLE_LIGHTER,
        LIGHTEST: Color.PURPLE_LIGHTEST,
      },
      SECONDARY: {
        DARKER: Color.BLUE_DARKER,
        DEFAULT: Color.BLUE_DEFAULT,
        LIGHT: Color.BLUE_LIGHT,
        LIGHTER: Color.BLUE_LIGHTER,
        LIGHTEST: Color.BLUE_LIGHTEST,
      },
      GREYS: {
        GREY90: Color.GREY90,
        GREY80: Color.GREY80,
        GREY70: Color.GREY70,
        GREY60: Color.GREY60,
        GREY50: Color.GREY50,
        GREY40: Color.GREY40,
        GREY30: Color.GREY30,
        GREY20: Color.GREY20,
        GREY10: Color.GREY10,
      },
      SYSTEM: {
        BLACK: Color.BLACK,
        WHITE: Color.WHITE,
        DISABLED: Color.GREY,
        LINK: Color.BLUE,
      },
      SUCCESS: {
        DARKER: Color.GREEN_DARKER,
        DEFAULT: Color.GREEN_DEFAULT,
        LIGHTER: Color.GREEN_LIGHTER,
        LIGHTEST: Color.GREEN_LIGHTEST,
      },
      DANGER: {
        DARKER: Color.RED_DARKER,
        DEFAULT: Color.RED_DEFAULT,
        LIGHTER: Color.RED_LIGHTER,
        LIGHTEST: Color.RED_LIGHTEST,
      },
      WARNING: {
        DARKER: Color.ORANGE_DARKER,
        DEFAULT: Color.ORANGE_DEFAULT,
        LIGHTER: Color.ORANGE_LIGHTER,
        LIGHTEST: Color.ORANGE_LIGHTEST,
      },
      INFO: {
        DARKER: Color.CYAN_DARKER,
        DEFAULT: Color.CYAN_DEFAULT,
        LIGHTER: Color.CYAN_LIGHTER,
        LIGHTEST: Color.CYAN_LIGHTEST,
      },
    },
    FSG_SPACING: {
      S2: '0.125rem',
      S4: '0.25rem',
      S6: '0.375rem',
      S8: '0.5rem',
      S12: '0.75rem',
      S16: '1rem',
      S20: '1.25rem',
      S24: '1.5rem',
      S28: '1.75rem',
      S32: '2rem',
      S40: '2.5rem',
      S48: '3rem',
      S56: '3.5rem',
      S64: '4rem',
      S72: '4.5rem',
      S80: '5rem',
      S96: '6rem',
      S112: '7rem',
      S128: '8rem',
    },
    FSG_BREAKPOINTS: {
      [FSG_DEVICES.SMALL_MOBILE]: '320px',
      [FSG_DEVICES.MOBILE]: '360px',
      [FSG_DEVICES.SMALL_TABLET]: '600px',
      [FSG_DEVICES.NORMAL_TABLET_PORTRAIT]: '768px',
      [FSG_DEVICES.NORMAL_TABLET_LANDSCAPE]: '1024px',
      [FSG_DEVICES.SMALL_DESKTOP]: '1280px',
      [FSG_DEVICES.NORMAL_DESKTOP]: '1440px',
      [FSG_DEVICES.LARGE_DESKTOP]: '1920px',
    },
    FSG_FONT: {
      DISPLAY1: {
        FONT_FAMILY: 'Work Sans',
        LINE_HEIGHT: '3.5rem',
        SIZE: '3rem',
      },
      DISPLAY2: {
        FONT_FAMILY: 'Work Sans',
        LINE_HEIGHT: '3rem',
        SIZE: '2.5rem',
      },
      H1: {
        FONT_FAMILY: 'Work Sans',
        LINE_HEIGHT: '2.5rem',
        SIZE: '2rem',
      },
      H2: {
        FONT_FAMILY: 'Work Sans',
        LINE_HEIGHT: '2.25rem',
        SIZE: '1.625rem',
      },
      H3: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '2rem',
        SIZE: '1.375rem',
      },
      H4: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      H5: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      H6: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      PARAGRAPH_LARGE: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '2.25rem',
        SIZE: '1.5rem',
      },
      PARAGRAPH: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      BODY: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      SMALL: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      SMALLER: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.125rem',
        SIZE: '0.75rem',
      },
      SMALL_CAPS: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      BUTTON_LARGE: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      BUTTON_NORMAL: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      BUTTON_SMALL: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      ICON_LARGE: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '2.75rem',
        SIZE: '2rem',
      },
      ICON_NORMAL: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.875rem',
        SIZE: '1.5rem',
      },
      ICON_SMALL: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.625rem',
        SIZE: '1.25rem',
      },
      ICON_MINI: {
        FONT_FAMILY: NOTO_SANS_WITH_FALLBACK,
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      H1_MOBILE: {
        FONT_FAMILY: 'Work Sans',
        LINE_HEIGHT: '2rem',
        SIZE: '1.5rem',
      },
      H2_MOBILE: {
        FONT_FAMILY: 'Work Sans',
        LINE_HEIGHT: '1.875rem',
        SIZE: '1.25rem',
      },
      H3_MOBILE: {
        FONT_FAMILY: 'Noto Sans',
        LINE_HEIGHT: '1.875rem',
        SIZE: '1.25rem',
      },
    },
  },
  {
    name: FSGThemeType.THEME_2,
    FSG_COLOR: {
      DEFAULT: {
        DARKER: Color.GREY90,
        DEFAULT: Color.GREY80,
        LIGHT: Color.GREY60,
        LIGHTER: Color.GREY30,
        LIGHTEST: Color.GREY20,
      },
      PRIMARY: {
        DARKER: Color.BLUE_DARKER,
        DEFAULT: Color.BLUE_DEFAULT,
        LIGHT: Color.BLUE_LIGHT,
        LIGHTER: Color.BLUE_LIGHTER,
        LIGHTEST: Color.BLUE_LIGHTEST,
      },
      SECONDARY: {
        DARKER: Color.PURPLE_DARKER,
        DEFAULT: Color.PURPLE_DEFAULT,
        LIGHT: Color.PURPLE_LIGHT,
        LIGHTER: Color.PURPLE_LIGHTER,
        LIGHTEST: Color.PURPLE_LIGHTEST,
      },
      GREYS: {
        GREY90: Color.GREY90,
        GREY80: Color.GREY80,
        GREY70: Color.GREY70,
        GREY60: Color.GREY60,
        GREY50: Color.GREY50,
        GREY40: Color.GREY40,
        GREY30: Color.GREY30,
        GREY20: Color.GREY20,
        GREY10: Color.GREY10,
      },
      SYSTEM: {
        BLACK: Color.BLACK,
        WHITE: Color.WHITE,
        DISABLED: Color.GREY,
        LINK: Color.BLUE,
      },
      SUCCESS: {
        DARKER: Color.GREEN_DARKER,
        DEFAULT: Color.GREEN_DEFAULT,
        LIGHTER: Color.GREEN_LIGHTER,
        LIGHTEST: Color.GREEN_LIGHTEST,
      },
      DANGER: {
        DARKER: Color.RED_DARKER,
        DEFAULT: Color.RED_DEFAULT,
        LIGHTER: Color.RED_LIGHTER,
        LIGHTEST: Color.RED_LIGHTEST,
      },
      WARNING: {
        DARKER: Color.ORANGE_DARKER,
        DEFAULT: Color.ORANGE_DEFAULT,
        LIGHTER: Color.ORANGE_LIGHTER,
        LIGHTEST: Color.ORANGE_LIGHTEST,
      },
      INFO: {
        DARKER: Color.CYAN_DARKER,
        DEFAULT: Color.CYAN_DEFAULT,
        LIGHTER: Color.CYAN_LIGHTER,
        LIGHTEST: Color.CYAN_LIGHTEST,
      },
    },
    FSG_SPACING: {
      S2: '0.125rem',
      S4: '0.25rem',
      S6: '0.375rem',
      S8: '0.5rem',
      S12: '0.75rem',
      S16: '1rem',
      S20: '1.25rem',
      S24: '1.5rem',
      S28: '1.75rem',
      S32: '2rem',
      S40: '2.5rem',
      S48: '3rem',
      S56: '3.5rem',
      S64: '4rem',
      S72: '4.5rem',
      S80: '5rem',
      S96: '6rem',
      S112: '7rem',
      S128: '8rem',
    },
    FSG_BREAKPOINTS: {
      [FSG_DEVICES.SMALL_MOBILE]: '320px',
      [FSG_DEVICES.MOBILE]: '360px',
      [FSG_DEVICES.SMALL_TABLET]: '600px',
      [FSG_DEVICES.NORMAL_TABLET_PORTRAIT]: '768px',
      [FSG_DEVICES.NORMAL_TABLET_LANDSCAPE]: '1024px',
      [FSG_DEVICES.SMALL_DESKTOP]: '1280px',
      [FSG_DEVICES.NORMAL_DESKTOP]: '1440px',
      [FSG_DEVICES.LARGE_DESKTOP]: '1920px',
    },
    FSG_FONT: {
      DISPLAY1: {
        FONT_FAMILY: 'Roboto',
        LINE_HEIGHT: '3.5rem',
        SIZE: '3rem',
      },
      DISPLAY2: {
        FONT_FAMILY: 'Roboto',
        LINE_HEIGHT: '2.5rem',
        SIZE: '3rem',
      },
      H1: {
        FONT_FAMILY: 'Roboto',
        LINE_HEIGHT: '2.75rem',
        SIZE: '2rem',
      },
      H2: {
        FONT_FAMILY: 'Roboto',
        LINE_HEIGHT: '2.25rem',
        SIZE: '1.625rem',
      },
      H3: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '2rem',
        SIZE: '1.375rem',
      },
      H4: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      H5: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      H6: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      PARAGRAPH_LARGE: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '2.25rem',
        SIZE: '1.5rem',
      },
      PARAGRAPH: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      BODY: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      SMALL: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      SMALLER: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.125rem',
        SIZE: '0.75rem',
      },
      SMALL_CAPS: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      BUTTON_LARGE: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      BUTTON_NORMAL: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      BUTTON_SMALL: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      ICON_LARGE: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
      ICON_NORMAL: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.5rem',
        SIZE: '1rem',
      },
      ICON_SMALL: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      ICON_MINI: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.25rem',
        SIZE: '0.875rem',
      },
      H1_MOBILE: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '2rem',
        SIZE: '1.5rem',
      },
      H2_MOBILE: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.875rem',
        SIZE: '1.25rem',
      },
      H3_MOBILE: {
        FONT_FAMILY: 'Swash',
        LINE_HEIGHT: '1.75rem',
        SIZE: '1.125rem',
      },
    },
  },
];
