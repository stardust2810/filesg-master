import { Color } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledRecentActitiesContainer = styled.div`
  width: 100%;
`;

export const StyledTitleContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S6};
  padding: ${({ theme }) => theme.FSG_SPACING.S24};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
export const StyledErrorOrNoActivitiesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};

  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-top: 0;

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledActivitiesContainer = styled.div`
  border-top: 1px solid ${Color.GREY30};
`;

export const StyledNavContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: ${({ theme }) => theme.FSG_SPACING.S16};
`;
