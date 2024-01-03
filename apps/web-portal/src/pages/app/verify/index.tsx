import { PublicPageDescriptor } from '@filesg/design-system';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import verifyFileImg from '../../../assets/images/verify/verify-file.svg';
import PublicPageContainer from '../../../components/layout/public-page-container';
import { WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useScrollToHashLink } from '../../../hooks/common/useScrollToHashLink';
import OaFaqSection from './components/oa-faq-section';
import VerificationOptions from './components/verification-options';
import VerificationResults from './components/verification-results';
import { StyledWrapper } from './style';

const VERIFICATION_OPTIONS_PAGE_TITLE = 'Verify Documents';
const VERIFICATION_RESULTS_PAGE_TITLE = 'Verification Results';
const VERIFICATION_PAGE_DESCRIPTION = 'Check validity of OpenAttestation (OA) files issued through FileSG';

export enum VerificationOption {
  QR_SCAN = 'qr-scan',
  FILE_UPLOAD = 'file-upload',
}

function Verify() {
  const navigate = useNavigate();

  const [oaBlob, setOaBlob] = useState<Blob>();
  const [verificationOption, setVerificationOption] = useState<VerificationOption>(VerificationOption.QR_SCAN);

  usePageTitle(oaBlob ? VERIFICATION_RESULTS_PAGE_TITLE : VERIFICATION_OPTIONS_PAGE_TITLE);
  usePageDescription(VERIFICATION_PAGE_DESCRIPTION);

  useScrollToHashLink();

  useEffect(() => {
    navigate(WebPage.VERIFY, { replace: true });
  }, [navigate, oaBlob]);

  return (
    <StyledWrapper>
      <PublicPageDescriptor
        title={oaBlob ? VERIFICATION_RESULTS_PAGE_TITLE : VERIFICATION_OPTIONS_PAGE_TITLE}
        description={VERIFICATION_PAGE_DESCRIPTION}
        image={verifyFileImg}
      />
      <PublicPageContainer columnSize={oaBlob ? 12 : undefined}>
        {oaBlob ? (
          <VerificationResults
            oaBlob={oaBlob}
            clearOaBlob={() => setOaBlob(undefined)}
            verificationOption={verificationOption}
            setVerificationOption={setVerificationOption}
          />
        ) : (
          <VerificationOptions setOaBlob={setOaBlob} setVerificationOption={setVerificationOption} />
        )}
      </PublicPageContainer>

      <OaFaqSection />
    </StyledWrapper>
  );
}

export default Verify;
