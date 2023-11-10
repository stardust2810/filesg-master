import { Fragment } from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { toKebabCase } from '../../../utils/helper';
import { StyleProps } from '../../../utils/typings';
import { Divider } from '../divider';
import { ListExpandableItem } from './components/list-expandable-item';
import { IListItem, ListItem } from './components/list-item';

export type Props = {
  items: IListItem[];
  hasDivider?: boolean;
  defaultExpandAll?: boolean;
} & StyleProps;

/**
 * List is a organism component used to display continuous, vertical indexes of links or buttons
 */
export const List = ({ items, style, className, hasDivider = false, defaultExpandAll = false }: Props) => {
  return (
    <ul data-testid={TEST_IDS.LIST} style={style} className={className}>
      {items.map((item, index) => {
        if (item.dropdowns && item.dropdowns.length > 0) {
          const dropdownItems = item.dropdowns.map((menuItem, menuItemIndex) => (
            <ListItem
              className="fsg-list-nested-item"
              data-testid={`${TEST_IDS.LIST_ITEM}-${index}-nested-${menuItemIndex}-${menuItem.label && toKebabCase(menuItem.label)}`}
              {...menuItem}
              isNested={true}
              key={`drawer-list-item-${index}`}
            />
          ));
          return (
            <Fragment key={`drawer-list-expandable-item-${index}`}>
              <ListExpandableItem
                defaultExpandAll={defaultExpandAll}
                item={item}
                data-testid={`${TEST_IDS.LIST_ITEM}-${index}${item.label && '-' + toKebabCase(item.label)}`}
              >
                {dropdownItems}
              </ListExpandableItem>

              {hasDivider ? items.length - 1 === index ? null : <Divider key={`divider-${index}`} /> : null}
            </Fragment>
          );
        }

        return (
          <Fragment key={`drawer-list-item-${index}`}>
            <ListItem
              className="fsg-list-item"
              data-testid={`${TEST_IDS.LIST_ITEM}-${index}${item.label && '-' + toKebabCase(item.label)}`}
              {...item}
            />
            {hasDivider ? items.length - 1 === index ? null : <Divider key={`divider-${index}`} /> : null}
          </Fragment>
        );
      })}
    </ul>
  );
};
