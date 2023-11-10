import { FSG_DEVICES, Level1Accordion, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { useNavigate } from 'react-router-dom';

import iconsBackgoundImage from '../../../assets/images/common/faq-background.png';
import faqIllustration from '../../../assets/images/public-landing/plp-faq-illustration.svg';
import { WebPage } from '../../../consts';
import { FaqListContent } from '../../../pages/app/faq/components/faq-list-content';
import { FaqAccordionDetails } from '../../../pages/app/faq/consts';
import { openLinkInNewTab } from '../../../utils/common';
import { StyledButton, StyledFaqContent, StyledFaqSection, StyledFaqWrapper, StyledSectionHeader } from './styles';
const FAQ_TITLE = 'Frequently Asked Questions ';

type Props = {
  sectionDescription?: string;
  faqList: FaqAccordionDetails[];
  moreFaqExternalLink?: string;
};

export const FaqSection = ({ faqList, sectionDescription, moreFaqExternalLink }: Props): JSX.Element => {
  const isSmallerThanNormalDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_DESKTOP);
  const isSmallerThanSmallDesktop = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_DESKTOP);
  const isSmallerThanNormalTabletPortrait = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_PORTRAIT);
  const navigate = useNavigate();

  // Handler
  const onClickHandler = () => {
    if (moreFaqExternalLink) {
      openLinkInNewTab(moreFaqExternalLink);
      return;
    }
    navigate(WebPage.FAQ);
  };

  // Rendering
  const getFaqContentColumns = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return 12;
    }
    if (isSmallerThanSmallDesktop) {
      return 10;
    }
    if (isSmallerThanNormalDesktop) {
      return 8;
    }
    return 6;
  };

  return (
    <StyledFaqSection style={{ backgroundImage: `url(${iconsBackgoundImage})` }}>
      <StyledFaqWrapper>
        <StyledFaqContent column={getFaqContentColumns()}>
          <img alt="" src={faqIllustration} />
          <StyledSectionHeader isCentered title={FAQ_TITLE} description={sectionDescription} />
          {faqList.map((faq, index) => (
            <Level1Accordion key={index} title={faq.title}>
              <FaqListContent answerContents={faq.content} />
            </Level1Accordion>
          ))}
          <StyledButton
            decoration="SOLID"
            label={'More FAQ'}
            endIcon={'sgds-icon-arrow-right'}
            onClick={onClickHandler}
            aria-label="Go to main FAQ page"
          />
        </StyledFaqContent>
      </StyledFaqWrapper>
    </StyledFaqSection>
  );
};
