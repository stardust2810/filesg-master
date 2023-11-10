import {
  Button,
  Col,
  Color,
  Divider,
  FSG_DEVICES,
  Level1Accordion,
  RESPONSIVE_VARIANT,
  Select,
  SideNavMenu,
  SideNavMenuItemProps,
  TextButton,
  Typography,
  useShouldRender,
} from '@filesg/design-system';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import faqIllustration from '../../../assets/images/faq/faq-illustration.svg';
import { PublicPageWithDescriptorBannerLayout } from '../../../components/layout/pages/public-page-descriptor-banner';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageDescription } from '../../../hooks/common/usePageDescription';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useScrollToHashLink } from '../../../hooks/common/useScrollToHashLink';
import { openLinkInNewTab } from '../../../utils/common';
import NotFoundError from '../errors/templates/not-found';
import { FaqListContent } from './components/faq-list-content';
import { Faq, FAQ_MASTER_OBJECT, FaqPageContent } from './consts';
import {
  StyledActionButtonWrapper,
  StyledColumn,
  StyledContactUsWrapper,
  StyledContainer,
  StyledSideNavMenu,
  StyledSideNavMenuTitleWrapper,
} from './style';

// Meta Tags
const PAGE_TITLE = 'Frequently Asked Questions';
const PAGE_DESCRIPTION = 'Get answers to frequently asked questions about FileSG.';

const selectOptions = Object.entries(FAQ_MASTER_OBJECT).reduce<{ label: string; value: string }[]>((prev, [_, obj]) => {
  return [...prev, { label: obj.title, value: obj.to }];
}, []);

const sideNavMenuItems = Object.entries(FAQ_MASTER_OBJECT).reduce<SideNavMenuItemProps[]>(
  (prev, [_, obj]) => [...prev, { label: obj.title, to: `${WebPage.FAQ}${obj.to}` }],
  [],
);

const FAQ_SUB_PAGES = [WebPage.ABOUT_FILESG, WebPage.RETRIEVING_YOUR_DOCUMENTS, WebPage.FILE_TYPE_AND_FORMAT, WebPage.DIGITAL_PASSES];

const Faq = (): JSX.Element => {
  const { subPage } = useParams<{ subPage: string }>();
  const { hash } = useLocation();
  const navigate = useNavigate();

  usePageTitle(PAGE_TITLE);
  usePageDescription(PAGE_DESCRIPTION);

  const [value, setValue] = useState('');
  const [expandAll, setExpandAll] = useState<boolean | undefined>(undefined);
  const [content, setContent] = useState<FaqPageContent | null>(null);

  useScrollToHashLink(undefined, 750);

  useEffect(() => {
    const faqSubPage = `/${subPage!}` as WebPage;
    const correctSubPage = FAQ_SUB_PAGES.includes(faqSubPage);
    const category = correctSubPage
      ? Object.entries(FAQ_MASTER_OBJECT).find(([_, pageContent]) => pageContent.to === faqSubPage)?.[0]
      : null;

    if (category) {
      setContent(FAQ_MASTER_OBJECT[category as keyof Faq]);
    }
  }, [subPage]);

  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);

  // ===========================================================================
  // Handler
  // ===========================================================================
  const handleOnActionButtonClick = () => {
    setExpandAll((prev) => !prev);
  };

  const handleOnContactUsButtonClick = () => {
    openLinkInNewTab(ExternalLink.CONTACT_US);
  };

  const handleOnSelectChange = (value?: string | number) => {
    const to = value ? `${WebPage.FAQ}${value}` : `${WebPage.FAQ}about-us`;
    setValue(to);
    setExpandAll(undefined);
  };
  // ===========================================================================
  // useEffect
  // ===========================================================================
  useEffect(() => {
    if (value) {
      navigate(value);
    }
  }, [navigate, value]);

  // ===========================================================================
  // Render
  // ===========================================================================
  if (content) {
    return (
      <StyledContainer>
        <PublicPageWithDescriptorBannerLayout title="Frequently Asked Questions" image={faqIllustration}>
          {isSmallerThanNormalTabletLandscape && (
            <StyledColumn column={12}>
              <Select icon="sgds-icon-list" options={selectOptions} defaultValue={content.to} onChange={handleOnSelectChange} />
            </StyledColumn>
          )}

          <Col>
            <Typography variant="H2" bold="FULL">
              {content.title}
            </Typography>
            <StyledActionButtonWrapper>
              <TextButton
                label={expandAll ? 'Collapse all' : 'Expand all'}
                color={Color.PURPLE_DEFAULT}
                onClick={handleOnActionButtonClick}
              />
            </StyledActionButtonWrapper>
            <Divider />

            {content.items.map((faq, index) => {
              const open = hash ? faq.id === hash.replace('#', '') : index === 0;
              return (
                <Level1Accordion
                  key={`${content.to.replace('/', '')}-${index}`}
                  title={faq.title}
                  toggleOpen={expandAll}
                  isInitiallyOpen={open}
                  id={faq.id}
                >
                  <FaqListContent answerContents={faq.content} toggleOpen={expandAll} />
                </Level1Accordion>
              );
            })}

            <StyledContactUsWrapper>
              <Typography variant="H4" bold="SEMI">
                Can't find what you are looking for?
              </Typography>

              <Button label="Contact Us" decoration="OUTLINE" onClick={handleOnContactUsButtonClick} endIcon="sgds-icon-external" />
            </StyledContactUsWrapper>
          </Col>

          {!isSmallerThanNormalTabletLandscape && (
            <Col column={4}>
              <StyledSideNavMenu>
                <StyledSideNavMenuTitleWrapper>
                  <Typography variant="H4" bold="FULL">
                    FAQ Categories
                  </Typography>
                </StyledSideNavMenuTitleWrapper>

                <SideNavMenu items={sideNavMenuItems} />
              </StyledSideNavMenu>
            </Col>
          )}
        </PublicPageWithDescriptorBannerLayout>
      </StyledContainer>
    );
  }

  return <NotFoundError />;
};

export default Faq;
