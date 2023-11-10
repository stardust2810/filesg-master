import { RefObject } from 'react';

import { StyledVideo, StyledVideoContainer } from './style';

export interface Props {
  videoRef: RefObject<HTMLVideoElement> | ((instance: HTMLVideoElement) => void);
  overlayRef: RefObject<HTMLDivElement> | ((instance: HTMLDivElement) => void);
}

export function QrScannerVideo({ videoRef, overlayRef }: Props): JSX.Element {
  return (
    <StyledVideoContainer>
      <StyledVideo ref={videoRef} />
      <div ref={overlayRef} />
    </StyledVideoContainer>
  );
}
