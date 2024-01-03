import { Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledOl = styled.ol`
  list-style-type: none;

  & > :first-child {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    display: block;
    margin-left: -4.5rem;
  }
`;

export const StyledOverallOl = styled(StyledOl)`
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};

  margin: 0;

  & > li {
    font-family: ${({ theme }) => theme.FSG_FONT.H3.FONT_FAMILY};
    font-size: ${({ theme }) => theme.FSG_FONT.H3.SIZE};
    line-height: ${({ theme }) => theme.FSG_FONT.H3.LINE_HEIGHT};
    font-weight: 700;

    color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};

    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};

    @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
      font-family: ${({ theme }) => theme.FSG_FONT.H3_MOBILE.FONT_FAMILY};
      font-size: ${({ theme }) => theme.FSG_FONT.H3_MOBILE.SIZE};
      line-height: ${({ theme }) => theme.FSG_FONT.H3_MOBILE.LINE_HEIGHT};
    }
  }

  & > li:last-child {
    padding-bottom: 0;
  }
`;

export const StyledLi = styled.li<{ numbering: string }>`
  display: table;

  font-family: ${({ theme }) => theme.FSG_FONT.PARAGRAPH.FONT_FAMILY};
  font-size: ${({ theme }) => theme.FSG_FONT.PARAGRAPH.SIZE};
  line-height: ${({ theme }) => theme.FSG_FONT.PARAGRAPH.LINE_HEIGHT};
  font-weight: 400;

  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
    font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
    line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};

    & > span > a,
    & > span > span > a {
      font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
      font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
      line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};
    }
  }

  &::before {
    display: table-cell;
    position: relative;
    content: '${({ numbering }) => `${numbering}.`}';
    width: 4.5rem;

    padding-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledText = styled(Typography)`
  display: table;
  padding: ${({ theme }) => theme.FSG_SPACING.S16 + ' 0'};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    margin-left: 4.5rem;
  }
`;

export const StyledLiWithoutNumbering = styled.li`
  list-style: none;
  padding-top: 0 !important;
  &::before {
    content: none !important;
  }
`;
