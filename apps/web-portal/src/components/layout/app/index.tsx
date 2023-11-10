import { AppLayoutTemplate } from '@filesg/design-system';
import { compose } from '@reduxjs/toolkit';

import { FOOTER_BOTTOM_SECTION_LINKS, FOOTER_DETAILS, FOOTER_SITEMAP_LINKS, FOOTER_TOP_SECTION_LINKS } from '../../../consts';
import { useAppLayoutItems } from '../../../hooks/common/useAppLayoutItems';
import { useScrollToTop } from '../../../hooks/common/useScrollToTop';
import { useUserAgentCheck } from '../../../hooks/common/useUserAgentCheck';
import { CenteredSpinner } from '../../feedback/centered-spinner';
import AuthenticationModal from '../../feedback/modal/authentication-modal';
import { ProfileMenu } from '../../navigation/profile-menu';
import { Router } from '../../router';
import { withAuthentication } from '../../router/components/withAuthentication';
import { withSessionModals } from '../../router/components/withSessionModals';
const { title, footerBackgrdColor, description, updatedDate } = FOOTER_DETAILS;

type Props = {
  isUserSessionDetailsLoading?: boolean;
};
const AppLayout = ({ isUserSessionDetailsLoading = false }: Props) => {
  const {
    showLoginModal,
    setShowLoginModal,
    showProfileMenu,
    profileMenuItems,
    profileMenuBtnEl,
    onProfileMenuClose,
    hasSideBar,
    sideBarItems,
    hasHeader,
    navItems,
    hasFooter,
    headerCollapsibleItems,
    headerUncollapsibleItems,
    hasMasthead,
    showBetaBanner,
  } = useAppLayoutItems();

  useScrollToTop();
  useUserAgentCheck();

  return (
    <>
      {showLoginModal && <AuthenticationModal showSingpassOptionsOnly={true} onCloseModal={() => setShowLoginModal(false)} />}
      {showProfileMenu && <ProfileMenu items={profileMenuItems} btnAnchorEl={profileMenuBtnEl} onClose={onProfileMenuClose} />}
      {isUserSessionDetailsLoading ? (
        <CenteredSpinner />
      ) : (
        <AppLayoutTemplate
          hasMasthead={hasMasthead}
          hasSideBar={hasSideBar}
          sidebarItems={sideBarItems}
          hasHeader={hasHeader}
          headerNavItems={navItems}
          hasFooter={hasFooter}
          headerCollapsibleItems={headerCollapsibleItems}
          headerUncollapsibleItems={headerUncollapsibleItems}
          router={<Router />}
          footerTitle={title}
          footerBackgrdColor={footerBackgrdColor}
          footerDescription={description}
          footerUpdatedDate={updatedDate}
          footerSitemapLinks={FOOTER_SITEMAP_LINKS}
          footerTopSectionLinks={FOOTER_TOP_SECTION_LINKS}
          footerBottomSectionLinks={FOOTER_BOTTOM_SECTION_LINKS}
          showBetaBanner={showBetaBanner}
        />
      )}
    </>
  );
};
const layoutEnhancements = compose(withSessionModals, withAuthentication);
const LayoutWithSessionTimeout = layoutEnhancements(AppLayout);

export default LayoutWithSessionTimeout;
