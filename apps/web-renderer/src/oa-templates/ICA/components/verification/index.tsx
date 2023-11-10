import { FileQrCodeResponse } from '@filesg/common';
import { QRCodeCanvas } from 'qrcode.react';
import React from 'react';

import {
  Container,
  Styled700WeightSpan,
  StyledBody,
  StyledBodyInstructions,
  StyledBodyTitle,
  StyledHeader,
  StyledHeaderDescription,
  StyledHeaderTitle,
  StyledList,
  StyledListNumber,
  StyledListText,
  StyledQrContainer,
} from './style';

interface Props {
  qrCodeDetails: FileQrCodeResponse;
  size?: number;
}

export const Verification = ({ qrCodeDetails, size = 148 }: Props) => (
  <Container>
    <StyledHeader>
      <StyledHeaderTitle>FOR VERIFICATION USE</StyledHeaderTitle>
      <StyledHeaderDescription>
        Present this for verification purposes when requested by relevant authorities and third parties.
      </StyledHeaderDescription>
    </StyledHeader>

    <StyledBody>
      <StyledBodyTitle>How to Verify</StyledBodyTitle>

      <StyledBodyInstructions>
        <StyledList>
          <StyledListNumber>1</StyledListNumber>
          <StyledListText>
            Go to <Styled700WeightSpan>www.file.gov.sg/verify</Styled700WeightSpan>
          </StyledListText>
        </StyledList>
        <StyledList>
          <StyledListNumber>2</StyledListNumber>
          <StyledListText>Use the Scan QR code function to scan:</StyledListText>
        </StyledList>

        <StyledQrContainer>
          <QRCodeCanvas value={qrCodeDetails.token} size={size} />
        </StyledQrContainer>
        <StyledList>
          <StyledListNumber>3</StyledListNumber>
          <StyledListText>View real-time verification results</StyledListText>
        </StyledList>
      </StyledBodyInstructions>
    </StyledBody>
  </Container>
);
