// Import Swiper styles
// NOTE: As version 7/8 of swiper is using "exports" in the package.json, there are importing
// errors of cannot find module will trying to run tests. Hence, the current work around
// would be to import the css in the following way. ref: https://github.com/surmon-china/vue-awesome-swiper/issues/570
import '../../../../../../../node_modules/swiper/swiper.min.css';
import '../../../../../../../node_modules/swiper/modules/navigation/navigation.min.css';
import '../../../../../../../node_modules/swiper/modules/pagination/pagination.min.css';
import '../../../../../../../node_modules/swiper/modules/effect-fade/effect-fade.min.css';
import './index.css';

import { Autoplay, EffectFade, FreeMode, Keyboard, Navigation, Pagination } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';

import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { CarouselButton } from './components/carousel-button';
import { StyledContainer, StyledContentContainer, StyledItemContainer } from './style';
const DEFAULT_AUTOPLAY_INTERVAL_DURATION_IN_MS = 5000;
export type Props = {
  /**
   * JSX elements to be passed as slide items
   */
  slideItems: JSX.Element[];
  /**
   * Option to enable/disable pagination feature
   */
  enablePagination?: boolean;
  /**
   * Option to enable/disable swiping by keyboard feature
   */
  enableKeyboard?: boolean;
  /**
   * Option to enable/disable navigation button to overlap slide items
   */
  enableOverlap?: boolean;
  /**
   * Option to hide navigation buttons
   */
  enableButtonNavigation?: boolean;
  enableFreeMode?: boolean;
  /**
   * Option to enable autoplay
   */
  enableAutoplay?: boolean;
  /**
   * Duration of each slide
   */
  autoplayInternalDuration?: number;
  onSlideChange?: (swiper: SwiperClass) => void;
  onSwiper?: (swiper: SwiperClass) => void;
  onInit?: (swiper: SwiperClass) => void;
} & FileSGProps;

export const Carousel = ({
  slideItems,
  enablePagination = false,
  enableKeyboard = false,
  enableOverlap = false,
  enableFreeMode = false,
  enableButtonNavigation = false,
  enableAutoplay = false,
  autoplayInternalDuration = DEFAULT_AUTOPLAY_INTERVAL_DURATION_IN_MS,
  onSlideChange,
  onSwiper,
  onInit,
  className,
  ...rest
}: Props) => {
  const getModules = () => {
    const modules = [Navigation, EffectFade];

    if (enablePagination) {
      modules.push(Pagination);
    }

    if (enableKeyboard) {
      modules.push(Keyboard);
    }

    if (enableFreeMode) {
      modules.push(FreeMode);
    }

    if (enableAutoplay) {
      modules.push(Autoplay);
    }
    return modules;
  };

  return (
    <StyledContainer className={className} data-testid={rest['data-testid'] ?? TEST_IDS.CAROUSEL}>
      <StyledContentContainer>
        {enableButtonNavigation && <CarouselButton isLeft className="swiper-prev-btn" />}
        <Swiper
          modules={getModules()}
          navigation={{
            prevEl: '.swiper-prev-btn',
            nextEl: '.swiper-next-btn',
          }}
          pagination={
            enablePagination && {
              el: '.fsg-carousel-pagination',
              clickable: true,
              renderBullet: function (index, className) {
                return `<div class=${className}><span class="swiper-pagination-dot" /></div>`;
              },
            }
          }
          loop={!enableFreeMode}
          keyboard={
            enableKeyboard && {
              enabled: true,
            }
          }
          freeMode={enableFreeMode}
          autoplay={{
            delay: autoplayInternalDuration,
            disableOnInteraction: false,
          }}
          speed={250}
          slidesPerView={enableFreeMode ? 'auto' : 1}
          effect={enableFreeMode ? undefined : 'fade'}
          fadeEffect={{ crossFade: true }}
          onSlideChange={(swiper) => onSlideChange && onSlideChange(swiper)}
          onSwiper={onSwiper}
          onInit={(swiper) => onInit && onInit(swiper)}
        >
          {slideItems.map((item, index) => (
            <SwiperSlide key={`swiper-slide-${index}`} data-testid={TEST_IDS.CAROUSEL_SLIDE}>
              {({ isActive }) => (
                <StyledItemContainer
                  data-testid={isActive ? `${TEST_IDS.CAROUSEL_SLIDE}-active` : `${TEST_IDS.CAROUSEL_SLIDE}-inactive`}
                  overlap={enableButtonNavigation ? enableOverlap : true}
                >
                  {item}
                </StyledItemContainer>
              )}
            </SwiperSlide>
          ))}
        </Swiper>
        {enableButtonNavigation && <CarouselButton isLeft={false} className="swiper-next-btn" />}
      </StyledContentContainer>

      {enablePagination && <div className="fsg-carousel-pagination" data-testid={TEST_IDS.CAROUSEL_PAGINATION} />}
    </StyledContainer>
  );
};
