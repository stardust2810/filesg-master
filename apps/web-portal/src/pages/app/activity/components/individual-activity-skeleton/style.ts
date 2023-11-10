import styled from 'styled-components';

export const StyledActivityInfo = styled.div`
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledAdditionalInfoListItem = styled.div`
  display: flex;
  flex-direction: column;

  span {
    overflow: visible; // to ensure that focus on links in additional info is visible
  }

  /* div:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S12};
  } */
`;

// =============================================================================
//  FOR FILE LABEL SKELETON (TODO: shift to design system)
// =============================================================================

export const FileLabelSkeletonContainer = styled.div`
  height: 72px;
  max-width: 640px;
  display: flex;
  gap: ${({ theme }) => theme.FSG_SPACING.S16};
  align-items: center;
  padding: 0 ${({ theme }) => theme.FSG_SPACING.S16};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding: 0 ${({ theme }) => theme.FSG_SPACING.S8};
  }
`;

export const FileLabelDetailsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.FSG_SPACING.S8};
`;
