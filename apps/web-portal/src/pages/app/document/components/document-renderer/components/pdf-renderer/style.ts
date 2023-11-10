import styled from 'styled-components';

export const StyledViewerWrapper = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%;

  & *.rpv-core__inner-pages {
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};

    @media screen and (min-width: 600px) {
      padding-top: ${({ theme }) => theme.FSG_SPACING.S24};
      padding-bottom: ${({ theme }) => theme.FSG_SPACING.S24};
    }
  }

  & *.rpv-core__inner-page {
    background-color: ${({ theme }) => theme.FSG_COLOR.GREYS.GREY20};
  }
`;
