import { StyleProps } from '../../../../../utils/typings';
import { IListItem } from '../../../../data-display/list/components/list-item';
import { StyledList } from './style';

type Props = {
  items: IListItem[];
  hasDivider?: boolean;
} & StyleProps;

export const SubMenuList = ({ items, hasDivider = false }: Props) => {
  return <StyledList items={items} hasDivider={hasDivider} />;
};
