import styled from 'styled-components';

export const StyledOaFaqSection = styled.div`
  background-repeat: repeat;
  background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY10};
  display: flex;
  flex: 1;
  justify-content: center;
`;
export const StyledOaHeader = styled.div`
  flex: 1;

  display: flex;
  justify-content: center;

  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_PORTRAIT} - 1px)) {
    justify-content: start;
    padding-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledDescription = styled.div`
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledOaInfoHeader = styled.div`
  margin-top: ${({ theme }) => theme.FSG_SPACING.S16};
  margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
`;

export const StyledOaInfoCards = styled.div`
  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
