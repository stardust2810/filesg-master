import { Typography } from '@filesg/design-system';
import { PropsWithChildren } from 'react';

import lightBulbImg from '../../../assets/images/common/light-bulb-cyan.svg';
import { StyledBody, StyledHeader, StyledWrapper } from './style';

interface Props {
  title: string;
}

export function InfoBox({ title, children }: PropsWithChildren<Props>) {
  return (
    <StyledWrapper>
      <StyledHeader>
        <Typography variant="H4" bold="FULL">
          {title}
        </Typography>
        <img src={lightBulbImg} width={25.91} height={28} alt="light-bulb" />
      </StyledHeader>
      <StyledBody>{children}</StyledBody>
    </StyledWrapper>
  );
}
