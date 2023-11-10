import './icon/index.css';

import { createGlobalStyle } from 'styled-components';

import fsgFontSvg from '../assets/fonts/fsg/fsg.svg';
import fsgFont2 from '../assets/fonts/fsg/fsg.ttf';
import fsgFont from '../assets/fonts/fsg/fsg.woff';
import LatoFont from '../assets/fonts/lato/lato-v20-latin-regular.woff';
import LatoFont2 from '../assets/fonts/lato/lato-v20-latin-regular.woff2';
import NotoSansFontSemiBold from '../assets/fonts/noto_sans/noto-sans-v26-latin-600.woff';
import NotoSansFontSemiBold2 from '../assets/fonts/noto_sans/noto-sans-v26-latin-600.woff2';
import NotoSansFontBold from '../assets/fonts/noto_sans/noto-sans-v26-latin-700.woff';
import NotoSansFontBold2 from '../assets/fonts/noto_sans/noto-sans-v26-latin-700.woff2';
import NotoSansFont from '../assets/fonts/noto_sans/noto-sans-v26-latin-regular.woff';
import NotoSansFont2 from '../assets/fonts/noto_sans/noto-sans-v26-latin-regular.woff2';
import OpenSansFont from '../assets/fonts/open_sans/open-sans-v27-latin-regular.woff';
import OpenSansFont2 from '../assets/fonts/open_sans/open-sans-v27-latin-regular.woff2';
import RobotoFont from '../assets/fonts/roboto/roboto-v27-latin-regular.woff';
import RobotoFont2 from '../assets/fonts/roboto/roboto-v27-latin-regular.woff2';
import RobotoFontMedium from '../assets/fonts/roboto/roboto-v30-latin-500.woff';
import RobotoFontMedium2 from '../assets/fonts/roboto/roboto-v30-latin-500.woff2';
import RobotoFontBold from '../assets/fonts/roboto/roboto-v30-latin-700.woff';
import RobotoFontBold2 from '../assets/fonts/roboto/roboto-v30-latin-700.woff2';
import RobotoFontHeavy from '../assets/fonts/roboto/roboto-v30-latin-900.woff';
import RobotoFontHeavy2 from '../assets/fonts/roboto/roboto-v30-latin-900.woff2';
import SwashFont from '../assets/fonts/swash/sansita-swashed-v5-latin-regular.woff';
import SwashFont2 from '../assets/fonts/swash/sansita-swashed-v5-latin-regular.woff2';
import WorkSansFontMedium from '../assets/fonts/work_sans/work-sans-v17-latin-500.woff';
import WorkSansFontSemiBold from '../assets/fonts/work_sans/work-sans-v17-latin-600.woff';
import WorkSansFontMedium2 from '../assets/fonts/work_sans/work-sans-v17-latin-600.woff2';
import WorkSansFontSemiBold2 from '../assets/fonts/work_sans/work-sans-v17-latin-600.woff2';
import WorkSansFontBold from '../assets/fonts/work_sans/work-sans-v17-latin-700.woff';
import WorkSansFontBold2 from '../assets/fonts/work_sans/work-sans-v17-latin-700.woff2';
import WorkSansFont from '../assets/fonts/work_sans/work-sans-v17-latin-regular.woff';
import WorkSansFont2 from '../assets/fonts/work_sans/work-sans-v17-latin-regular.woff2';
import { Z_INDEX } from '../utils/constants';
import { Color } from './color';

// NOTE: to allow auto formatting
const styled = { createGlobalStyle };

