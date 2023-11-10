import { FeatureCard } from './components/feature-card';
import { StyledFeaturesContent, StyledFeaturesWrapper } from './styles';

export interface Feature {
  title: string;
  description: string;
  image: string;
  imageAlt: string;
  featureLink: string;
  featureLinkLabel: string;
}

type Props = {
  features: Feature[];
  shouldStartAnimation?: boolean;
};

export const Features = ({ features, shouldStartAnimation = false }: Props): JSX.Element => {
  return (
    <StyledFeaturesWrapper>
      <StyledFeaturesContent>
        {features.map(({ title, description, image, imageAlt, featureLink, featureLinkLabel }, index) => (
          <FeatureCard
            featureLink={featureLink}
            featureLinkLabel={featureLinkLabel}
            shouldStartAnimation={shouldStartAnimation}
            key={index}
            title={title}
            description={description}
            image={image}
            imageAlt={imageAlt}
            isImageAtLeft={index % 2 === 0}
          ></FeatureCard>
        ))}
      </StyledFeaturesContent>
    </StyledFeaturesWrapper>
  );
};
