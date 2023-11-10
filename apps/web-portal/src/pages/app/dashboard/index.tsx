import { Color, FSG_DEVICES, RESPONSIVE_VARIANT, ResponsiveRenderer, Typography, useShouldRender } from '@filesg/design-system';

import fileSGThumbnail from '../../../assets/images/dashboard/home-info-filesg.svg';
import ltvpThumbnail from '../../../assets/images/dashboard/home-info-ltvp.svg';
import productSurveyThumbnail from '../../../assets/images/dashboard/home-info-product-survey.svg';
import { RightSideBar } from '../../../components/data-display/right-side-bar';
import { ExternalLink, WebPage } from '../../../consts';
import { usePageTitle } from '../../../hooks/common/usePageTitle';
import { useAppSelector } from '../../../hooks/common/useSlice';
import {
  selectCorporateName,
  selectCorporateUen,
  selectIsCorporateUser,
  selectUserLastLoginAt,
  selectUserMaskedUin,
  selectUserName,
} from '../../../store/slices/session';
import { getLastLoginMessage, getTimeZone } from '../../../utils/common';
import { FAQ_MASTER_OBJECT } from '../faq/consts';
import { BetaSignUp } from './components/beta-sign-up-banner';
import { InfoCardTheme, Props as InfoCardProps } from './components/info-card';
import { InfoCards } from './components/info-cards';
import { RecentActivities } from './components/recent-activities';
import { RecentFiles } from './components/recent-files';
import {
  StyledActivitiesAndFilesContainer,
  StyledBannerContainer,
  StyledCorporateName,
  StyledPageContent,
  StyledPageDescriptorContainer,
  StyledPageTitle,
  StyledUserName,
  StyledWrapper,
} from './style';

const TEST_IDS = {
  PAGE_DESCRIPTOR: 'page-descriptor',
  PAGE_TITLE: 'page-title',
  PAGE_SUBTITLE: 'page-subtitle',
  LAST_LOGIN_MESSAGE: 'last-login-message',
  INFO_CARDS: 'info-cards',
  RECENT_ACTIVITIES: 'recent-activities',
  RECENT_FILES: 'recent-files',
};

const INFO_CARDS: InfoCardProps[] = [
  {
    title: 'What is FileSG?',
    link: `${WebPage.FAQ}${WebPage.ABOUT_FILESG}#${Object.entries(FAQ_MASTER_OBJECT)[0][1].items[0].id}`,
    cardTheme: InfoCardTheme.PURPLE,
    image: fileSGThumbnail,
  },
  {
    title: 'Digital LTVP/STP/DP [ICA] - FAQ',
    link: `${WebPage.FAQ}${WebPage.DIGITAL_PASSES}`,
    cardTheme: InfoCardTheme.CYAN,
    image: ltvpThumbnail,
  },
  {
    title: 'Your Feedback',
    link: `${ExternalLink.PRODUCT_FEEDBACK}`,
    isExternalLink: true,
    cardTheme: InfoCardTheme.ORANGE,
    image: productSurveyThumbnail,
  },
];

const FIRST_LOGIN_MESSAGE = 'This is your first login';

const Dashboard = (): JSX.Element => {
  const isSmallerThanSmallTablet = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.SMALL_TABLET);

  const userName = useAppSelector(selectUserName);
  const userMaskedUin = useAppSelector(selectUserMaskedUin);
  const lastLoginAt = useAppSelector(selectUserLastLoginAt);
  const corporateName = useAppSelector(selectCorporateName);
  const corporateUen = useAppSelector(selectCorporateUen);
  const isCorporateUser = useAppSelector(selectIsCorporateUser);

  // ===========================================================================
  // Page title
  // ===========================================================================
  usePageTitle('Home');

  return (
    <StyledWrapper>
      <StyledPageContent>
        <StyledPageDescriptorContainer data-testid={TEST_IDS.PAGE_DESCRIPTOR}>
          <StyledPageTitle data-testid={TEST_IDS.PAGE_TITLE}>
            {/* Note: page title font to follow breadcrumb style */}
            <Typography
              variant={isSmallerThanSmallTablet ? 'H3_MOBILE' : 'H3'}
              color={Color.GREY60}
              bold="MEDIUM"
              overrideFontFamily="Work Sans"
            >
              Welcome,
              <StyledUserName type="SEMI"> {userName || userMaskedUin}</StyledUserName>
              {isCorporateUser && <StyledCorporateName type="MEDIUM"> ({corporateName || `UEN: ${corporateUen}`})</StyledCorporateName>}
            </Typography>
          </StyledPageTitle>

          {lastLoginAt ? (
            <div>
              <Typography variant="SMALL" data-testid={TEST_IDS.LAST_LOGIN_MESSAGE}>
                {getLastLoginMessage(lastLoginAt)}
              </Typography>
              <Typography variant="SMALL" style={{ whiteSpace: 'nowrap' }}>{`(${getTimeZone()})`}</Typography>
            </div>
          ) : (
            <Typography variant="SMALL" data-testid={TEST_IDS.LAST_LOGIN_MESSAGE}>
              {FIRST_LOGIN_MESSAGE}
            </Typography>
          )}
        </StyledPageDescriptorContainer>

        <InfoCards infoCards={INFO_CARDS} />
        <StyledActivitiesAndFilesContainer>
          <RecentActivities />
          <RecentFiles />
        </StyledActivitiesAndFilesContainer>

        <ResponsiveRenderer variant={RESPONSIVE_VARIANT.SMALLER_THAN} device={FSG_DEVICES.SMALL_DESKTOP}>
          <StyledBannerContainer>
            <BetaSignUp />
          </StyledBannerContainer>
        </ResponsiveRenderer>
      </StyledPageContent>

      <ResponsiveRenderer variant={RESPONSIVE_VARIANT.LARGER_OR_EQUAL_TO} device={FSG_DEVICES.SMALL_DESKTOP}>
        <RightSideBar>
          <BetaSignUp />
        </RightSideBar>
      </ResponsiveRenderer>
    </StyledWrapper>
  );
};

export default Dashboard;
