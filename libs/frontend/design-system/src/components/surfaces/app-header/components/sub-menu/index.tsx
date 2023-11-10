import { MouseEventHandler } from 'react';

import { StyleProps } from '../../../../../utils/typings';
import { IListItem } from '../../../../data-display/list/components/list-item';
import { SubMenuList } from '../sub-menu-list';
import { StyledMenu } from './style';

export type Props = {
  items: IListItem[];
  hasDivider?: boolean;
  anchorEl?: HTMLElement;
  onClose: MouseEventHandler;
} & StyleProps;

export const SubMenu = ({ items, hasDivider = false, anchorEl, onClose }: Props) => {
  return (
    <StyledMenu
      anchorEl={anchorEl}
      onClose={onClose}
      anchorPadding={{ vertical: 0 }}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <SubMenuList items={items} hasDivider={hasDivider} />
    </StyledMenu>
  );
};
