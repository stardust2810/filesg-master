import { Color } from '../styles/color';
import { FSG_DEVICES } from '../utils/constants';

export interface FileSGDefaultTheme {
  FSG_FONT: FSGFont;
  FSG_COLOR: FSGColors;
  FSG_SPACING: FSGSpacings;
  FSG_BREAKPOINTS: { [key in FSG_DEVICES]: string };
}

export interface FSGFont {
  DISPLAY1: FSGFontSpecs;
  DISPLAY2: FSGFontSpecs;
  H1: FSGFontSpecs;
  H2: FSGFontSpecs;
  H3: FSGFontSpecs;
  H4: FSGFontSpecs;
  H5: FSGFontSpecs;
  H6: FSGFontSpecs;
  PARAGRAPH_LARGE: FSGFontSpecs;
  PARAGRAPH: FSGFontSpecs;
  BODY: FSGFontSpecs;
  SMALL: FSGFontSpecs;
  SMALLER: FSGFontSpecs;
  SMALL_CAPS: FSGFontSpecs;
  BUTTON_LARGE: FSGFontSpecs;
  BUTTON_NORMAL: FSGFontSpecs;
  BUTTON_SMALL: FSGFontSpecs;
  ICON_LARGE: FSGFontSpecs;
  ICON_NORMAL: FSGFontSpecs;
  ICON_SMALL: FSGFontSpecs;
  ICON_MINI: FSGFontSpecs;
  H1_MOBILE: FSGFontSpecs;
  H2_MOBILE: FSGFontSpecs;
  H3_MOBILE: FSGFontSpecs;
}

interface FSGFontSpecs {
  LINE_HEIGHT: string;
  FONT_FAMILY: string;
  SIZE: string;
}

interface FSGColors {
  DEFAULT: FSGColorsType1;
  PRIMARY: FSGColorsType1;
  SECONDARY: FSGColorsType1;
  GREYS: FSGColorsType3;
  SYSTEM: FSGColorsType4;
  SUCCESS: FSGColorsType2;
  WARNING: FSGColorsType2;
  DANGER: FSGColorsType2;
  INFO: FSGColorsType2;
}

interface FSGColorsType1 {
  DARKER: Color;
  DEFAULT: Color;
  LIGHT: Color;
  LIGHTER: Color;
  LIGHTEST: Color;
}
interface FSGColorsType2 {
  DARKER: Color;
  DEFAULT: Color;
  LIGHTER: Color;
  LIGHTEST: Color;
}
interface FSGColorsType3 {
  GREY90: Color;
  GREY80: Color;
  GREY70: Color;
  GREY60: Color;
  GREY50: Color;
  GREY40: Color;
  GREY30: Color;
  GREY20: Color;
  GREY10: Color;
}
interface FSGColorsType4 {
  BLACK: Color;
  WHITE: Color;
  DISABLED: Color;
  LINK: Color;
}

interface FSGSpacings {
  S2: string;
  S4: string;
  S6: string;
  S8: string;
  S12: string;
  S16: string;
  S20: string;
  S24: string;
  S28: string;
  S32: string;
  S40: string;
  S48: string;
  S56: string;
  S64: string;
  S72: string;
  S80: string;
  S96: string;
  S112: string;
  S128: string;
}

interface FSGBreakpoints {
  SMALL_MOBILE: string;
  MOBILE: string;
  SMALL_TABLET: string;
  NORMAL_TABLET_PORTRAIT: string;
  NORMAL_TABLET_LANDSCAPE: string;
  SMALL_DESKTOP: string;
  NORMAL_DESKTOP: string;
  LARGE_DESKTOP: string;
}
