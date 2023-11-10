import { Container } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin: 0 auto;

  width: 100%;

  padding: ${({ theme }) => {
    const { S40, S48, S80 } = theme.FSG_SPACING;
    return S40 + ' ' + S48 + ' ' + S80;
  }};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP} - 1px)) {
    padding: ${({ theme }) => {
      const { S24, S32, S72 } = theme.FSG_SPACING;
      return S32 + ' ' + S24 + ' ' + S72;
    }};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    padding: ${({ theme }) => {
      const { S24, S32, S64 } = theme.FSG_SPACING;
      return S32 + ' ' + S24 + ' ' + S64;
    }};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => {
      const { S16, S24, S64 } = theme.FSG_SPACING;
      return S24 + ' ' + S16 + ' ' + S64;
    }};
  }
`;

export const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;

  width: 100%;

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE}) {
    flex-direction: row;

    column-gap: ${({ theme }) => theme.FSG_SPACING.S80};
  }
`;
