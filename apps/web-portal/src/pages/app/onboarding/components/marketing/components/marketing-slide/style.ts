import styled from 'styled-components';

export const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S32};
  }
`;

export const StyledInfoContainer = styled.div`
  width: 100%;

  > :not(:last-child) {
    margin-bottom: ${({ theme }) => theme.FSG_SPACING.S16};
  }
`;

export const StyledImageContainer = styled.div<{ $imgUrl: string; $imgMobilePosition?: string }>`
  flex: 1;

  background-image: ${({ $imgUrl }) => `url(${$imgUrl})`};
  background-repeat: no-repeat;

  width: 100%;
  background-position: center center;
  min-height: 368px;

  border-radius: ${({ theme }) => theme.FSG_SPACING.S16};
`;

export const StyledDescriptionContainer = styled.div`
  padding-top: ${({ theme }) => theme.FSG_SPACING.S16};

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_TABLET_LANDSCAPE}) {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S24};
  }
`;
