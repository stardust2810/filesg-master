import { PublicPageDescriptor } from '@filesg/design-system';
import { PropsWithChildren } from 'react';

import { StyledContainer, StyledWrapper } from './style';

interface Props {
  title: string;
  description?: string;
  image?: string;
}

export function PublicPageWithDescriptorBannerLayout({ title, description, image, children }: PropsWithChildren<Props>) {
  return (
    <>
      <PublicPageDescriptor title={title} description={description} image={image} />
      <StyledWrapper>
        <StyledContainer>{children}</StyledContainer>
      </StyledWrapper>
    </>
  );
}
