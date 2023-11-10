import { Color, Container, HEX_COLOR_OPACITY } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledFeaturesWrapper = styled.div`
  background: ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;

  z-index: 100;
  transform: translate3d(0, 0, 0); // to fix safari bug for position sticky not respecting z-index

  padding: ${({ theme }) => {
    const { S48, S64 } = theme.FSG_SPACING;
    return `${S64} ${S48}`;
  }};

  ::before {
    border-bottom: 130px solid ${({ theme }) => theme.FSG_COLOR.SYSTEM.WHITE};
    border-right: 260px solid ${Color.WHITE}${HEX_COLOR_OPACITY.P00};
    content: '';
    height: 0;
    left: 0;
    position: absolute;
    top: -130px;
    width: calc(130px + 50%);
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    ::before {
      content: none;
    }

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

export const StyledFeaturesContent = styled(Container)`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.FSG_SPACING.S128};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S48};
  }
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    gap: ${({ theme }) => theme.FSG_SPACING.S40};
  }
`;
