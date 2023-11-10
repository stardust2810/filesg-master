import { Col, Divider, FSG_DEVICES, RESPONSIVE_VARIANT, TextLink, Typography, useShouldRender } from '@filesg/design-system';
import React from 'react';
import { isValidElement } from 'react';

import { PublicPageWithDescriptorBannerLayout } from '../../../components/layout/pages/public-page-descriptor-banner';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { ListContent } from '../../../typings';
import { PrivacyStatementAnnex } from './components/annex';
import { privacyStatementContent, privacyStatementIntro } from './consts';
import {
  StyledContainer,
  StyledIntroText,
  StyledLi,
  StyledOl,
  StyledOverallOl,
  StyledRelatedPagesContainer,
  StyledRelatedPagesHeaderContainer,
  StyledRelatedPagesLinksContainer,
  StyledSectionHeader,
  StyledText,
} from './style';

export interface PrivacyStatementSection {
  sectionTitle: string;
  content: string | JSX.Element | Array<string | JSX.Element | ListContent>;
}

// Meta Tags
const PAGE_TITLE = 'Privacy Statement';

const PrivacyStatement = (): JSX.Element => {
  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle(PAGE_TITLE);
  usePageDescription();

  // =============================================================================
  // Consts
  // =============================================================================
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  // ===========================================================================
  // Render
  // ===========================================================================
  function renderPrivacyStatementSections(privacyStatementSectionList: PrivacyStatementSection[]) {
    return (
      <StyledOverallOl>
        {privacyStatementSectionList.map((section, index) => (
          <React.Fragment key={`privacy-section-${index}`}>
            <StyledSectionHeader variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} bold="FULL">
              {section.sectionTitle}
            </StyledSectionHeader>
            {renderListContent(section.content)}
          </React.Fragment>
        ))}
      </StyledOverallOl>
    );
  }

  function renderListContent(listContent: string | JSX.Element | Array<string | JSX.Element | ListContent>) {
    if (typeof listContent === 'string' || isValidElement(listContent)) {
      return <StyledText variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</StyledText>;
    }

    return (listContent as ListContent[]).map((listContent, index) => {
      if (typeof listContent === 'string' || isValidElement(listContent)) {
        return (
          <StyledLi key={`privacy-content-${index}`}>
            <Typography variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{listContent}</Typography>
          </StyledLi>
        );
      }

      const { title, content } = listContent;

      return (
        <StyledLi key={`privacy-content-${index}`}>
          {title}
          {content && <StyledOl>{renderListContent(content)}</StyledOl>}
        </StyledLi>
      );
    });
  }

  return (
    <StyledContainer>
      <PublicPageWithDescriptorBannerLayout title="Privacy Statement">
        <Col column={isSmallerThanNormalTabletLandscape ? 12 : undefined}>
          <StyledIntroText variant={isSmallerThanSmallTablet ? 'BODY' : 'PARAGRAPH'}>{privacyStatementIntro}</StyledIntroText>
          {renderPrivacyStatementSections(privacyStatementContent)}
          <Divider verticalOffset={24} />
          <PrivacyStatementAnnex />
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
              <TextLink font="PARAGRAPH" type="LINK" to={WebPage.TERMS_OF_USE}>
                Terms of Use
              </TextLink>
              <TextLink endIcon="sgds-icon-external" newTab font="PARAGRAPH" type="ANCHOR" to={ExternalLink.CONTACT_US}>
                Contact Us
              </TextLink>
            </StyledRelatedPagesLinksContainer>
          </StyledRelatedPagesContainer>
        </Col>
      </PublicPageWithDescriptorBannerLayout>
    </StyledContainer>
  );
};

export default PrivacyStatement;
