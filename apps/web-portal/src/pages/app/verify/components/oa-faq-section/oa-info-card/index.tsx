import { FileSGProps, Typography } from '@filesg/design-system';

import { StyledOaInfoCard, StyledOaInfoDescription, StyledOaInfoImgWrapper } from './style';

type Props = {
  description: string;
  img: string;
  imgAlt: string;
} & FileSGProps;

function OaInfoCard({ description, img, imgAlt, ...rest }: Props) {
  return (
    <StyledOaInfoCard data-testid={rest[`data-testid`]}>
      <StyledOaInfoImgWrapper>
        <img style={{ width: 228 }} src={img} alt={imgAlt} />
      </StyledOaInfoImgWrapper>
      <StyledOaInfoDescription>
        <Typography variant="BODY">{description}</Typography>
      </StyledOaInfoDescription>
    </StyledOaInfoCard>
  );
}

export default OaInfoCard;
