import { Button, Col, Container } from '@filesg/design-system';
import styled from 'styled-components';

const BETA_IMG_WIDTH_DESKTOP = 256;
const BETA_IMG_WIDTH_TABLET = 192;
const BETA_IMG_WIDTH_MOBILE = 328;

export const StyledBetaTesterSection = styled.div`
  background-color: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  display: flex;
  justify-content: center;
  z-index: 100;
  transform: translate3d(0, 0, 0); // to fix safari bug for position sticky not respecting z-index

  padding: ${({ theme }) => {
    const { S48, S64 } = theme.FSG_SPACING;
    return `${S64} ${S48}`;
  }};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: ${({ theme }) => {
      const { S24, S64 } = theme.FSG_SPACING;
      return `${S64} ${S24}`;
    }};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding: ${({ theme }) => {
      const { S24, S48 } = theme.FSG_SPACING;
      return `${S48} ${S24}`;
    }};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S48 } = theme.FSG_SPACING;
      return `${S48} ${S16}`;
    }};
  }
`;

export const StyledBetaTesterWrapper = styled(Container)`
  flex: 1;
  display: flex;
  align-items: center;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    flex-direction: column;
    gap: ${({ theme }) => theme.FSG_SPACING.S32};
  }
`;

export const StyledIllustrationWrapper = styled(Col)`
  display: flex;
  justify-content: center;
`;

export const StyledIllustration = styled.img`
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    width: ${BETA_IMG_WIDTH_DESKTOP}px;
  }
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    width: ${BETA_IMG_WIDTH_TABLET}px;
  }
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    width: ${BETA_IMG_WIDTH_MOBILE}px;
  }
`;

export const StyledButton = styled(Button)`
  margin: ${({ theme }) => theme.FSG_SPACING.S16} 0;
`;
