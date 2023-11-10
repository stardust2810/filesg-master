import React, { PropsWithChildren } from 'react';

import { FileSGProps } from '../../../utils/typings';
import { Info, Props as InfoProps } from '../info';
import { StyledContainer } from './style';

export interface Props extends InfoProps, FileSGProps {}

/**
 * Error Info is an organism component that adds a children component on top of the Info component
 */
export function ErrorInfo({
  image,
  tagText,
  title,
  descriptions,
  isCentered = false,
  children,
  className,
  imageAltText,
  ...rest
}: PropsWithChildren<Props>) {
  return (
    <StyledContainer $isCentered={isCentered} className={className} data-testid={rest['data-testid'] ?? 'error-info'}>
      <Info imageAltText={imageAltText} image={image} tagText={tagText} title={title} descriptions={descriptions} isCentered={isCentered} />
      {children}
    </StyledContainer>
  );
}
