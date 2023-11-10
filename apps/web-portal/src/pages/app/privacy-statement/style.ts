import { Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const StyledOl = styled.ol`
  counter-reset: item;
  list-style-type: none;

  & > :first-child {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    display: block;
    margin-left: -4rem;
  }
`;

export const StyledOverallOl = styled(StyledOl)`
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  margin: 0;
`;

export const StyledLi = styled.li`
  display: table;
  counter-increment: item;

  font-family: ${({ theme }) => theme.FSG_FONT.PARAGRAPH.FONT_FAMILY};
  font-size: ${({ theme }) => theme.FSG_FONT.PARAGRAPH.SIZE};
  line-height: ${({ theme }) => theme.FSG_FONT.PARAGRAPH.LINE_HEIGHT};
  font-weight: 400;

  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
    font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
    line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};

    & > span > a {
      font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
      font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
      line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};
    }
  }

  &::before {
    display: table-cell;
    position: relative;
    content: counters(item, '.') '.';
    width: 4rem;

    padding-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledIntroText = styled(Typography)`
  display: table;
  padding: ${({ theme }) => theme.FSG_SPACING.S16 + ' 0'};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    & > span > a {
      font-family: ${({ theme }) => theme.FSG_FONT.BODY.FONT_FAMILY};
      font-size: ${({ theme }) => theme.FSG_FONT.BODY.SIZE};
      line-height: ${({ theme }) => theme.FSG_FONT.BODY.LINE_HEIGHT};
    }
  }
`;

export const StyledSectionHeader = styled(Typography)`
  display: table;
  padding: ${({ theme }) => theme.FSG_SPACING.S16 + ' 0'};
`;

export const StyledText = styled(Typography)`
  display: table;
  padding: ${({ theme }) => theme.FSG_SPACING.S16 + ' 0'};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    margin-left: 4rem;
  }
`;

export const StyledRelatedPagesContainer = styled.div`
  position: sticky;
  top: 0;

  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S8};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledRelatedPagesHeaderContainer = styled.div`
  display: flex;

  padding: ${({ theme }) => {
    const { S16, S24 } = theme.FSG_SPACING;
    return S16 + ' ' + S24;
  }};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16 + ' 0'};
  }
`;

export const StyledRelatedPagesLinksContainer = styled.div`
  display: flex;
  flex-direction: column;

  row-gap: ${({ theme }) => theme.FSG_SPACING.S24};
  padding: ${({ theme }) => '0 ' + theme.FSG_SPACING.S24};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding: 0;
  }
`;
