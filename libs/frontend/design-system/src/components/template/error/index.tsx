import React from 'react';

import { ErrorInfo } from '../../data-display/error-info';
import { TextLink } from '../../navigation/text-link';
import { LinksContainer, StyledContainer } from './style';

export interface Link {
  label: string;
  to: string;
}

export interface Props {
  image: string;
  tagText?: string;
  title: string;
  descriptions: (string | React.ReactElement)[];
  links?: Link[];
}

export function Error({ title, tagText, image, descriptions, links }: Props) {
  return (
    <StyledContainer>
      <ErrorInfo image={image} tagText={tagText} title={title} descriptions={descriptions}>
        <LinksContainer>
          {links &&
            links.map((link) => (
              <TextLink type="LINK" to={link.to}>
                {link.label}
              </TextLink>
            ))}
        </LinksContainer>
      </ErrorInfo>
    </StyledContainer>
  );
}
