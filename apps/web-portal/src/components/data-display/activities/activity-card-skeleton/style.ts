import { Color } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S24};
  border-bottom: 1px solid ${Color.GREY30};
  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    border-bottom: ${({ theme }) => theme.FSG_SPACING.S8} solid ${Color.GREY20};
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;

export const StyledActivityDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;
