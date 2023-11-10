import { useState } from 'react';

import receiveFeatureImg from '../../../assets/images/public-landing/citizens/plp-feature-citizens-receive.svg';
import verifyFeatureImg from '../../../assets/images/public-landing/citizens/plp-feature-citizens-verify.svg';
import { FaqSection } from '../../../components/data-display/faq-section';
import { Feature, Features } from '../../../components/data-display/features-section';
import { Hero } from '../../../components/data-display/hero';
import { LinkToFormSection } from '../../../components/data-display/link-to-form-section';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { FAQ_MASTER_OBJECT, FaqItem } from '../faq/consts';
import { PageWrapper } from './styles';

// Meta Tags
const PAGE_TITLE = 'For Individuals';
const PAGE_DESCRIPTION = 'Helping you manage government-issued documents conveniently and safely.';

// Hero banner
const HERO_TITLE = 'Manage your government documents in one place, securely';
const HERO_DESCRIPTION = 'FileSG supports government agencies by allowing easy access to digital documents issued to you';

// Features
const FEATURES: Feature[] = [
  {
    title: 'Retrieve documents issued by the government',
    description: 'Get documents such as digital passes, certificates and notices issued directly to your FileSG account.',
    image: receiveFeatureImg,
    imageAlt: '',
    featureLinkLabel: 'Retrieve',
    featureLink: WebPage.RETRIEVE,
  },
  {
    title: 'Verify status of your documents',
    description: 'Check the real-time status of documents issued in the OpenAttestation file format (.oa) easily.',
    image: verifyFeatureImg,
    imageAlt: '',
    featureLinkLabel: 'Verify',
    featureLink: WebPage.VERIFY,
  },
];

// Faq
const FAQ_LIST = Object.entries(FAQ_MASTER_OBJECT).reduce<FaqItem[]>(
  (prev, [_, obj]) => [...prev, ...obj.items.filter((item) => item.isTopCitizenFaq)],
  [],
);

// Beta sign up
const BETA_TESTER_TITLE = 'Help us improve FileSG!';
const BETA_TESTER_DESCRIPTION =
  'FileSG is a new service in development. Get a preview and give feedback on our latest features before they are launched to the public. Sign up today to help improve your file management experience!';
const BETA_TESTER_BUTTON_LABEL = 'Sign up';
const BETA_TESTER_BUTTON_ARIA_LABEL = 'Sign up as a beta tester!';

const CitizensPublicLanding = (): JSX.Element => {
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  usePageTitle(PAGE_TITLE);
  usePageDescription(PAGE_DESCRIPTION);

  return (
    <PageWrapper>
      <Hero onLoad={() => setIsHeroLoaded(true)} title={HERO_TITLE} description={HERO_DESCRIPTION} />

      <Features shouldStartAnimation={isHeroLoaded} features={FEATURES} />

      <FaqSection faqList={FAQ_LIST} />

      <LinkToFormSection
        title={BETA_TESTER_TITLE}
        description={BETA_TESTER_DESCRIPTION}
        buttonLabel={BETA_TESTER_BUTTON_LABEL}
        linkToForm={ExternalLink.BETA_SIGN_UP}
        buttonAriaLabel={BETA_TESTER_BUTTON_ARIA_LABEL}
      />
    </PageWrapper>
  );
};

export default CitizensPublicLanding;
