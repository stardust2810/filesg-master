import 'sgds-govtech/css/sgds.css';

import { createGlobalStyle } from 'styled-components';

import MontserratFontSemiBold from '../assets/fonts/montserrat/montserrat-v23-latin-600.woff';
import MontserratFontSemiBold2 from '../assets/fonts/montserrat/montserrat-v23-latin-600.woff2';
import MontserratFont from '../assets/fonts/montserrat/montserrat-v23-latin-regular.woff';
import MontserratFont2 from '../assets/fonts/montserrat/montserrat-v23-latin-regular.woff2';
import NotoSansFontSemiBold from '../assets/fonts/noto_sans/noto-sans-v26-latin-600.woff';
import NotoSansFontSemiBold2 from '../assets/fonts/noto_sans/noto-sans-v26-latin-600.woff2';
import NotoSansFontBold from '../assets/fonts/noto_sans/noto-sans-v26-latin-700.woff';
import NotoSansFontBold2 from '../assets/fonts/noto_sans/noto-sans-v26-latin-700.woff2';
import NotoSansFont from '../assets/fonts/noto_sans/noto-sans-v26-latin-regular.woff';
import NotoSansFont2 from '../assets/fonts/noto_sans/noto-sans-v26-latin-regular.woff2';
import PoppinsFontSemiBold from '../assets/fonts/poppins/poppins-v19-latin-600.woff2';
import PoppinsFontSemiBold2 from '../assets/fonts/poppins/poppins-v19-latin-600.woff2';
import PoppinsFont from '../assets/fonts/poppins/poppins-v19-latin-regular.woff2';
import PoppinsFont2 from '../assets/fonts/poppins/poppins-v19-latin-regular.woff2';
import PoppinsFontMedium from '../assets/fonts/poppins/poppins-v20-latin-500.woff2';
import PoppinsFontMedium2 from '../assets/fonts/poppins/poppins-v20-latin-500.woff2';
import WorkSansFontMedium from '../assets/fonts/work_sans/work-sans-v17-latin-500.woff';
import WorkSansFontSemiBold from '../assets/fonts/work_sans/work-sans-v17-latin-600.woff';
import WorkSansFontMedium2 from '../assets/fonts/work_sans/work-sans-v17-latin-600.woff2';
import WorkSansFontSemiBold2 from '../assets/fonts/work_sans/work-sans-v17-latin-600.woff2';
import WorkSansFontBold from '../assets/fonts/work_sans/work-sans-v17-latin-700.woff';
import WorkSansFontBold2 from '../assets/fonts/work_sans/work-sans-v17-latin-700.woff2';
import WorkSansFont from '../assets/fonts/work_sans/work-sans-v17-latin-regular.woff';
import WorkSansFont2 from '../assets/fonts/work_sans/work-sans-v17-latin-regular.woff2';

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  @media print {
    body,
    html {
      width: 210mm; // Print in A4
      padding: 0 !important;
    }
  }

  html {
    font-size: 100%;
    overflow: hidden; // No scroll within iframe, all handled outside
    background-color: #EBEBEB;
  }

  body {
    margin: 0;
  }

  @font-face {
      font-family: 'Montserrat';
      src: local('Montserrat'), local('Montserrat'),
      url(${MontserratFont}) format('woff'),
        url(${MontserratFont2}) format('woff2');
      font-weight: 400;
      font-style: normal;
  }

  @font-face {
      font-family: 'Montserrat';
      src: local('Montserrat'), local('Montserrat'),
      url(${MontserratFontSemiBold}) format('woff'),
        url(${MontserratFontSemiBold2}) format('woff2');
      font-weight: 600;
      font-style: normal;
  }

  @font-face {
      font-family: 'Poppins';
      src: local('Poppins'), local('Poppins'),
        url(${PoppinsFont2}) format('woff2'),
        url(${PoppinsFont}) format('woff');
      font-weight: 400;
      font-style: normal;
  }

  @font-face {
      font-family: 'Poppins';
      src: local('Poppins'), local('Poppins'),
        url(${PoppinsFontMedium2}) format('woff2'),
        url(${PoppinsFontMedium}) format('woff');
      font-weight: 500;
      font-style: normal;
  }

  @font-face {
      font-family: 'Poppins';
      src: local('Poppins'), local('Poppins'),
        url(${PoppinsFontSemiBold}) format('woff'),
        url(${PoppinsFontSemiBold2}) format('woff2');
      font-weight: 600;
      font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'),
      url(${WorkSansFont}) format('woff'),
      url(${WorkSansFont2}) format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'),
      url(${WorkSansFontMedium}) format('woff'),
      url(${WorkSansFontMedium2}) format('woff2');
    font-weight: 500;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'),
      url(${WorkSansFontSemiBold}) format('woff'),
      url(${WorkSansFontSemiBold2}) format('woff2');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Work Sans';
    src: local('Work Sans'), local('Work Sans'),
      url(${WorkSansFontBold}) format('woff'),
      url(${WorkSansFontBold2}) format('woff2');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: local('Noto Sans'), local('Noto Sans'),
      url(${NotoSansFont}) format('woff'),
      url(${NotoSansFont2}) format('woff2');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: local('Noto Sans'), local('Noto Sans'),
      url(${NotoSansFontSemiBold}) format('woff'),
      url(${NotoSansFontSemiBold2}) format('woff2');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: 'Noto Sans';
    src: local('Noto Sans'), local('Noto Sans'),
      url(${NotoSansFontBold}) format('woff'),
      url(${NotoSansFontBold2}) format('woff2');
    font-weight: 700;
    font-style: normal;
  }
`;
