import { Color, Typography } from '@filesg/design-system';

import { StyledContainer, StyledDescriptionContainer, StyledImageContainer, StyledInfoContainer } from './style';

const TEST_IDS = {
  SLIDE_IMAGE: 'slide-image',
  CONTENT_TITLE: 'content-title',
  CONTENT_DESCRIPTION: 'content-description',
};

interface Props {
  image: string;
  title: string;
  description: string;
  imageAlt: string;
  imageMobilePosition?: string;
}

export const MarketingSlide = ({ image, title, description, imageMobilePosition, imageAlt }: Props) => {
  return (
    <StyledContainer>
      <StyledImageContainer
        data-testid={TEST_IDS.SLIDE_IMAGE}
        $imgUrl={image}
        $imgMobilePosition={imageMobilePosition}
        role="img"
        title={imageAlt} // using title as div does not support alt
      ></StyledImageContainer>
      <StyledInfoContainer>
        <Typography variant={'H2'} bold="FULL" color={Color.GREY80} data-testid={TEST_IDS.CONTENT_TITLE}>
          {title}
        </Typography>
        <StyledDescriptionContainer>
          <Typography variant={'BODY'} color={Color.GREY80} data-testid={TEST_IDS.CONTENT_DESCRIPTION}>
            {description}
          </Typography>
        </StyledDescriptionContainer>
      </StyledInfoContainer>
    </StyledContainer>
  );
};
