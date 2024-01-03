import { Col, Divider, FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';

import { PublicPageWithDescriptorBannerLayout } from '../../../components/layout/pages/public-page-descriptor-banner';
import { QuickLinks } from '../../../components/navigation/quick-links';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useScrollToHashLink } from '../../../hooks/common/useScrollToHashLink';
import { TermsOfUseListContent } from './components/list-content';
import { TermsOfUseSchedule } from './components/schedule';
import { StyledContainer } from './style';

// Meta Tags
const PAGE_TITLE = 'Terms of Use';

const TermsOfUse = (): JSX.Element => {
  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle(PAGE_TITLE);
  usePageDescription();

  useScrollToHashLink();

  // ===========================================================================
  // Const
  // ===========================================================================
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const relatedPagesLinks = [
    {
      to: WebPage.PRIVACY_STATEMENT,
      label: 'Privacy Statement',
    },
    {
      to: ExternalLink.CONTACT_US,
      label: 'Contact Us',
      isExternal: true,
    },
  ];
  return (
    <StyledContainer>
      <PublicPageWithDescriptorBannerLayout title="Terms of Use">
        <Col column={isSmallerThanNormalTabletLandscape ? 12 : undefined}>
          <TermsOfUseListContent />
          <Divider verticalOffset={24} />
          <TermsOfUseSchedule />
        </Col>
        {isSmallerThanNormalTabletLandscape && <Divider thick verticalOffset={24} />}
        <Col column={isSmallerThanNormalTabletLandscape ? 12 : 4}>
          <QuickLinks title="Related Pages" links={relatedPagesLinks} />
        </Col>
      </PublicPageWithDescriptorBannerLayout>
    </StyledContainer>
  );
};

export default TermsOfUse;
