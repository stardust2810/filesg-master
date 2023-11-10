import { Button, Col, Container } from '@filesg/design-system';
import styled from 'styled-components';

import { SectionHeader } from '../plp-section-header';

export const StyledFaqSection = styled.div`
  background-repeat: repeat;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  display: flex;
  flex: 1;
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

export const StyledFaqWrapper = styled(Container)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledFaqContent = styled(Col)`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const StyledSectionHeader = styled(SectionHeader)`
  width: 100%;
  padding: ${({ theme }) => theme.FSG_SPACING.S16} 0;
  border-bottom: 1px solid ${({ theme }) => theme.FSG_COLOR.GREYS.GREY30};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S32};
`;
