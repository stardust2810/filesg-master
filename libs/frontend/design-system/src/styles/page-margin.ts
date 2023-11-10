import { css } from 'styled-components';

export const PAGE_MARGIN_STYLES = css`
  margin: ${({ theme }) => theme.FSG_SPACING.S24};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S80};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    margin: ${({ theme }) => theme.FSG_SPACING.S24};
    margin-top: ${({ theme }) => theme.FSG_SPACING.S24};
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S72};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    margin: ${({ theme }) => theme.FSG_SPACING.S16};
    margin-top: ${({ theme }) => theme.FSG_SPACING.S24};
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S64};
  }
`;

export const PAGE_VERTICAL_MARGIN_STYLES = css`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S24};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S80};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S72};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S64};
  }
`;

export const PAGE_HORIZONTAL_MARGIN_STYLES = css`
  margin-left: ${({ theme }) => theme.FSG_SPACING.S24};
  margin-right: ${({ theme }) => theme.FSG_SPACING.S24};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    margin-left: ${({ theme }) => theme.FSG_SPACING.S16};
    margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
