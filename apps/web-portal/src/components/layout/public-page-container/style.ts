import { Col, Container } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledPageContentWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => {
    const { S48, S64 } = theme.FSG_SPACING;
    return `${S64} ${S48}`;
  }};
  padding-top: ${({ theme }) => theme.FSG_SPACING.S40};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: ${({ theme }) => {
      const { S24, S64 } = theme.FSG_SPACING;
      return `${S64} ${S24}`;
    }};
    padding-top: ${({ theme }) => theme.FSG_SPACING.S40};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S64 } = theme.FSG_SPACING;
      return `${S64} ${S16}`;
    }};
    padding-top: ${({ theme }) => theme.FSG_SPACING.S40};
  }
`;

export const StyledPageContainer = styled(Container)``;

export const StyledPageContent = styled(Col)`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
`;
