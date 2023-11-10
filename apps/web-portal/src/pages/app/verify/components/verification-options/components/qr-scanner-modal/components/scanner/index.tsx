import { Spinner, Typography } from '@filesg/design-system';
import { useEffect } from 'react';

import { Props as QrVideoProps, QrScannerVideo } from '../../../../../../../../../components/inputs/qr-scanner-video';
import { StyledBodyTextContainer, StyledVideoContainer } from './style';

interface Props extends QrVideoProps {
  onDismountHandler: () => void;
  isLoading?: boolean;
}

export function Scanner({ videoRef, overlayRef, onDismountHandler, isLoading }: Props) {
  useEffect(() => {
    return onDismountHandler;
  }, [onDismountHandler]);

  return (
    <>
      <StyledBodyTextContainer>
        <Typography variant="BODY">Scan the QR code on the digital or printed copy of the OA document to verify</Typography>
      </StyledBodyTextContainer>
      <StyledVideoContainer>
        {isLoading ? <Spinner /> : <QrScannerVideo videoRef={videoRef} overlayRef={overlayRef} />}
      </StyledVideoContainer>
    </>
  );
}
