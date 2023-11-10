import { Carousel } from '@filesg/design-system';
import styled from 'styled-components';

const CAROUSEL_MAX_WIDTH_IN_REM = 36;

export const StyledWrapper = styled.div`
  flex: 1 0 0;
  min-height: 0;
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

export const StyledScrollableContentContainer = styled.div`
  flex: 1 0 0;
  min-width: 0;
  overflow-y: auto;

  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: ${({ theme }) => theme.FSG_SPACING.S32};

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.NORMAL_DESKTOP}) {
    padding: ${({ theme }) => theme.FSG_SPACING.S48};
  }

  @media screen and (min-width: ${({ theme }) => theme.FSG_BREAKPOINTS.LARGE_DESKTOP}) {
    padding: ${({ theme }) => theme.FSG_SPACING.S64};
  }

  @media screen and (min-width: 2560) {
    padding: ${({ theme }) => theme.FSG_SPACING.S96};
  }
`;

export const StyledCarousel = styled(Carousel)`
  max-width: ${CAROUSEL_MAX_WIDTH_IN_REM}rem;
  .fsg-carousel-pagination {
    padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
    text-align: left;
  }

  @media screen and (min-width: 1024px) {
    .fsg-carousel-pagination {
      padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }

  @media screen and (max-width: 1023px) {
    .fsg-carousel-pagination {
      padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }

  @media screen and (max-width: 767px) {
    .fsg-carousel-pagination {
      padding-top: ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }
  .swiper-wrapper {
    display: flex;
    min-width: 0;
  }

  .swiper-wrapper-active {
    flex: 1;
  }
`;
