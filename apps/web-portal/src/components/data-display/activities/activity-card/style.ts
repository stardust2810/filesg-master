import { Color } from '@filesg/design-system';
import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S24};

  border-bottom: 1px solid ${Color.GREY30};

  padding: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};

  cursor: pointer;

  &:hover {
    background-color: ${Color.GREY10};
  }

  /* To ensure that focus ring is not cut off in All Activities page */
  &:focus {
    outline-offset: -2px;
  }

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    border-bottom: ${({ theme }) => theme.FSG_SPACING.S8} solid ${Color.GREY20};
    padding: ${({ theme }) => theme.FSG_SPACING.S16};
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;

export const AgencyLogo = styled.img`
  width: ${({ theme }) => theme.FSG_SPACING.S40};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    width: ${({ theme }) => theme.FSG_SPACING.S28};
  }
`;

export const StyledCircle = styled.div`
  height: ${({ theme }) => theme.FSG_SPACING.S64};
  width: ${({ theme }) => theme.FSG_SPACING.S64};

  border-radius: ${({ theme }) => theme.FSG_SPACING.S32};
  border: 2px solid ${Color.GREY20};

  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${Color.WHITE};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    height: ${({ theme }) => theme.FSG_SPACING.S48};
    width: ${({ theme }) => theme.FSG_SPACING.S48};
    border-radius: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;

export const StyledActivityDetails = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;

export const StyledActivityInfoAndActionWrapper = styled.div`
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.FSG_SPACING.S24};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    flex-direction: column;
    gap: 0;
  }
`;

export const StyledActionsContainer = styled.div`
  min-width: 120px;
  height: 100%;
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    div:first-child {
      margin-top: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }
`;
