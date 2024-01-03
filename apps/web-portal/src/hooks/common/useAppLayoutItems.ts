import { FEATURE_TOGGLE } from '@filesg/common';
import { FSG_DEVICES, HeaderItemProps, HeaderNavItem, RESPONSIVE_VARIANT, useShouldRender } from '@filesg/design-system';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { config } from '../../config/app-config';
import { SIDEBAR_ITEMS, WebPage } from '../../consts';
import { TOGGLABLE_FEATURES } from '../../consts/features';
import { selectHasUnexpectedError } from '../../store/slices/app';
import { selectNonSingpassVerified } from '../../store/slices/non-singpass-session';
import { selectIsCorporateUser, selectIsUserLoggedIn } from '../../store/slices/session';
import { isPathMatching, resetRedirectionPath } from '../../utils/common';
import { useLogout } from '../queries/useLogout';
import { useFeature } from './useFeature';
import { useAppSelector } from './useSlice';

// Auth related & error pages will use the default layout
const PUBLIC_PAGES = [
  WebPage.ROOT,
  WebPage.PUBLIC,
  WebPage.AGENCIES,
  WebPage.VERIFY,
  WebPage.RETRIEVE,
  `${WebPage.FAQ}/:subPage`,
  WebPage.PRIVACY_STATEMENT,
  WebPage.TERMS_OF_USE,
  WebPage.LOGOUT,
  WebPage.BROWSER_NOT_SUPPORTED,
];

const PROTECTED_PAGES = [WebPage.HOME, WebPage.ACTIVITIES, `${WebPage.ACTIVITIES}/:activityId`, WebPage.FILES, WebPage.PROFILE];
const NO_LAYOUT_PAGES = [`${WebPage.FILES}/:fileId`, WebPage.ONBOARDING];
const AUTH_PAGES = [WebPage.ICA_SSO_CALLBACK];

