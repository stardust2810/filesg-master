import { Col, Divider, FSG_DEVICES, RESPONSIVE_VARIANT, TextLink, Typography, useShouldRender } from '@filesg/design-system';

import { PublicPageWithDescriptorBannerLayout } from '../../../components/layout/pages/public-page-descriptor-banner';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useScrollToHashLink } from '../../../hooks/common/useScrollToHashLink';
import { TermsOfUseListContent } from './components/list-content';
import { TermsOfUseSchedule } from './components/schedule';
import { StyledContainer, StyledRelatedPagesContainer, StyledRelatedPagesHeaderContainer, StyledRelatedPagesLinksContainer } from './style';

// Meta Tags
const PAGE_TITLE = 'Terms of Use';

const TermsOfUse = (): JSX.Element => {
  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle(PAGE_TITLE);
  usePageDescription();

  useScrollToHashLink();

  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

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
          <StyledRelatedPagesContainer>
            <StyledRelatedPagesHeaderContainer>
              <Typography variant="H4" bold="FULL">
                Related Pages
              </Typography>
            </StyledRelatedPagesHeaderContainer>
            <StyledRelatedPagesLinksContainer>
              <TextLink font="PARAGRAPH" type="LINK" to={WebPage.PRIVACY_STATEMENT}>
                Privacy Statement
              </TextLink>
              <TextLink endIcon="sgds-icon-external" newTab={true} font="PARAGRAPH" type="ANCHOR" to={ExternalLink.CONTACT_US}>
                Contact Us
              </TextLink>
            </StyledRelatedPagesLinksContainer>
          </StyledRelatedPagesContainer>
        </Col>
      </PublicPageWithDescriptorBannerLayout>
    </StyledContainer>
  );
};

export default TermsOfUse;