export const GlobalStyles = styled.createGlobalStyle`
  #root {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  html {
    font-size: 100%;
    min-width: auto;
    box-sizing: border-box;
    text-size-adjust: 100%;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }
  *,
  :after,
  :before {
    box-sizing: inherit;
  }
  body {
    line-height: initial;
    color: #474747;
  }

  .is-hidden {
    display: none !important;
  }

  button,
  input,
  select,
  textarea {
    margin: 0;
  }

  /* Remove default styling of button component */
  button {
    background: none;
    color: inherit;
    border: none;
    padding: 0;
    font: inherit;
    cursor: pointer;
    outline: inherit;
  }
  a {
    text-decoration: none;
    cursor: pointer;
  }
  ul {
    list-style: none;
  }

  li {
    font-size: 1.125rem;
  }

  blockquote,
  body,
  dd,
  dl,
  dt,
  fieldset,
  figure,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  hr,
  html,
  iframe,
  legend,
  li,
  ol,
  p,
  pre,
  textarea,
  ul {
    margin: 0;
    padding: 0;
  }
  /* Remove default styling of h1 - h6 */
  /* Remove default margin */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    display: inline;
    letter-spacing: normal;
  }

  audio,
  embed,
  img,
  object,
  video {
    max-width: 100%;
  }

  table {
    border-spacing: 0;
    border-collapse: collapse;
  }

  .fsg-modal {
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    align-items: center;
    display: none;
    justify-content: center;
    overflow: hidden;
    position: fixed;
    z-index: ${Z_INDEX.MODAL};
  }

  .fsg-modal.is-active {
    display: flex;
  }

  &:focus {
    outline: solid 2px ${Color.FOCUS_RING_PRIMARY};
    outline-offset: 0;
  }

  .scroll-lock {
    overflow: hidden;
  }

  .fsg-shadow {
    position: absolute;
    top: 0;
    z-index: 100;
    height: 100%;
    width: 2rem;
  }

  .fsg-shadow-left {
    left: 0;
    opacity: 0;
    background: linear-gradient(to right, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0));
  }

  .fsg-shadow-right {
    right: 0;
    opacity: 0;
    background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.6));
  }

  a {
    color: ${({ theme }) => theme.FSG_COLOR.PRIMARY.DEFAULT};
    &:hover,
    &:active {
      ${({ theme }) => {
        return `color: ${theme.FSG_COLOR.PRIMARY.DARKER}`;
      }}
    }
  }

  // remove sgds.css line-height
  li {
    line-height: normal;
  }

  .sgds-modal {
    z-index: ${Z_INDEX.MODAL};
  }

  // width for sm modal
  .sgds-modal.is-small .sgds-modal-card {
    width: 432px;
  }

  // width for md modal
  .sgds-modal .sgds-modal-card {
    width: 660px;
  }

  .sgds-modal-card {
    max-width: calc(100vw - (${({ theme }) => theme.FSG_SPACING.S32}));
    max-height: calc(100vh - (2 * ${({ theme }) => theme.FSG_SPACING.S40}));
  }

  input:hover:disabled {
    cursor: not-allowed;
  }

  @font-face {
    font-family: 'fsg-icons';
    src: url(${fsgFont}) format('woff2'), url(${fsgFont2}) format('truetype'), url(${fsgFontSvg}) format('svg');
    font-weight: normal;
    font-style: normal;
  }

  @font-face {
    font-family: 'Roboto';
    src: local('Roboto'), local('Roboto'), url(${RobotoFont}) format('woff2'), url(${RobotoFont2}) format('woff');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 500;
    src: local(''), url(${RobotoFontMedium}) format('woff2'), url(${RobotoFontMedium2}) format('woff');
  }

  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 700;
    src: local(''), url(${RobotoFontBold}) format('woff2'), url(${RobotoFontBold2}) format('woff');
  }

  @font-face {
    font-family: 'Roboto';
    font-style: normal;
    font-weight: 900;
    src: local(''), url(${RobotoFontHeavy}) format('woff2'), url(${RobotoFontHeavy2}) format('woff');
  }

  @font-face {
    font-family: 'Lato';
    src: local('Lato'), local('Lato'), url(${LatoFont}) format('woff2'), url(${LatoFont2}) format('woff');
    font-weight: 200;
    font-style: normal;
  }

  @font-face {
    font-family: 'Swash';
    src: local('Swash'), local('Swash'), url(${SwashFont}) format('woff2'), url(${SwashFont2}) format('woff');
    font-weight: 200;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'), url(${WorkSansFont}) format('woff'), url(${WorkSansFont2}) format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'), url(${WorkSansFontMedium}) format('woff'), url(${WorkSansFontMedium2}) format('woff2');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'), url(${WorkSansFontSemiBold}) format('woff'), url(${WorkSansFontSemiBold2}) format('woff2');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'), url(${WorkSansFontBold}) format('woff'), url(${WorkSansFontBold2}) format('woff2');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: local('Noto Sans'), local('Noto Sans'), url(${NotoSansFont}) format('woff'), url(${NotoSansFont2}) format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: local('Noto Sans'), local('Noto Sans'), url(${NotoSansFontSemiBold}) format('woff'), url(${NotoSansFontSemiBold2}) format('woff2');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: local('Noto Sans'), local('Noto Sans'), url(${NotoSansFontBold}) format('woff'), url(${NotoSansFontBold2}) format('woff2');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Open Sans';
    src: local('Open Sans'), local('Open Sans'), url(${OpenSansFont2}) format('woff2'), url(${OpenSansFont}) format('woff');
    font-weight: 400;
    font-style: normal;
  }
`;
