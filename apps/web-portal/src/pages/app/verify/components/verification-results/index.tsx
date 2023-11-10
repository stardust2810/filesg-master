import { Button, FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import { OADocumentLoader } from '../../../../../components/inputs/oa-document-loader';
import { config } from '../../../../../config/app-config';
import { WOGAA_TRACKING_ID } from '../../../../../consts/analytics';
import { trackWogaaTransaction } from '../../../../../utils/common';
import { VerificationOption } from '../..';
import { StyledButtonContainer, StyledOaRenderer, StyledResultsRenderer } from './style';

const BACK_TO_VERIFY_BTN_LABEL = 'Verify another file';

interface Props {
  oaBlob: Blob;
  verificationOption: VerificationOption;
  setVerificationOption: React.Dispatch<React.SetStateAction<VerificationOption>>;
  clearOaBlob: () => void;
}

function VerificationResults({ oaBlob, verificationOption, setVerificationOption, clearOaBlob }: Props) {
  const navigate = useNavigate();
  const oaLoaderRef = useRef<HTMLDivElement>(null);
  const isSmallerThanSmallDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_DESKTOP);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const onClickHandler = () => {
    clearOaBlob();
    setVerificationOption(VerificationOption.QR_SCAN);
  };

  const onTimeOutHandler = () => {
    navigate(0);
  };

  useEffect(() => {
    trackWogaaTransaction('COMPLETE', WOGAA_TRACKING_ID.VERIFY_VIA_QR);
    trackWogaaTransaction('COMPLETE', WOGAA_TRACKING_ID.VERIFY_VIA_UPLOAD);
    trackWogaaTransaction('COMPLETE', WOGAA_TRACKING_ID.VERIFY_VIA_UPLOAD_QR_IMAGE);
  }, []);

  const getButtonCol = () => {
    if (isSmallerThanSmallTablet) {
      return 12;
    }
    if (isSmallerThanSmallDesktop) {
      return 6;
    }
    return 8;
  };

  return (
    <StyledOaRenderer>
      <StyledResultsRenderer>
        <OADocumentLoader
          isVerificationResultsExpandable={false}
          ref={oaLoaderRef}
          blob={oaBlob}
          showQr={false}
          showFullDetails={verificationOption === VerificationOption.FILE_UPLOAD}
          showPassIfStatusInvalid={false}
          timerConfig={{ durationInMs: config.refreshVerificationResultPageTimerInMs, onTimerEnd: onTimeOutHandler }}
        />
      </StyledResultsRenderer>
      <StyledButtonContainer column={getButtonCol()}>
        <Button
          label={BACK_TO_VERIFY_BTN_LABEL}
          decoration="SOLID"
          color="DEFAULT"
          fullWidth={true}
          endIcon={'sgds-icon-file'}
          onClick={onClickHandler}
        />
      </StyledButtonContainer>
    </StyledOaRenderer>
  );
}

export default VerificationResults;
