import { FileSGProps } from '@filesg/design-system';

import { InfoCard, Props as InfoCardProps } from '../info-card';
import { StyledCarousel } from './style';

type Props = {
  infoCards: InfoCardProps[];
} & FileSGProps;

export const InfoCards = ({ infoCards }: Props) => {
  const items = infoCards.map(({ title, link, isExternalLink, cardTheme, image }, index) => (
    <InfoCard image={image} key={index} title={title} link={link} isExternalLink={isExternalLink} cardTheme={cardTheme} />
  ));
  return <StyledCarousel enableFreeMode={true} className="fsg-info-cards" slideItems={items} enablePagination={true} />;
};
