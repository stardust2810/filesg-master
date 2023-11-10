import { Button } from '@filesg/design-system';
import { MouseEventHandler } from 'react';

import { StyledErrorInfo } from './style';

interface Props {
  image: string;
  title: string | React.ReactElement;
  descriptions: (string | React.ReactElement)[];
  buttonLabel: string;
  onClick?: MouseEventHandler;
}

export function ErrorAction({ image, title, descriptions, buttonLabel, onClick }: Props) {
  return (
    <StyledErrorInfo image={image} title={title} descriptions={descriptions} isCentered>
      <Button label={buttonLabel} onClick={onClick} />
    </StyledErrorInfo>
  );
}
