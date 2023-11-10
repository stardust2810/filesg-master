import { Bold, Col, Color, FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import { useTransition } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useIsComponentScrolledTo } from '../../../../../hooks/common/useIsComponentScrolledTo';
import {
  StyledButton,
  StyledFeatureCardWrapper,
  StyledFeatureDescriptionWrapper,
  StyledFeatureDescriptorWrapper,
  StyledFeatureTitleWrapper,
  StyledIllustration,
  StyledIllustrationWrapper,
} from './styles';

type Props = {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  isImageAtLeft?: boolean;
  shouldStartAnimation?: boolean;
  featureLink: string;
  featureLinkLabel: string;
};

export const FeatureCard = ({
  title,
  description,
  image,
  isImageAtLeft = true,
  shouldStartAnimation = true,
  imageAlt = '',
  featureLink,
  featureLinkLabel,
}: Props): JSX.Element => {
  const isSmallerThanNormalTabletPortrait = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_PORTRAIT);
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const isSmallerThanSmallDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_DESKTOP);
  const isSmallerThanNormalDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_DESKTOP);

  const ref = useRef<HTMLDivElement>(null);

  const [isContentDisplayed, setIsContentDisplayed] = useState(false);
  const isScrolledTo = useIsComponentScrolledTo(ref, undefined, shouldStartAnimation);

  const navigate = useNavigate();
  useEffect(() => {
    if (isScrolledTo && !isContentDisplayed) {
      setIsContentDisplayed(isScrolledTo);
    }
  }, [isContentDisplayed, isScrolledTo]);

  const desktopLeftToRightTransition = useTransition(isContentDisplayed, {
    from: { opacity: 0, transform: 'translateX(-100px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    delay: 100,
  });

  const desktopRightToLeftTransition = useTransition(isContentDisplayed, {
    from: { opacity: 0, transform: 'translateX(100px)' },
    enter: { opacity: 1, transform: 'translateX(0px)' },
    delay: 100,
  });

  const mobileTransition = useTransition(isContentDisplayed, {
    from: { opacity: 0, transform: 'translateY(100px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    delay: 200,
  });

  // Deriving columns
  const getDescriptorColumns = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return 12;
    }
    if (isSmallerThanNormalTabletLandscape) {
      return 5;
    }
    if (isSmallerThanSmallDesktop) {
      return 6;
    }
    if (isSmallerThanNormalDesktop) {
      return 5;
    }
    return 4;
  };

  const getDescriptorOffset = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return undefined;
    }
    if (isSmallerThanNormalDesktop) {
      if (isImageAtLeft) {
        return 1;
      }
      return undefined;
    }
    return 1;
  };

  const getImageColumns = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return 12;
    }
    if (isSmallerThanNormalTabletLandscape) {
      return 6;
    }
    if (isSmallerThanSmallDesktop) {
      return 5;
    }
    return 6;
  };

  const getImageOffset = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return undefined;
    }
    if (isImageAtLeft) {
      return undefined;
    }
    return 1;
  };

  // Components

  const getTitle = () => {
    const firstSpaceIndex = title.indexOf(' ');
    const firstWord = title.substring(0, firstSpaceIndex);
    const remainingWords = ' ' + title.substring(firstSpaceIndex + 1);
    return (
      <StyledFeatureTitleWrapper>
        <Typography variant={isSmallerThanNormalTabletLandscape ? 'H2' : 'DISPLAY2'}>
          <Bold type="FULL">{firstWord} </Bold>
          {remainingWords}
        </Typography>
      </StyledFeatureTitleWrapper>
    );
  };

  const FeatureDescription = () => {
    return (
      <StyledFeatureDescriptionWrapper>
        <Typography variant={isSmallerThanNormalTabletLandscape ? 'BODY' : 'PARAGRAPH'} color={Color.GREY60}>
          {description}
        </Typography>
      </StyledFeatureDescriptionWrapper>
    );
  };

  const featureButtonOnClickHandler = () => {
    navigate(featureLink);
  };
  const FeatureButton = () => (
    <StyledButton label={featureLinkLabel} endIcon={'sgds-icon-arrow-right'} onClick={featureButtonOnClickHandler} />
  );

  const featureDescriptor = (styles) => {
    return (
      <StyledFeatureDescriptorWrapper style={styles}>
        {getTitle()}
        <FeatureDescription />
        <FeatureButton />
      </StyledFeatureDescriptorWrapper>
    );
  };
  return (
    <StyledFeatureCardWrapper $isImageAtLeft={isImageAtLeft} ref={ref}>
      <Col column={getDescriptorColumns()} offset={getDescriptorOffset()}>
        {isSmallerThanNormalTabletPortrait
          ? mobileTransition((styles, item) => item && featureDescriptor(styles))
          : isImageAtLeft
          ? desktopRightToLeftTransition((styles, item) => item && featureDescriptor(styles))
          : desktopLeftToRightTransition((styles, item) => item && featureDescriptor(styles))}
      </Col>
      <StyledIllustrationWrapper column={getImageColumns()} offset={getImageOffset()}>
        <StyledIllustration src={image} alt={imageAlt} />
      </StyledIllustrationWrapper>
    </StyledFeatureCardWrapper>
  );
};
