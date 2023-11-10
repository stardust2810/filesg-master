import { Color } from '../../../../../../../styles/color';
import { FileSGProps, NavProps } from '../../../../../../../utils/typings';
import { Typography } from '../../../../../../data-display/typography';
import { StyledNavLink } from './style';

export type HeaderNavItem = NavProps & FileSGProps & { onDrawerClose?: () => void };

export const HeaderNavLink = ({ label, to, ...rest }: HeaderNavItem) => {
  return (
    <StyledNavLink
      data-testid={rest['data-testid']}
      to={to}
      children={({ isActive }) => (
        <Typography asSpan={true} variant={'BODY'} bold={isActive ? 'FULL' : undefined} color={Color.GREY80}>
          {label}
        </Typography>
      )}
    />
  );
};
