import { TEST_IDS } from '../../../utils/constants';
import { SideNavMenuItem, SideNavMenuItemProps } from './components/side-nav-menu-item';
import { StyledNavMenu } from './style';

interface Props {
  items: SideNavMenuItemProps[];
}

export const SideNavMenu = ({ items }: Props) => {
  return (
    <StyledNavMenu>
      {items.map(({ label, to }, index) => (
        <li key={`${TEST_IDS.SIDE_NAV_MENU_ITEM}-${index}`}>
          <SideNavMenuItem label={label} to={to} />
        </li>
      ))}
    </StyledNavMenu>
  );
};
