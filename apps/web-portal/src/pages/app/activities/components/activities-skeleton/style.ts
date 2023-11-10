import styled from 'styled-components';

export const StyledAllActivitiesContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S80};

  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
  }
`;
