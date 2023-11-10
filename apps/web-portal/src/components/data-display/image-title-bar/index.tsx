import { Typography } from '@filesg/design-system';

import { StyledImageContainer, StyledTitleContainer, StyledWrapper } from './style';

interface Props {
  imageSrc: string;
  title: string;
}

export function ImageTitleBar({ imageSrc, title }: Props) {
  return (
    <StyledWrapper>
      <StyledImageContainer>
        <img src={imageSrc} width="28px" height="28px" alt="" />
      </StyledImageContainer>
      <StyledTitleContainer>
        <Typography variant="H4" bold="SEMI">
          {title}
        </Typography>
      </StyledTitleContainer>
    </StyledWrapper>
  );
}
