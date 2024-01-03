import { Col, Divider, FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';
import React from 'react';
import { isValidElement } from 'react';

import { PublicPageWithDescriptorBannerLayout } from '../../../components/layout/pages/public-page-descriptor-banner';
import { QuickLinks } from '../../../components/navigation/quick-links';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { ListContent } from '../../../typings';
import { PrivacyStatementAnnex } from './components/annex';
import { StyledLiWithoutNumbering } from './components/annex/style';
import { privacyStatementContent, privacyStatementIntro } from './consts';
import { StyledContainer, StyledIntroText, StyledLi, StyledOl, StyledOverallOl, StyledSectionHeader, StyledText } from './style';

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

  const relatedPagesLinks = [
    {
      to: WebPage.TERMS_OF_USE,
      label: 'Terms of Use',
    },
    {
      to: ExternalLink.CONTACT_US,
      label: 'Contact Us',
      isExternal: true,
    },
  ];
  // ===========================================================================
  // Render
  // ===========================================================================
  function renderPrivacyStatementSections(privacyStatementSectionList: PrivacyStatementSection[]) {
    return (
      <StyledOverallOl>
        {privacyStatementSectionList.map((section, index) => (
          <React.Fragment key={`privacy-section-${index}`}>
            <StyledLiWithoutNumbering>
              <StyledSectionHeader variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'} bold="FULL">
                {section.sectionTitle}
              </StyledSectionHeader>
            </StyledLiWithoutNumbering>
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
          <QuickLinks title="Related Pages" links={relatedPagesLinks} />
        </Col>
      </PublicPageWithDescriptorBannerLayout>
    </StyledContainer>
  );
};

export default PrivacyStatement;
