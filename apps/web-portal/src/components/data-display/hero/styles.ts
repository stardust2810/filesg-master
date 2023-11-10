import { Col, Container, Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledHero = styled.div`
  background-repeat: repeat;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  display: flex;
  justify-content: center;

  position: sticky;
  top: 0;

  padding: ${({ theme }) => {
    const { S48, S64 } = theme.FSG_SPACING;
    return `${S64} ${S48}`;
  }};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: ${({ theme }) => {
      const { S24, S64 } = theme.FSG_SPACING;
      return `${S64} ${S24}`;
    }};
    position: initial;
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S48 } = theme.FSG_SPACING;
      return `${S48} ${S16}`;
    }};
  }
`;
export const StyledHeroContent = styled(Container)`
  display: flex;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    flex-direction: column;
    gap: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
export const StyledDescriptionContainer = styled(Col)`
  display: flex;
  align-items: center;

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP})) {
    align-items: flex-start;
  }
  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP})) {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S96};
  }
`;
export const HeroDescriptors = styled.div`
  display: flex;
  flex-direction: column;
  padding-right: ${({ theme }) => theme.FSG_SPACING.S80};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding-right: 0;
  }
`;

export const StyledHeaders = styled(Typography)`
  padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding-top: 0;
  }
`;

export const StyledDescription = styled(Typography)`
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;
export const StyledIllustrationWrapper = styled(Col)`
  display: flex;
  justify-content: center;
`;
