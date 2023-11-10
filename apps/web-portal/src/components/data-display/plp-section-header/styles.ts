import { Typography } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledSectionHeader = styled.div<{ $isCentered: boolean }>`
  & > * {
    ${({ $isCentered }) => {
      if ($isCentered) {
        return `
          text-align: center;
          align-items: center;
        `;
      }
    }}
  }

  display: flex;
  flex-direction: column;
`;

export const StyledHeaders = styled(Typography)`
  padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE} - 1px)) {
    padding-top: 0;
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledDescription = styled(Typography)`
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;
