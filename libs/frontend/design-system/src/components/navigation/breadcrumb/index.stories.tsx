import { Meta, Story } from '@storybook/react';

import { Color } from '../../../styles/color';
import { Icon } from '../../data-display/icon';
import { Breadcrumb, Props } from '.';
import { StyledIconWrapper,StyledNavLink } from './style';

export default {
  title: 'Components/Navigation/Breadcrumb',
  component: Breadcrumb,
  argTypes: {
    itemMaxWidth: {
      description: 'Maximum width for each item in pixels',
    },
    items: {
      description: `Array of breadcrumb item to be populated (e.g. { label: 'page1': to: '/page1' }). Leave this undefined if to use children.`,
    },
    collapse: {
      description:
        'Make the breadcrumb collapsible by defining how many items should appear before and after the collapser.',
    },
    separator: {
      description: 'Separator that distance each breadcrum item, can be either string or JSX Element.',
    },
    itemEllipsis: {
      description: 'Whether to allow ellipsis for item with long text.',
    },
    reverse: {
      description: 'Whether to reverse the occurence of breadcrumb items and collapser.',
    },
    reverseIncludeLast: {
      description: 'Whether to include the last collapser item when reverse is true.',
    },
  },
} as Meta<Props>;

const Template: Story<Props> = (args) => <Breadcrumb {...args} />;

const items = [
  { label: 'Page-1', to: '/page-1' },
  { label: 'Page-2', to: '/page-2' },
  { label: 'Page-3', to: '/page-3' },
];

export const Default: Story<Props> = Template.bind({});
Default.args = {
  items,
};

export const Collapsible: Story<Props> = Template.bind({});
Collapsible.args = {
  items,
  collapse: { itemsBefore: 1, itemsAfter: 1 },
};

export const Ellipsible: Story<Props> = Template.bind({});
Ellipsible.args = {
  items: [
    { label: 'This is a very very very long page name', to: '/page-1' },
    { label: 'Page-2', to: '/page-2' },
    { label: 'Page-3', to: '/page-3' },
  ],
  collapse: { itemsBefore: 1, itemsAfter: 1 },
  itemEllipsis: true,
  itemMaxWidth: 100,
};

const children = items.map(({ label }, index) => (
  <StyledNavLink key={`nav-item-${index}`}>
    <StyledIconWrapper>
      <Icon size="ICON_MINI" icon="fsg-icon-circle-cross-solid" />
    </StyledIconWrapper>
    {label}
  </StyledNavLink>
));

export const ConfigurableChildren: Story<Props> = Template.bind({});
ConfigurableChildren.args = {
  collapse: { itemsBefore: 1, itemsAfter: 1 },
  separator: <Icon size="ICON_MINI" icon="sgds-icon-chevron-right" color={Color.GREY30} />,
  children,
};

export const ConfigurableChildrenReverse: Story<Props> = Template.bind({});
ConfigurableChildrenReverse.args = {
  collapse: { itemsBefore: 1, itemsAfter: 1 },
  separator: <Icon size="ICON_MINI" icon="sgds-icon-chevron-left" color={Color.GREY30} />,
  reverse: true,
  children,
};
