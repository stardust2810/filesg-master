import { Section as SGDSSection } from 'sgds-govtech-react';
import styled from 'styled-components';

export const Section = styled(SGDSSection)`
  z-index: 40;
  padding: ${({ theme }) => {
    const { S24, S48, S80 } = theme.FSG_SPACING;
    return S24 + ' ' + S48 + ' ' + S80 + ' ' + S48;
  }};

  @media only screen and (max-width: 480px) {
    padding: ${({ theme }) => {
      const { S16, S24, S64 } = theme.FSG_SPACING;
      return S24 + ' ' + S16 + ' ' + S64 + ' ' + S16;
    }};
  }
`;
