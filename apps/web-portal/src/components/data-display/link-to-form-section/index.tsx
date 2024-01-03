import { Col, FSG_DEVICES, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';

import betaTesterIllustration from '../../../assets/images/public-landing/plp-beta-tester-illustration.svg';
import { openLinkInNewTab } from '../../../utils/common';
import { SectionHeader } from '../plp-section-header';
import { StyledBetaTesterSection, StyledBetaTesterWrapper, StyledButton, StyledIllustration, StyledIllustrationWrapper } from './styles';

type Props = {
  title: string;
  description: string;
  buttonLabel: string;
  linkToForm: string;
  buttonAriaLabel: string;
};

export const LinkToFormSection = ({ title, description, buttonLabel, linkToForm, buttonAriaLabel }: Props): JSX.Element => {
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const isSmallerThanNormalTabletPortrait = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_PORTRAIT);

  const getDescriptionCol = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return 12;
    }
    if (isSmallerThanNormalTabletLandscape) {
      return 8;
    }
    return 6;
  };
  const getImgCol = () => {
    if (isSmallerThanNormalTabletPortrait) {
      return 12;
    }
    return 4;
  };
  return (
    <StyledBetaTesterSection>
      <StyledBetaTesterWrapper>
        <Col column={getDescriptionCol()} offset={isSmallerThanNormalTabletLandscape ? undefined : 1}>
          <SectionHeader title={title} description={description}></SectionHeader>
          <StyledButton
            label={buttonLabel}
            endIcon="sgds-icon-external"
            onClick={() => openLinkInNewTab(linkToForm)}
            aria-label={buttonAriaLabel}
          />
        </Col>
        <StyledIllustrationWrapper column={getImgCol()}>
          <StyledIllustration alt="" width={192} height={192} src={betaTesterIllustration} />
        </StyledIllustrationWrapper>
      </StyledBetaTesterWrapper>
    </StyledBetaTesterSection>
  );
};
