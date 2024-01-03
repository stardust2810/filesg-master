import { Typography, TextLink, LinkProps } from '../../../../../../libs/frontend/design-system/src';
import { StyledRelatedPagesContainer, StyledRelatedPagesHeaderContainer, StyledRelatedPagesLinksContainer } from './style';

type Props = {
  title: string;
  links: LinkProps[];
};

export const QuickLinks = ({ title, links }: Props) => {
  return (
    <StyledRelatedPagesContainer>
      <StyledRelatedPagesHeaderContainer>
        <Typography variant="H4" bold="FULL">
          {title}
        </Typography>
      </StyledRelatedPagesHeaderContainer>
      <StyledRelatedPagesLinksContainer>
        {links.map(({ label, to, isExternal }, index) => (
          <li key={`quick-link-${index}`}>
            <TextLink
              endIcon={isExternal ? 'sgds-icon-external' : undefined}
              font="PARAGRAPH"
              type={isExternal ? 'ANCHOR' : 'LINK'}
              newTab={isExternal ?? false}
              to={to}
            >
              {label}
            </TextLink>
          </li>
        ))}
      </StyledRelatedPagesLinksContainer>
    </StyledRelatedPagesContainer>
  );
};
