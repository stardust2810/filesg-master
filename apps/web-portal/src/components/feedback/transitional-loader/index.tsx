import { Color, FileSGLogo, FileSpinner, Typography } from '@filesg/design-system';
import React from 'react';

import { StyledContainer, StyledLabelContainer, StyledTextContainer } from './style';

export function TransitionalLoader() {
  return (
    <StyledContainer>
      <StyledTextContainer>
        <FileSGLogo />
        <StyledLabelContainer>
          <Typography variant="H2" bold="FULL" color={Color.BLACK}>
            You are being redirected to FileSG
          </Typography>
          <Typography variant="BODY" color={Color.BLACK}>
            Beware of phishing! Make sure the link ends with gov.sg
          </Typography>
        </StyledLabelContainer>
      </StyledTextContainer>
      <FileSpinner />
    </StyledContainer>
  );
}
