import { FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { useRef } from 'react';

import heroImage from '../../../assets/images/public-landing/plp-hero.svg';
import iconsBackgroundImage from '../../../assets/images/public-landing/plp-hero-background.png';
import {
  HeroDescriptors,
  StyledDescription,
  StyledDescriptionContainer,
  StyledHeaders,
  StyledHero,
  StyledHeroContent,
  StyledIllustrationWrapper,
} from './styles';

type Props = {
  title: string;
  description: string;
  onLoad?: () => void;
};

const HERO_ALT = 'People using FileSG on different devices in different settings';
export const Hero = ({ title, description, onLoad }: Props): JSX.Element => {
  const isSmallerThanNormalTabletPortrait = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_PORTRAIT);
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const isSmallerThanSmallDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_DESKTOP);
  const isSmallerThanNormalDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_DESKTOP);

  const heroRef = useRef<HTMLDivElement>(null);

  const onLoadHandler = () => {
    onLoad?.();
  };
  const getDescriptorsColumns = () => {
    if (isSmallerThanNormalTabletLandscape) {
      return 12;
    }
    if (isSmallerThanSmallDesktop) {
      return 6;
    }
    if (isSmallerThanNormalDesktop) {
      return 5;
    }
    return 6;
  };

  const getImageColumns = () => {
    if (isSmallerThanNormalTabletLandscape) {
      return 12;
    }
    if (isSmallerThanSmallDesktop) {
      return 6;
    }
    if (isSmallerThanNormalDesktop) {
      return 7;
    }
    return 6;
  };

  return (
    <StyledHero ref={heroRef} style={{ backgroundImage: `url(${iconsBackgroundImage})` }}>
      <StyledHeroContent>
        <StyledDescriptionContainer column={getDescriptorsColumns()}>
          <HeroDescriptors>
            <StyledHeaders variant={isSmallerThanNormalTabletPortrait ? 'H1' : 'DISPLAY1'} bold="FULL">
              {title}
            </StyledHeaders>
            <StyledDescription variant={isSmallerThanNormalTabletPortrait ? 'PARAGRAPH' : 'PARAGRAPH_LARGE'}>
              {description}
            </StyledDescription>
          </HeroDescriptors>
        </StyledDescriptionContainer>
        <StyledIllustrationWrapper column={getImageColumns()}>
          <img onLoad={onLoadHandler} alt={HERO_ALT} src={heroImage} />
        </StyledIllustrationWrapper>
      </StyledHeroContent>
    </StyledHero>
  );
};
