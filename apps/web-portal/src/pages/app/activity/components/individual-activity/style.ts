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

  p:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S12};
  }
`;

// ACK
export const StyledAcknowledgementBanner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding: ${({ theme }) => theme.FSG_SPACING.S16};
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
  border-radius: ${({ theme }) => theme.FSG_SPACING.S8};
  flex-direction: column;

  > *:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
    margin-right: 0;
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET}) {
    flex-direction: row;
    align-items: center;

    > *:not(:last-child) {
      margin-bottom: 0;
      margin-right: ${({ theme }) => theme.FSG_SPACING.S40};
    }
  }
`;
export const StyledAcknowledgementInfo = styled.div`
  display: flex;
  flex-direction: column;

  max-width: 640px;

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP}) {
    width: 640px;
  }

  p {
    white-space: pre-line;
  }

  > p:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;
