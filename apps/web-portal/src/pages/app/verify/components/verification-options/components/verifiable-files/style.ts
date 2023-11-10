import { IconLabel } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledWrapper = styled.div`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledParagraphWrapper = styled.div`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledPassList = styled.div`
  display: flex;
  > :not(:last-child) {
    margin-right: ${({ theme }) => theme.FSG_SPACING.S16};
  }

  @media screen and (min-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_DESKTOP})) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    flex-direction: column;
    > :not(:last-child) {
      margin-right: 0;
      margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }
`;

export const StyledIconLabel = styled(IconLabel)`
  flex: 1;
`;
