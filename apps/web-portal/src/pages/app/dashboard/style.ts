import { Bold, PAGE_VERTICAL_MARGIN_STYLES } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex: 1;
  max-width: 100%;
  min-width: 0;
`;

export const StyledPageContent = styled.div`
  ${PAGE_VERTICAL_MARGIN_STYLES}
  margin-top: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const StyledPageDescriptorContainer = styled.div`
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S24 } = theme.FSG_SPACING;
      return `${S24} ${S16}`;
    }};
  }
`;

export const StyledPageTitle = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.FSG_SPACING.S4};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    flex-direction: column;
    gap: 0;
  }
`;

export const StyledUserName = styled(Bold)`
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY80};
`;

export const StyledCorporateName = styled(Bold)`
  color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY60};
`;

export const StyledScrollShadowContainer = styled.div`
  overflow: hidden;
  position: relative;
`;

export const StyledInfoCardsContainer = styled.div`
  width: 100%;
  overflow: auto;

  /* Best effort method to hide the scroll bar for this component 
     https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-scrollbar
     
     "Non-standard: This feature is non-standard and is not on a standards track. 
     Do not use it on production sites facing the Web: it will not work for every user. 
     There may also be large incompatibilities between implementations and the behavior 
     may change in the future."
  */
  ::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const StyledBannerContainer = styled.div`
  padding: ${({ theme }) => {
    const { S24, S48 } = theme.FSG_SPACING;
    return `${S48} ${S24}`;
  }};
  padding-bottom: 0;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S48 } = theme.FSG_SPACING;
      return `${S48} ${S16}`;
    }};
    padding-bottom: 0;
  }
`;

export const StyledActivitiesAndFilesContainer = styled.div`
  display: flex;
  flex-direction: column;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
