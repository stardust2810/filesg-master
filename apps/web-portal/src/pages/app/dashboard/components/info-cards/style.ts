import { Carousel } from '@filesg/design-system';
import styled from 'styled-components';
const CARD_WIDTH_IN_PX = 272;

export const StyledCarousel = styled(Carousel)`
  .fsg-carousel-pagination {
    padding-top: 0;
    justify-content: center;
  }
  .swiper {
    padding: ${({ theme }) => theme.FSG_SPACING.S12} ${({ theme }) => theme.FSG_SPACING.S24};

    @media screen and (max-width: calc(${({ theme }) => theme.FSG_BREAKPOINTS.SMALL_TABLET} - 1px)) {
      padding: ${({ theme }) => theme.FSG_SPACING.S12} ${({ theme }) => theme.FSG_SPACING.S16};
    }
  }

  .swiper-wrapper .swiper-slide:last-child {
    box-sizing: content-box;
  }
  .swiper-slide {
    flex: 1;
    min-width: ${CARD_WIDTH_IN_PX / 16}rem;
    :not(:last-child) {
      margin-right: 8px;
    }
  }
`;
