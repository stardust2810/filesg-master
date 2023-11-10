import { Typography } from '@filesg/design-system';

import androidSettingsIcon from '../../../../../../../../../assets/images/verify/verify-android-settings-icon.svg';
import iosSettingsIcon from '../../../../../../../../../assets/images/verify/verify-ios-settings-icon.svg';
import { InfoBox } from '../../../../../../../../../components/data-display/info-box';
import {
  InfoBoxInstructionsContaner,
  InfoBoxInstructionsTextContaner,
  InfoBoxSettingIconContaner,
  StyledImage,
  StyledWrapper,
} from './style';

export function NoPermissionBody() {
  return (
    <StyledWrapper>
      <Typography variant="BODY">We require your permission to access your camera to scan the QR code</Typography>

      <InfoBox title="How to allow camera access">
        <Typography variant="H5" bold="FULL">
          For Chrome app on Android:
        </Typography>
        <InfoBoxInstructionsContaner>
          <InfoBoxSettingIconContaner>
            <StyledImage width={32} height={32} src={androidSettingsIcon} alt="android-settings" />
          </InfoBoxSettingIconContaner>
          <InfoBoxInstructionsTextContaner>
            <Typography variant="BODY">
              Go to Chrome app {'>'} Menu {'>'} Settings {'>'} Site settings {'>'} Camera
            </Typography>
          </InfoBoxInstructionsTextContaner>
        </InfoBoxInstructionsContaner>
        <Typography variant="H5" bold="FULL">
          For Safari app on iOS:
        </Typography>
        <InfoBoxInstructionsContaner>
          <InfoBoxSettingIconContaner>
            <StyledImage width={32} height={32} src={iosSettingsIcon} alt="android-settings" />
          </InfoBoxSettingIconContaner>
          <InfoBoxInstructionsTextContaner>
            <Typography variant="BODY">
              Go to Settings app {'>'} Safari {'>'} Camera
            </Typography>
          </InfoBoxInstructionsTextContaner>
        </InfoBoxInstructionsContaner>
      </InfoBox>
    </StyledWrapper>
  );
}
