import { PropsWithChildren, useState } from 'react';

import { toKebabCase } from '../../../../../utils/helper';
import { FileSGProps } from '../../../../../utils/typings';
import { ExpandableProps, IListItem, ListItem } from '../list-item';
export type Props = {
  item: IListItem;
  itemIndex?: number;
  defaultExpandAll?: boolean;
} & FileSGProps;

export const ListExpandableItem = ({ item, itemIndex, children, defaultExpandAll = false, ...rest }: PropsWithChildren<Props>) => {
  const [open, setOpen] = useState(defaultExpandAll);

  const onExpandBtnClick = () => {
    setOpen((prev) => !prev);
  };

  const onLabelClick = () => {
    setOpen(true);
  };

  const expandableProps: ExpandableProps = {
    isExpandable: true,
    isExpanded: open,
    onExpandBtnClick: onExpandBtnClick,
    onLabelClick: onLabelClick,
  };

  return (
    <>
      <ListItem
        expandableProps={expandableProps}
        {...item}
        key={`sidenav-menu-item-${itemIndex}-${item.label && toKebabCase(item.label)}`}
        data-testid={rest['data-testid']}
      />
      {open && (
        <li>
          <ul>{children}</ul>
        </li>
      )}
    </>
  );
};
