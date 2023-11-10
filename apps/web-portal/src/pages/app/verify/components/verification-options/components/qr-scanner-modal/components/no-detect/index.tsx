import { Typography } from '@filesg/design-system';

import { InfoBox } from '../../../../../../../../../components/data-display/info-box';
import { StyledBreak, StyledList, StyledUnorderedList, StyledWrapper } from './style';

export function NoDetectBody() {
  return (
    <StyledWrapper>
      <Typography variant="BODY">It seems that your QR code cannot be detected.</Typography>

      <InfoBox title="How to scan QR code">
        <StyledUnorderedList>
          <StyledList>
            <Typography variant="BODY">
              Increase your screen brightness. It needs to be bright enough for the camera to see the QR code.
            </Typography>
          </StyledList>
          {/* <br /> */}
          <StyledBreak />
          <StyledList>
            <Typography variant="BODY">
              Check if your camera lens is clean. If it’s not, it can affect the recognition of the QR code.
            </Typography>
          </StyledList>
          {/* <br /> */}
          <StyledBreak />

          <StyledList>
            <Typography variant="BODY">
              Make sure that your camera lens is parallel to the QR code. If it’s too tilted or slanted, it may not scan correctly.
            </Typography>
          </StyledList>
          {/* <br /> */}
          <StyledBreak />

          <StyledList>
            <Typography variant="BODY">Adjust the distance between your camera and the QR code. It may be too close or too far.</Typography>
          </StyledList>
        </StyledUnorderedList>
      </InfoBox>
    </StyledWrapper>
  );
}
