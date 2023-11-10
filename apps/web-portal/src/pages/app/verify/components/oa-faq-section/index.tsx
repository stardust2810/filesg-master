import { Bold, FSG_DEVICES, RESPONSIVE_VARIANT, Typography, useShouldRender } from '@filesg/design-system';

import iconsBackgoundImage from '../../../../../assets/images/common/faq-background.png';
import oaCompareImg from '../../../../../assets/images/verify/verify-oa-compare.svg';
import oaEncryptImg from '../../../../../assets/images/verify/verify-oa-encrypt.svg';
import oaValidImg from '../../../../../assets/images/verify/verify-oa-valid.svg';
import PublicPageContainer from '../../../../../components/layout/public-page-container';
import OaInfoCard from './oa-info-card';
import { StyledDescription, StyledOaFaqSection, StyledOaHeader, StyledOaInfoCards, StyledOaInfoHeader } from './style';

const TEST_IDS = {
  OA_SECTION_TITLE: 'oa-section-title',
  OA_SECTION_DESCRIPTION: 'oa-section-description',
  OA_INFO_HEADER: 'oa-info-header',
  OA_INFO_DESCRIPTION: 'oa-info-description',
};

export const OA_SECTION_ID = 'what-is-oa';
const OA_FAQ_HEADER = 'What is OA?';
const HOW_OA_WORKS_HEADER = 'How does OA verification work?';

const OA_INFO = [
  {
    description:
      'When an official OpenAttestation (OA) file is issued by the government, a unique digital code is tagged to it. This code, together with condensed information from the file, is stored in our records.',
    img: oaEncryptImg,
    imgAlt: '',
  },
  {
    description: 'When you open the OA file on this site, its contents will be compared with what was stored in our records.',
    img: oaCompareImg,
    imgAlt: '',
  },
  {
    description:
      "We'll check if the contents match and if the OA file comes from a recognised government body. This way, you’ll know if the file is valid when you try to view it.",
    img: oaValidImg,
    imgAlt: '',
  },
];

function OaFaqSection() {
  const isSmallerThanNormalTabletPortrait = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_PORTRAIT);
  return (
    <StyledOaFaqSection id={OA_SECTION_ID} style={{ backgroundImage: `url(${iconsBackgoundImage})` }}>
      <PublicPageContainer>
        <>
          <StyledOaHeader data-testid={TEST_IDS.OA_SECTION_TITLE}>
            <Typography variant={isSmallerThanNormalTabletPortrait ? 'H2' : 'DISPLAY2'} bold="FULL">
              {OA_FAQ_HEADER}
            </Typography>
          </StyledOaHeader>
          <StyledDescription data-testid={TEST_IDS.OA_SECTION_DESCRIPTION}>
            <Typography variant={isSmallerThanNormalTabletPortrait ? 'BODY' : 'PARAGRAPH'}>
              <Bold type="FULL">OpenAttestation (OA)</Bold> is an open-sourced framework to endorse and verify documents. Documents issued
              this way are cryptographically trustworthy and can be verified independently. OA files are not meant to be readable, but when
              shared with authorities, if requested, authorities can verify the documents’ authenticity and ensure they were not tampered
              with.
            </Typography>
          </StyledDescription>
          <StyledOaInfoHeader data-testid={TEST_IDS.OA_INFO_HEADER}>
            <Typography variant="H3" bold="FULL">
              {HOW_OA_WORKS_HEADER}
            </Typography>
          </StyledOaInfoHeader>
          <StyledOaInfoCards>
            {OA_INFO.map(({ description, img, imgAlt }, index) => (
              <OaInfoCard
                data-testid={`${TEST_IDS.OA_INFO_DESCRIPTION}-${index}`}
                key={index}
                description={description}
                img={img}
                imgAlt={imgAlt}
              ></OaInfoCard>
            ))}
          </StyledOaInfoCards>{' '}
        </>
      </PublicPageContainer>
    </StyledOaFaqSection>
  );
}

export default OaFaqSection;
