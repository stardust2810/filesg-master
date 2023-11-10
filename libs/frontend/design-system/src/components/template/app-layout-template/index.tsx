import { useState } from 'react';

import { Color } from '../../../styles/color';
import { FSG_DEVICES, RESPONSIVE_VARIANT } from '../../../utils/constants';
import { AnnouncementBanner } from '../../data-display/announcement-banner';
import { FileSGLogo } from '../../data-display/fsg-logo';
import { List } from '../../data-display/list';
import { IListItem } from '../../data-display/list/components/list-item';
import { Masthead } from '../../data-display/masthead';
import { IconButton } from '../../inputs/icon-button';
import { ResponsiveRenderer } from '../../layout/responsive-renderer';
import { Drawer } from '../../navigation/drawer';
import { Sidebar } from '../../navigation/side-bar';
import { AppHeader } from '../../surfaces/app-header';
import { HeaderItemProps } from '../../surfaces/app-header/components/header-item';
import { HeaderNavItem } from '../../surfaces/app-header/components/header-item/components/header-nav-link';
import { Footer, FooterLink } from '../../surfaces/footer';
import {
  BodyContainer,
  BodyRow,
  HeaderAndBodyContainer,
  LayoutContainer,
  NavBarContainer,
  StyledBannerWrapper,
  StyledSideNavContainer,
  StyledSideNavHeader,
} from './style';

export type Props = {
  homeRoute?: string;
  hasMasthead?: boolean;
  hasHeader?: boolean;
  headerNavItems?: HeaderNavItem[];
  headerCollapsibleItems?: HeaderItemProps[];
  headerUncollapsibleItems?: HeaderItemProps[];
  hasSideBar?: boolean;
  sidebarItems?: IListItem[];
  hasFooter?: boolean;
  footerTitle: string;
  footerBackgrdColor?: Color;
  footerDescription: string;
  footerUpdatedDate: Date;
  footerSitemapLinks?: FooterLink[];
  footerTopSectionLinks: FooterLink[];
  footerBottomSectionLinks: FooterLink[];
  router: JSX.Element;
  drawerTopPadding?: number;
  showBetaBanner?: boolean;
};

const BETA_TAG = 'Beta';
const BETA_DESCRIPTION =
  'FileSG is a new digital document service. Only selected government documents will be issued to your FileSG account.';
export function AppLayoutTemplate({
  homeRoute = '/',
  hasMasthead = true,
  hasHeader = true,
  hasFooter = true,
  hasSideBar = false,
  sidebarItems = [],
  headerNavItems = undefined,
  headerCollapsibleItems = undefined,
  headerUncollapsibleItems = undefined,
  router,
  footerTitle,
  footerBackgrdColor,
  footerDescription,
  footerUpdatedDate,
  footerSitemapLinks,
  footerTopSectionLinks,
  footerBottomSectionLinks,
  drawerTopPadding = 0,
  showBetaBanner = false,
}: Props) {
  const [isDrawerOpened, setIsDrawerOpened] = useState(false);

  const onDrawerClose = () => {
    setIsDrawerOpened(false);
  };
  const onMenuBtnClick = () => {
    setIsDrawerOpened((prevState) => !prevState);
  };

  const drawerItemSections: IListItem[][] = [];
  headerNavItems && headerNavItems.length > 0 && drawerItemSections.push(headerNavItems as IListItem[]);
  sidebarItems.length > 0 && drawerItemSections.push(sidebarItems);
  headerCollapsibleItems && headerCollapsibleItems.length > 0 && drawerItemSections.push(headerCollapsibleItems as IListItem[]);

  /**
   * If there is a case where
   *  - Got header
   *  - Got items in drawer section
   *  - Don't wanna show menu btn
   *
   * Change implementation of hasMenuItems
   */
  const hasMenuItems = drawerItemSections.length > 0;

  return (
    <LayoutContainer>
      {drawerItemSections.length > 0 && (
        <ResponsiveRenderer variant={RESPONSIVE_VARIANT.SMALLER_THAN} device={FSG_DEVICES.NORMAL_TABLET_LANDSCAPE}>
          <Drawer topPadding={`${drawerTopPadding ? drawerTopPadding / 16 : 0}rem`} isOpened={isDrawerOpened} onClose={onDrawerClose}>
            <StyledSideNavContainer>
              <StyledSideNavHeader>
                <FileSGLogo height={24} />
                <IconButton
                  aria-label="Close navigation menu"
                  color={'DEFAULT'}
                  size="SMALL"
                  onClick={onDrawerClose}
                  icon={'sgds-icon-cross'}
                  decoration={'GHOST'}
                />
              </StyledSideNavHeader>
              {drawerItemSections.map((sectionItems, index) => (
                <div onClick={onDrawerClose} key={`drawer-list-${index}`}>
                  <List items={sectionItems} key={`drawer-section-${index}`} defaultExpandAll />
                </div>
              ))}
            </StyledSideNavContainer>
          </Drawer>
        </ResponsiveRenderer>
      )}
      <HeaderAndBodyContainer>
        <NavBarContainer>
          {hasMasthead && <Masthead />}
          {hasHeader && (
            <AppHeader
              forceShowMenuBtn={hasMenuItems}
              navItems={headerNavItems}
              collapsibleActionItems={headerCollapsibleItems}
              uncollapsibleActionItems={headerUncollapsibleItems}
              onLogoClick={homeRoute}
              onMenuButtonClick={onMenuBtnClick}
              onDrawerClose={onDrawerClose}
            />
          )}
        </NavBarContainer>

        <BodyRow>
          {showBetaBanner && (
            <StyledBannerWrapper>
              <AnnouncementBanner type="FEATURE_TAG" tag={BETA_TAG} description={BETA_DESCRIPTION} />
            </StyledBannerWrapper>
          )}
          <BodyContainer>
            {hasSideBar && <Sidebar items={sidebarItems as IListItem[]} />}

            {router}
          </BodyContainer>
        </BodyRow>
      </HeaderAndBodyContainer>
      {hasFooter && (
        <Footer
          title={footerTitle}
          description={footerDescription}
          updatedDate={footerUpdatedDate}
          sitemapLinks={footerSitemapLinks}
          footerBackgrdColor={footerBackgrdColor}
          topSectionLinks={footerTopSectionLinks}
          bottomSectionLinks={footerBottomSectionLinks}
        />
      )}
    </LayoutContainer>
  );
}
