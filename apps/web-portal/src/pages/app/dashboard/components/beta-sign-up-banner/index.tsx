import { Typography } from '@filesg/design-system';

import BetaTesterImg from '../../../../../assets/images/dashboard/home-beta-tester.svg';
import { ExternalLink } from '../../../../../consts';
import { openLinkInNewTab } from '../../../../../utils/common';
import { StyledBanner, StyledButton, StyledContentWrapper, StyledImgContainer, StyledInfoContainer } from './style';
const BANNER_TITLE = 'Help us improve FileSG!';
const BANNER_INFO =
  'FileSG is a new service in development. Get a preview and give feedback on our latest features before they are launched to the public.';

const TEST_IDS = {
  BETA_SIGN_UP: 'beta-sign-up',
  BETA_SIGN_UP_BUTTON: 'beta-sign-up-btn',
  BETA_SIGN_UP_TITLE: 'beta-sign-up-title',
  BETA_SIGN_UP_INFO: 'beta-sign-up-info',
};

export const BetaSignUp = () => {
  const onClickHandler = () => {
    openLinkInNewTab(ExternalLink.BETA_SIGN_UP);
  };
  return (
    <StyledBanner data-testid={TEST_IDS.BETA_SIGN_UP}>
      <StyledContentWrapper>
        <StyledInfoContainer>
          <Typography variant="H4" bold="SEMI" overrideFontFamily="Work Sans" data-testid={TEST_IDS.BETA_SIGN_UP_TITLE}>
            {BANNER_TITLE}
          </Typography>
          <Typography variant="SMALL" data-testid={TEST_IDS.BETA_SIGN_UP_INFO}>
            {BANNER_INFO}
          </Typography>
        </StyledInfoContainer>
        <StyledButton
          size="SMALL"
          decoration="OUTLINE"
          color="DEFAULT"
          label={'Sign up'}
          data-testid={TEST_IDS.BETA_SIGN_UP_BUTTON}
          onClick={onClickHandler}
          endIcon={'sgds-icon-external'}
          aria-label="Sign up for user research"
        />
      </StyledContentWrapper>
      <StyledImgContainer>
        <img src={BetaTesterImg} alt=""></img>
      </StyledImgContainer>
    </StyledBanner>
  );
};
