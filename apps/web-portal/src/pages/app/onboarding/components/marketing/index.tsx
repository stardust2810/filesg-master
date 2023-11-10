import OnboardingInOnePlace from '../../../../../assets/images/onboarding/onboarding-in-one-place.svg';
import OnboardingOnTheCloud from '../../../../../assets/images/onboarding/onboarding-on-the-cloud.svg';
import OnboardingReuse from '../../../../../assets/images/onboarding/onboarding-reuse.svg';
import { MarketingSlide } from './components/marketing-slide';
import { StyledCarousel, StyledScrollableContentContainer, StyledWrapper } from './style';

const slides = [
  {
    image: OnboardingInOnePlace,
    title: 'Your important documents in one place',
    description: 'You’ll never have to worry about losing your government documents again.',
    imageAlt: 'Person viewing a list of documents issued to her on a tablet computer',
  },
  {
    image: OnboardingOnTheCloud,
    title: 'On the cloud, on the go',
    description: 'Save and access your documents securely from any device, anytime, anywhere.',
    imageMobilePosition: 'top center',
    imageAlt: 'Person accessing a document on his mobile phone at the airport',
  },
  {
    image: OnboardingReuse,
    title: 'No more repetitive work',
    description: 'Reuse your documents for future government transactions.',
    imageAlt: 'Person selecting files from her FileSG account to use for an application',
  },
];

export const Marketing = () => {
  const items = slides.map(({ image, title, description, imageMobilePosition, imageAlt }, index) => (
    <MarketingSlide
      image={image}
      title={title}
      description={description}
      key={`marketing-slide-${index}`}
      imageAlt={imageAlt}
      imageMobilePosition={imageMobilePosition}
    />
  ));

  return (
    <StyledWrapper>
      <StyledScrollableContentContainer>
        <StyledCarousel slideItems={items} enablePagination={true} enableKeyboard={true} enableAutoplay={true} />
      </StyledScrollableContentContainer>
    </StyledWrapper>
  );
};