export const useAppLayoutItems = () => {
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const isUserLoggedIn = useAppSelector(selectIsUserLoggedIn);
  const isCorporateUser = useAppSelector(selectIsCorporateUser);
  const isNonSingpassVerified = useAppSelector(selectNonSingpassVerified);
  const hasUnexpectedError = useAppSelector(selectHasUnexpectedError);

  const isCorppassFeatureEnabled = useFeature(TOGGLABLE_FEATURES.FEATURE_CORPPASS);

  const [showMockLoginModal, setShowMockLoginModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileMenuBtnEl, setProfileMenuBtnEl] = useState<HTMLElement>();

  const [hasSideBar, setHasSideBar] = useState<boolean>();
  const [sideBarItems, setSideBarItems] = useState(SIDEBAR_ITEMS);

  const [hasMasthead, setHasMasthead] = useState<boolean>();
  const [showBetaBanner, setShowBetaBanner] = useState<boolean>();
  const [hasHeader, setHasHeader] = useState<boolean>();
  const [navItems, setNavItems] = useState<HeaderNavItem[]>([]);
  const [headerCollapsibleItems, setHeaderCollapsibleItems] = useState<HeaderItemProps[]>([]);
  const [headerUncollapsibleItems, setHeaderUncollapsibleItems] = useState<HeaderItemProps[]>([]);

  const [hasFooter, setHasFooter] = useState<boolean>();

  const navigate = useNavigate();

  const { pathname } = useLocation();

  const { mutate: logout } = useLogout();

  const publicPageNavItems = useMemo(
    () => [
      { label: 'For Individuals', to: WebPage.PUBLIC },
      { label: 'Retrieve', to: WebPage.RETRIEVE },
      { label: 'Verify', to: WebPage.VERIFY },
    ],
    [],
  );

  const profileMenuClickHandler = useCallback(
    (event) => {
      setProfileMenuBtnEl(event.currentTarget);
      if (!showProfileMenu) {
        setShowProfileMenu(true);
      } else {
        setShowProfileMenu(false);
      }
    },
    [showProfileMenu],
  );
  const loginHandler = useCallback(() => {
    if (isCorppassFeatureEnabled) {
      setShowLoginModal(true);
      return;
    }

    if (config.mockAuth === FEATURE_TOGGLE.ON) {
      setShowMockLoginModal(true);
      return;
    }

    navigate(`${WebPage.SINGPASS_AUTHCALLBACK}?isLoginAttempt=true`);
  }, [isCorppassFeatureEnabled, navigate]);

  function onProfileMenuClose() {
    setShowProfileMenu(false);
  }

  const profileMenuBtn: HeaderItemProps = useMemo(
    () => ({
      'aria-label': 'Open profile and log out menu',
      icon: isCorporateUser ? 'fsg-icon-business' : 'sgds-icon-person',
      onClick: profileMenuClickHandler,
      testLocatorName: 'my-profile',
    }),
    [profileMenuClickHandler, isCorporateUser],
  );

  const profileMenuItems: HeaderItemProps[] = useMemo(
    () => [
      {
        label: 'My Profile',
        to: WebPage.PROFILE,
      },
      {
        label: 'Log out',
        onClick: () => {
          logout();
        },
      },
    ],
    [logout],
  );
  const logInBtn: HeaderItemProps = useMemo(
    () => ({
      label: 'Log in',
      onClick: () => {
        resetRedirectionPath();
        loginHandler();
      },
    }),
    [loginHandler],
  );

  const appHeaderUncollapsibleItems = useMemo(() => (isUserLoggedIn ? [] : [logInBtn]), [logInBtn, isUserLoggedIn]);
  const appAuthenticatedCollapsibleItems = useMemo(
    () => (isSmallerThanNormalTabletLandscape ? profileMenuItems : [profileMenuBtn]),
    [isSmallerThanNormalTabletLandscape, profileMenuBtn, profileMenuItems],
  );
  useEffect(() => {
    if (isUserLoggedIn && isPathMatching(WebPage.ROOT, pathname)) {
      return;
    }
    const isActivityPage = isPathMatching(`${WebPage.ACTIVITIES}/:activityId`, pathname);
    switch (true) {
      case hasUnexpectedError || PUBLIC_PAGES.some((path) => isPathMatching(path, pathname)):
        setHasSideBar(false);
        setSideBarItems([]);

        setHasMasthead(true);
        setHasHeader(true);
        setNavItems(publicPageNavItems);
        setHeaderUncollapsibleItems(appHeaderUncollapsibleItems);
        setHeaderCollapsibleItems(isUserLoggedIn ? appAuthenticatedCollapsibleItems : []);
        setHasFooter(true);

        setShowBetaBanner(hasUnexpectedError ? !isUserLoggedIn : true);
        return;
      case PROTECTED_PAGES.some((path) => isPathMatching(path, pathname)):
        setHasSideBar(true);

        setHasMasthead(true);
        setHasHeader(true);
        setNavItems([]);
        if (isActivityPage && isNonSingpassVerified) {
          setSideBarItems([]);
          setNavItems(publicPageNavItems);
        } else {
          setSideBarItems(SIDEBAR_ITEMS);
          setNavItems([]);
        }

        setHeaderUncollapsibleItems(appHeaderUncollapsibleItems);
        setHeaderCollapsibleItems(isUserLoggedIn ? appAuthenticatedCollapsibleItems : []);

        setHasFooter(true);

        setShowBetaBanner(false);
        return;
      case AUTH_PAGES.some((path) => isPathMatching(path, pathname)):
        setHasSideBar(false);

        setHasMasthead(true);
        setHasHeader(false);

        setHasFooter(false);

        setShowBetaBanner(false);
        return;
      case NO_LAYOUT_PAGES.some((path) => isPathMatching(path, pathname)):
        setHasSideBar(false);

        setHasMasthead(false);
        setHasHeader(false);

        setHasFooter(false);

        setShowBetaBanner(false);
        return;
      default:
        setHasSideBar(false);
        setSideBarItems([]);

        setHasMasthead(true);
        setHasHeader(true);
        setNavItems(isUserLoggedIn ? [] : publicPageNavItems);
        setHeaderUncollapsibleItems(appHeaderUncollapsibleItems);
        setHeaderCollapsibleItems(isUserLoggedIn ? appAuthenticatedCollapsibleItems : []);

        setHasFooter(true);
        setShowBetaBanner(true);
    }
  }, [
    isNonSingpassVerified,
    hasUnexpectedError,
    appAuthenticatedCollapsibleItems,
    appHeaderUncollapsibleItems,
    pathname,
    publicPageNavItems,
    isUserLoggedIn,
  ]);

  return {
    hasFooter,
    hasMasthead,
    hasHeader,
    hasSideBar,
    sideBarItems,
    headerUncollapsibleItems,
    headerCollapsibleItems,
    navItems,
    showLoginModal,
    setShowLoginModal,
    showProfileMenu,
    profileMenuBtnEl,
    onProfileMenuClose,
    profileMenuItems,
    showBetaBanner,
    showMockLoginModal,
    setShowMockLoginModal,
  };
};
