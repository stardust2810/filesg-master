import { Color } from '../../../../../styles/color';
import { TEST_IDS } from '../../../../../utils/constants';
import { FileSGProps, NavProps } from '../../../../../utils/typings';
import { Typography } from '../../../../data-display/typography';
import { StyledNavLink } from './style';

export type SideNavMenuItemProps = Pick<NavProps, 'to' | 'label'>;
type Props = SideNavMenuItemProps & FileSGProps;

export const SideNavMenuItem = ({ label, to, ...rest }: Props) => {
  return (
    <StyledNavLink
      to={to}
      data-testid={rest['data-testid'] ? TEST_IDS.SIDE_NAV_MENU_ITEM : rest['data-testid']}
      children={({ isActive }) => (
        <Typography variant="PARAGRAPH" bold={isActive ? 'SEMI' : undefined} color={isActive ? Color.PURPLE_DEFAULT : Color.GREY80}>
          {label}
        </Typography>
      )}
    />
  );
};
