import { useEffect, useMemo, useState } from 'react';

import { useShouldRender } from '../../../hooks/useShouldRender';
import { FSG_DEVICES, RESPONSIVE_VARIANT, TEST_IDS } from '../../../utils/constants';
import { FileSGLogo } from '../../data-display/fsg-logo';
import { IconButton } from '../../inputs/icon-button';
import { HeaderItem, HeaderItemProps } from './components/header-item';
import { HeaderActionItem } from './components/header-item/components/header-action-button';
import { HeaderNavItem, HeaderNavLink } from './components/header-item/components/header-nav-link';
import { StyledHeaderWrapper, StyledLogoButton, StyledLogoNavLink, StyledNavActionMenu, StyledNavMenu } from './style';

export type Props = {
  onLogoClick: string | (() => void);
  navItems?: HeaderNavItem[];
  uncollapsibleActionItems?: HeaderItemProps[];
  collapsibleActionItems?: HeaderItemProps[];
  forceShowMenuBtn?: boolean;
  onMenuButtonClick?: () => void;
  onDrawerClose?: () => void;
};

// to maintain const reference to prevent rerendering
const EMPTY_HEADER_NAV_ITEM_ARRAY: HeaderNavItem[] = [];
const EMPTY_HEADER_ITEM_ARRAY: HeaderItemProps[] = [];

export const AppHeader = ({
  onLogoClick,
  uncollapsibleActionItems = EMPTY_HEADER_ITEM_ARRAY,
  navItems = EMPTY_HEADER_NAV_ITEM_ARRAY,
  collapsibleActionItems = EMPTY_HEADER_ITEM_ARRAY,
  forceShowMenuBtn,
  onMenuButtonClick,
  onDrawerClose,
}: Props) => {
  const isSmallerThanNormalTabletLandscape = useShouldRender(RESPONSIVE_VARIANT.SMALLER_THAN, FSG_DEVICES.NORMAL_TABLET_LANDSCAPE);
  const [displayActionItems, setDisplayActionItems] = useState<(HeaderNavItem | HeaderActionItem)[]>([]);

  const allActionItems = useMemo(
    () => [...uncollapsibleActionItems, ...collapsibleActionItems],
    [collapsibleActionItems, uncollapsibleActionItems],
  );

  useEffect(() => {
    isSmallerThanNormalTabletLandscape ? setDisplayActionItems(uncollapsibleActionItems) : setDisplayActionItems(allActionItems);
  }, [allActionItems, isSmallerThanNormalTabletLandscape, uncollapsibleActionItems]);

  const hasMenuButton = forceShowMenuBtn || (forceShowMenuBtn === undefined && (collapsibleActionItems.length > 0 || navItems.length > 0));

  return (
    <StyledHeaderWrapper data-testid={TEST_IDS.HEADER}>
      {typeof onLogoClick === 'string' ? (
        <StyledLogoNavLink data-testid="filesg-home-btn" to={onLogoClick} aria-label="Go to FileSG homepage" onClick={onDrawerClose}>
          <FileSGLogo />
        </StyledLogoNavLink>
      ) : (
        <StyledLogoButton data-testid="filesg-home-btn" onClick={onLogoClick}>
          <FileSGLogo />
        </StyledLogoButton>
      )}

      <StyledNavMenu>
        {navItems.length > 0 &&
          !isSmallerThanNormalTabletLandscape &&
          navItems.map((item, index) => (
            <li key={`nav-item-${index}`}>
              <HeaderNavLink
                onDrawerClose={onDrawerClose}
                data-testid={
                  item.testLocatorName ? `${TEST_IDS.HEADER_NAV_LINK}-${item.testLocatorName}` : `${TEST_IDS.HEADER_NAV_LINK}-${index}`
                }
                {...item}
              />
            </li>
          ))}
      </StyledNavMenu>

      <StyledNavActionMenu>
        {displayActionItems.map((item, index) => (
          <HeaderItem {...item} key={`action-item-${index}`} onDrawerClose={onDrawerClose} />
        ))}

        {hasMenuButton && isSmallerThanNormalTabletLandscape && (
          <IconButton
            key="mobile-nav-menu-btn"
            decoration="GHOST"
            size="SMALL"
            color="DEFAULT"
            icon="sgds-icon-menu"
            data-testid={TEST_IDS.HEADER_MENU_BUTTON}
            onClick={onMenuButtonClick}
            aria-label="Open main navigation menu"
          />
        )}
      </StyledNavActionMenu>
    </StyledHeaderWrapper>
  );
};
