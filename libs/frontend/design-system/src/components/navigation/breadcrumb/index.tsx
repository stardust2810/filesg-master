import React, { useState } from 'react';

import { TEST_IDS } from '../../../utils/constants';
import { FileSGProps } from '../../../utils/typings';
import { BreadcrumbCollapser } from './components/breadcrumb-collapser';
import { StyledList, StyledListItem, StyledNav, StyledSeparator } from './style';

export interface BreadcrumbItem {
  label: string;
  to: string;
}

interface Collapse {
  itemsBefore: number;
  itemsAfter: number;
}

export type Props = {
  items?: BreadcrumbItem[];
  separator?: string | JSX.Element;
  collapse?: Collapse;
  itemMaxWidth?: number;
  itemEllipsis?: boolean;
  reverse?: boolean;
  reverseIncludeLast?: boolean;
  children?: React.ReactNode;
} & FileSGProps;

export const Breadcrumb = ({
  items,
  separator = '/',
  collapse,
  itemMaxWidth = 100,
  itemEllipsis = true,
  reverse = false,
  reverseIncludeLast = true,
  children,
  className,
  ...rest
}: Props) => {
  let breadcrumb: JSX.Element[];
  let numOfSeparators = 0;
  const [expanded, setExpanded] = useState(false);

  const getWrappedItem = (item: React.ReactNode, index: number) => (
    <StyledListItem
      key={`${TEST_IDS.BREADCRUMB_ITEM}-${index}`}
      ellipsis={itemEllipsis}
      maxWidth={itemMaxWidth}
      data-testid={`${TEST_IDS.BREADCRUMB_ITEM}-${index}`}
    >
      {item}
    </StyledListItem>
  );

  const getWrappedSeparator = (index: number) => (
    <StyledSeparator key={`${TEST_IDS.BREADCRUMB_SEPARATOR}-${index}`} data-testid={TEST_IDS.BREADCRUMB_SEPARATOR}>
      {separator}
    </StyledSeparator>
  );

  const isBreadcrumbItem = (item: BreadcrumbItem | React.ReactNode): item is BreadcrumbItem => {
    return (item as BreadcrumbItem).to !== undefined;
  };

  function getBreadcrumb<T>(list: Array<T>) {
    const lastIndex = list.length - 1;

    return list.reduce<JSX.Element[]>((acc, item, index) => {
      const notLast = index < lastIndex;

      let wrappedItem: JSX.Element;
      if (isBreadcrumbItem(item)) {
        wrappedItem = getWrappedItem(<a href={item.to}>{item.label}</a>, index);
      } else {
        wrappedItem = getWrappedItem(item, index);
      }

      if (reverse) {
        if (notLast) {
          acc.push(getWrappedSeparator(index), wrappedItem);
          numOfSeparators += 1;
        } else {
          if (reverseIncludeLast) {
            acc.push(getWrappedSeparator(index), wrappedItem, getWrappedSeparator(index + 1));
          } else {
            acc.push(getWrappedSeparator(index), wrappedItem);
          }
        }
      }

      if (!reverse) {
        if (notLast) {
          acc.push(wrappedItem, getWrappedSeparator(index));
          numOfSeparators += 1;
        } else {
          acc.push(wrappedItem);
        }
      }
      return acc;
    }, []);
  }

  if (items && items.length > 0) {
    breadcrumb = getBreadcrumb(items);
  } else {
    const childrenArr = React.Children.toArray(children);
    breadcrumb = getBreadcrumb(childrenArr);
  }

  if (collapse) {
    const { itemsBefore, itemsAfter } = collapse;
    const totalItems = breadcrumb.length;

    if (!expanded && itemsBefore + itemsAfter < totalItems - numOfSeparators) {
      const before = reverse ? itemsBefore * 2 + 1 : itemsBefore * 2;
      const after = reverse ? totalItems - itemsAfter * 2 - 1 : totalItems - itemsAfter * 2;

      breadcrumb = [
        ...breadcrumb.slice(0, before),
        <BreadcrumbCollapser key="collapsed-seperator" onClick={() => setExpanded(true)} />,
        ...breadcrumb.slice(after, totalItems),
      ];
    }
  }

  return (
    <StyledNav className={className} data-testid={rest['data-testid'] ?? TEST_IDS.BREADCRUMB}>
      <StyledList>{breadcrumb}</StyledList>
    </StyledNav>
  );
};
