import styled from 'styled-components';

import { Props } from '.';

type StyledProps = Pick<Props, 'ellipsisLine' | 'isEllipsis' | 'variant' | 'bold' | 'noWrap' | 'overrideFontFamily' | 'underline'>;

export const StyledSpan = styled.span<StyledProps>`
  white-space: ${({ noWrap }) => (noWrap ? 'nowrap' : 'initial')};
  text-align: left;
  /* display: block; */

  ${({ ellipsisLine }) =>
    ellipsisLine &&
    `
    word-break: break-all;
    display: -webkit-box;
    -webkit-line-clamp: ${ellipsisLine};
  `}

  ${({ isEllipsis }) =>
    isEllipsis &&
    `
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
  `}

  font-family: ${({ variant, theme, overrideFontFamily }) => {
    return overrideFontFamily ? overrideFontFamily : theme.FSG_FONT[variant].FONT_FAMILY;
  }};

  font-size: ${({ variant, theme }) => {
    return theme.FSG_FONT[variant].SIZE;
  }};

  line-height: ${({ variant, theme }) => {
    return theme.FSG_FONT[variant].LINE_HEIGHT;
  }};

  font-weight: ${({ bold }) => {
    if (bold === 'FULL') {
      return 700;
    }

    if (bold === 'SEMI') {
      return 600;
    }

    if (bold === 'MEDIUM') {
      return 500;
    }

    return 400;
  }};

  color: ${({ color }) => {
    return color;
  }};

  text-decoration: ${({ underline }) => {
    return underline ? 'underline' : '';
  }};
`;
